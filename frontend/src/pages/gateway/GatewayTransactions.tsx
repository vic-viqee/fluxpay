import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Filter, RefreshCw, CheckCircle, RotateCcw, X } from 'lucide-react';
import { gatewayTransactions, mpesa, reversal } from '../../services/gatewayApi';

const GatewayTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);
  const [reversalResult, setReversalResult] = useState<any>(null);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, status, dateRange]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await gatewayTransactions.getAll({
        page: pagination.page,
        limit: 20,
        status: status || undefined,
        search: search || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined
      });
      setTransactions(data.data);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchTransactions();
  };

  const exportCSV = () => {
    const headers = ['Date', 'Customer', 'Phone', 'Amount', 'Status', 'Reference', 'Receipt'];
    const rows = transactions.map(tx => [
      new Date(tx.transactionDate).toLocaleString(),
      tx.customerId?.name || tx.phoneNumber,
      tx.phoneNumber,
      tx.amountKes,
      tx.status,
      tx.accountReference,
      tx.mpesaReceiptNo || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const checkTransactionStatus = async (tx: any) => {
    if (!tx.checkoutRequestId || checkingStatus) return;
    setCheckingStatus(tx._id);
    try {
      const result = await mpesa.checkStatus(tx.checkoutRequestId);
      if (result.TransactionStatus) {
        if (result.TransactionStatus === 'Completed') {
          await fetchTransactions();
        }
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    } finally {
      setCheckingStatus(null);
    }
  };

  const openReversalModal = (tx: any) => {
    setSelectedTx(tx);
    setReversalReason('');
    setReversalResult(null);
    setShowReversalModal(true);
  };

  const handleReversal = async () => {
    if (!selectedTx || !reversalReason) return;
    setReversing(true);
    try {
      const result = await reversal.initiate({
        transactionId: selectedTx._id,
        reason: reversalReason
      });
      setReversalResult(result.reversal);
    } catch (err: any) {
      setReversalResult({ status: 'FAILED', responseDescription: err.response?.data?.message || 'Reversal failed' });
    } finally {
      setReversing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500">View and manage all payment transactions</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by phone, reference, receipt..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            <Filter size={18} />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No transactions found</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(tx.transactionDate).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{tx.customerId?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{tx.phoneNumber}</p>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      KES {tx.amountKes.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{tx.accountReference}</td>
                    <td className="p-4 text-sm text-gray-600">{tx.mpesaReceiptNo || '-'}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {tx.status === 'PENDING' && tx.checkoutRequestId && (
                          <button
                            onClick={() => checkTransactionStatus(tx)}
                            disabled={checkingStatus === tx._id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Check payment status"
                          >
                            {checkingStatus === tx._id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <RefreshCw size={16} />
                            )}
                          </button>
                        )}
                        {tx.status === 'SUCCESS' && (
                          <button
                            onClick={() => openReversalModal(tx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reverse transaction"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {Math.min((pagination.page - 1) * 20 + 1, pagination.total)} - {Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Reversal Modal */}
      {showReversalModal && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowReversalModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <button
              onClick={() => setShowReversalModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>

            {!reversalResult ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <RotateCcw size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Reverse Transaction</h2>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-gray-800">KES {selectedTx.amountKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Receipt</span>
                    <span className="font-mono text-sm text-gray-600">{selectedTx.mpesaReceiptNo || 'N/A'}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for reversal</label>
                  <textarea
                    value={reversalReason}
                    onChange={(e) => setReversalReason(e.target.value)}
                    placeholder="e.g., Customer paid wrong amount, duplicate payment..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  onClick={handleReversal}
                  disabled={reversing || !reversalReason}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reversing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={18} />
                      Confirm Reversal
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  {reversalResult.status === 'SUCCESS' ? (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X size={32} className="text-red-600" />
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-gray-800">
                    {reversalResult.status === 'SUCCESS' ? 'Reversal Initiated' : 'Reversal Failed'}
                  </h2>
                  <p className="text-gray-500 mt-2">{reversalResult.responseDescription}</p>
                </div>

                <button
                  onClick={() => setShowReversalModal(false)}
                  className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayTransactions;
