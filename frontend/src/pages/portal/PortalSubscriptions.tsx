import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle, Pause } from 'lucide-react';
import api from '../../services/api';

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  paymentFailureCount: number;
  gracePeriodEndsAt: string | null;
  merchantName: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PENDING_ACTIVATION: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  SUSPENDED: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  PAUSED: { label: 'Paused', color: 'bg-blue-100 text-blue-700', icon: Pause },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const PortalSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('portalToken');
        const response = await api.get('/portal/subscriptions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptions(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={32} className="animate-spin text-blue-600" /></div>;

  if (error) return <div className="p-6"><div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{error}</div></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400">No subscriptions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const config = statusConfig[sub.status] || { label: sub.status, color: 'bg-gray-100 text-gray-600', icon: XCircle };
            const Icon = config.icon;

            return (
              <div
                key={sub.id}
                onClick={() => navigate(`/portal/subscriptions/${sub.id}`)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{sub.merchantName}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Started</p>
                    <p className="font-medium text-gray-800">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Next Billing</p>
                    <p className="font-medium text-gray-800">
                      {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Failed Payments</p>
                    <p className="font-medium text-gray-800">{sub.paymentFailureCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Grace Ends</p>
                    <p className="font-medium text-gray-800">
                      {sub.gracePeriodEndsAt ? new Date(sub.gracePeriodEndsAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortalSubscriptions;
