import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  amountKes: number;
  vatAmount: number;
  status: string;
  dueDate: string;
  billingPeriod: string | null;
  paidDate: string | null;
  mpesaReceiptNo: string | null;
}

const statusColor: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const PortalInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('portalToken');
        let url = `/portal/invoices?page=${page}&limit=20`;
        if (statusFilter) url += `&status_filter=${statusFilter}`;
        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, statusFilter]);

  const filters = [null, 'PAID', 'OVERDUE', 'SENT', 'DRAFT'];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Invoices</h1>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">{error}</div>}

      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => { setStatusFilter(f); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              statusFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400">No invoices found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Invoice</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">VAT</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Due Date</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Receipt</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{inv.billingPeriod || '-'}</td>
                    <td className="py-3 px-4 text-gray-800">KES {inv.amountKes.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">KES {inv.vatAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">KES {inv.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600">{inv.mpesaReceiptNo || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
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

export default PortalInvoices;
