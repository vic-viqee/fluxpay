import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { usePortalAuth } from '../../context/PortalAuthContext';

interface DashboardData {
  subscriptions: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  transactions: {
    recent: Array<{
      id: string;
      amount: number;
      status: string;
      date: string;
      accountReference: string;
      mpesaReceiptNo: string | null;
    }>;
  };
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
    createdAt: string;
  }>;
}

const PortalDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = usePortalAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('portalToken');
        const response = await api.get('/portal/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Subscriptions',
      value: data?.subscriptions.active ?? 0,
      icon: <CheckCircle size={24} />,
      color: 'bg-green-500',
      path: '/portal/subscriptions',
    },
    {
      label: 'Pending',
      value: data?.subscriptions.pending ?? 0,
      icon: <Clock size={24} />,
      color: 'bg-yellow-500',
      path: '/portal/subscriptions',
    },
    {
      label: 'Suspended',
      value: data?.subscriptions.suspended ?? 0,
      icon: <AlertCircle size={24} />,
      color: 'bg-red-500',
      path: '/portal/subscriptions',
    },
    {
      label: 'Invoices',
      value: data?.invoices.length ?? 0,
      icon: <Receipt size={24} />,
      color: 'bg-blue-500',
      path: '/portal/invoices',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
        <p className="text-gray-500">Here's an overview of your account</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={() => navigate(card.path)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h2>
          {data?.transactions.recent.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent transactions</p>
          ) : (
            <div className="space-y-3">
              {data?.transactions.recent.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{tx.accountReference}</p>
                    <p className="text-xs text-gray-400">
                      {tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">KES {tx.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                      tx.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/portal/transactions')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all transactions →
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Invoices</h2>
          {data?.invoices.length === 0 ? (
            <p className="text-gray-400 text-sm">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {data?.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">
                      Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">KES {inv.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate('/portal/invoices')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all invoices →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortalDashboard;
