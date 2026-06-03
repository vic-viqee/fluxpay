import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  date: string;
  phoneNumber: string;
  accountReference: string;
  mpesaReceiptNo: string | null;
  paymentMethod: string;
}

const statusIcon: Record<string, any> = {
  SUCCESS: CheckCircle,
  FAILED: XCircle,
  PENDING: Clock,
  CANCELLED: XCircle,
};

const statusColor: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const PortalTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('portalToken');
        const response = await api.get(`/portal/transactions?page=${page}&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  if (loading && page === 1) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h1>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">{error}</div>}

      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400">No transactions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Reference</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Receipt</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const Icon = statusIcon[tx.status] || Clock;
                  const color = statusColor[tx.status] || 'bg-gray-100 text-gray-600';

                  return (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">{tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{tx.accountReference}</td>
                      <td className="py-3 px-4 font-bold text-gray-800">KES {tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{tx.phoneNumber}</td>
                      <td className="py-3 px-4 text-gray-600">{tx.mpesaReceiptNo || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${color}`}>
                          <Icon size={12} />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PortalTransactions;
