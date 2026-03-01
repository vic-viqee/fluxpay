import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  Users, 
  Search, 
  Plus, 
  ArrowLeft, 
  Smartphone, 
  Mail, 
  TrendingUp,
  Activity,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { AddSubscriptionModal } from '../components/AddSubscriptionModal';

interface ICustomer {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
  activeSubscriptions: number;
  totalSubscriptions: number;
  totalTransactions: number;
  successfulTransactions: number;
  totalRevenue: number;
}

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCustomerData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      
      const response = await api.get('/customers');
      setCustomers(response.data.customers);
      setSummary(response.data.summary);
    } catch (err: any) {
      console.error('Failed to fetch customer data:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleExportCSV = () => {
    if (customers.length === 0) return;

    const headers = [
      'Customer Name',
      'Phone Number',
      'Email',
      'Date Joined',
      'Active Subscriptions',
      'Total Revenue (KES)',
      'Successful Payments'
    ];

    const rows = customers.map(c => [
      c.name,
      c.phoneNumber,
      c.email || 'N/A',
      new Date(c.createdAt).toLocaleDateString(),
      c.activeSubscriptions,
      c.totalRevenue,
      c.successfulTransactions
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FluxPay_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phoneNumber.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatKES = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-10 w-48 bg-surface-bg rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-surface-bg rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-[400px] bg-surface-bg rounded-2xl animate-pulse"></div>
        </div>
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
              <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your subscriber base and payment history</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchCustomerData(true)}
              disabled={refreshing}
              className="p-2.5 bg-surface-bg border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={customers.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-bg border border-gray-700 hover:border-gray-500 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-main hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-main/20 transition-all active:scale-95"
            >
              <Plus size={20} />
              Add Customer
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface-bg border border-gray-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-main/10 rounded-xl text-main">
                <Users size={24} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Customers</p>
            </div>
            <p className="text-3xl font-bold">{summary.totalCustomers}</p>
          </div>
          <div className="bg-surface-bg border border-gray-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <TrendingUp size={24} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Lifetime Revenue</p>
            </div>
            <p className="text-3xl font-bold">{formatKES(summary.totalRevenue)}</p>
          </div>
          <div className="bg-surface-bg border border-gray-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-accent/10 rounded-xl text-accent">
                <Activity size={24} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Subscriptions</p>
            </div>
            <p className="text-3xl font-bold">{summary.activeSubscriptions}</p>
          </div>
        </div>

        {/* Search and Table */}
        <div className="bg-surface-bg border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-800">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, phone or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-primary-bg border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-main/50 transition-all"
              />
            </div>
          </div>

          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-primary-bg/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Subscriptions</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-primary-bg/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-main/10 rounded-full flex items-center justify-center text-main font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{customer.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tight">Joined {moment(customer.createdAt).format('MMM D, YYYY')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300 flex items-center gap-2">
                            <Smartphone size={14} className="text-gray-500" />
                            {customer.phoneNumber}
                          </p>
                          {customer.email && (
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <Mail size={14} className="text-gray-500" />
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${customer.activeSubscriptions > 0 ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-gray-800 text-gray-500'}`}>
                            {customer.activeSubscriptions} ACTIVE
                          </span>
                          <span className="text-xs text-gray-500">
                            of {customer.totalSubscriptions} total
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{formatKES(customer.totalRevenue)}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tight">{customer.successfulTransactions} successful payments</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/subscriptions`, { state: { filterPhone: customer.phoneNumber } })}
                          className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                          title="View Subscriptions"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No customers found</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-8">
                {searchTerm ? `We couldn't find any customers matching "${searchTerm}"` : "You haven't added any customers yet. Add a subscriber to start collecting payments."}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-8 py-3 bg-secondary hover:bg-teal-500 text-white rounded-xl font-bold shadow-lg transition-all"
                >
                  Create First Subscription
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AddSubscriptionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchCustomerData();
        }}
      />
    </div>
  );
};

export default Customers;
