import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../../services/api';

interface SubscriptionDetail {
  id: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  paymentFailureCount: number;
  lastPaymentAttempt: string | null;
  suspendedAt: string | null;
  gracePeriodEndsAt: string | null;
  merchantName: string;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700' },
  PENDING_ACTIVATION: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  SUSPENDED: { label: 'Suspended', color: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
  PAUSED: { label: 'Paused', color: 'bg-blue-100 text-blue-700' },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-600' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

const PortalSubscriptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sub, setSub] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('portalToken');
        const response = await api.get(`/portal/subscriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSub(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load subscription');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem('portalToken');
      await api.post(`/portal/subscriptions/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCancelSuccess(true);
      setSub((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to cancel');
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  if (error && !sub) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div>
    </div>
  );

  if (!sub) return null;

  const config = statusConfig[sub.status] || { label: sub.status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate('/portal/subscriptions')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft size={20} />
        <span>Back to Subscriptions</span>
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Subscription Details</h1>
            <p className="text-sm text-gray-500">{sub.merchantName}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-lg font-medium ${config.color}`}>{config.label}</span>
        </div>

        {cancelSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700 text-sm">
            Subscription has been cancelled successfully.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Started</p>
            <p className="font-medium text-gray-800">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Next Billing</p>
            <p className="font-medium text-gray-800">{sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Failed Payments</p>
            <p className="font-medium text-gray-800">{sub.paymentFailureCount}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-400 text-xs">Last Payment Attempt</p>
            <p className="font-medium text-gray-800">{sub.lastPaymentAttempt ? new Date(sub.lastPaymentAttempt).toLocaleDateString() : 'N/A'}</p>
          </div>
          {sub.suspendedAt && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Suspended At</p>
              <p className="font-medium text-gray-800">{new Date(sub.suspendedAt).toLocaleDateString()}</p>
            </div>
          )}
          {sub.gracePeriodEndsAt && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">Grace Period Ends</p>
              <p className="font-medium text-gray-800">{new Date(sub.gracePeriodEndsAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {(sub.status === 'ACTIVE' || sub.status === 'SUSPENDED') && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel Subscription
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">
                    Are you sure you want to cancel this subscription? You will lose access to services associated with it.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg text-sm font-medium"
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Invoices</h2>
        {sub.invoices.length === 0 ? (
          <p className="text-gray-400 text-sm">No invoices yet</p>
        ) : (
          <div className="space-y-2">
            {sub.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-400">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</p>
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
      </div>
    </div>
  );
};

export default PortalSubscriptionDetail;
