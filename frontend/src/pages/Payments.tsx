import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  History, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { TransactionsTable } from '../components/TransactionsTable';

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransactions = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      
      const response = await api.get('/transactions');
      setTransactions(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    // Define CSV headers
    const headers = [
      'Transaction ID',
      'Date',
      'Amount (KES)',
      'Status',
      'M-Pesa Receipt',
      'Request ID',
      'Retries'
    ];

    // Map transaction data to rows
    const rows = transactions.map(t => [
      t._id,
      new Date(t.transactionDate).toLocaleString(),
      t.amountKes,
      t.status,
      t.mpesaReceiptNo || 'N/A',
      t.darajaRequestId,
      t.retryCount
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(value => `"${value}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FluxPay_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(t => 
    t.darajaRequestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.mpesaReceiptNo && t.mpesaReceiptNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-surface-bg border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
              <p className="text-gray-400 text-sm mt-1">History of all M-Pesa collections and STK pushes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchTransactions(true)}
              disabled={refreshing}
              className="p-2.5 bg-surface-bg border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-bg border border-gray-700 hover:border-gray-500 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Stats & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 bg-surface-bg border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by Receipt No or Status..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-primary-bg border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-main/50 transition-all"
              />
            </div>
            <button className="p-2.5 bg-primary-bg border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-all">
              <Filter size={20} />
            </button>
          </div>
          
          <div className="bg-surface-bg border border-gray-800 rounded-2xl p-4 flex items-center justify-between px-6">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Volume</p>
              <p className="text-xl font-bold text-secondary">
                KES {transactions.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + t.amountKes, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <History size={20} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-bg border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <TransactionsTable transactions={filteredTransactions} isLoading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Payments;
