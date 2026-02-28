import React from 'react';
import moment from 'moment';
import { CreditCard, Plus, Calendar, User, ArrowRight } from 'lucide-react';

interface ISubscription {
  _id: string;
  clientId: string;
  planId?: {
    _id: string;
    name: string;
    amountKes: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
  } | null;
  ownerId: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  nextBillingDate: string;
  notes?: string;
  client?: { name: string; phoneNumber: string; email?: string };
}

interface SubscriptionsTableProps {
  subscriptions: ISubscription[];
  isLoading?: boolean;
  onCreateSubscription?: () => void;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ 
  subscriptions, 
  isLoading, 
  onCreateSubscription 
}) => {
  if (isLoading) {
    return (
      <div className="bg-surface-bg rounded-xl border border-gray-800 overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-12 w-12 bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-bg rounded-xl border border-gray-800 overflow-hidden shadow-sm">
      {subscriptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-primary-bg/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Subscriber & Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Next Billing</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {subscriptions.map((sub) => {
                const planName = sub.planId?.name || 'Deleted plan';
                const planAmount = typeof sub.planId?.amountKes === 'number' ? `KES ${sub.planId.amountKes.toLocaleString()}` : 'N/A';
                
                return (
                  <tr key={sub._id} className="hover:bg-primary-bg/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-main/10 rounded-lg text-main group-hover:bg-main group-hover:text-white transition-colors">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{planName}</p>
                          <p className="text-xs text-gray-400">ID: {sub._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{planAmount}</p>
                      <p className="text-xs text-gray-500 uppercase">{sub.planId?.frequency || 'One-time'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                          sub.status === 'ACTIVE'
                            ? 'bg-secondary/10 text-secondary border-secondary/20'
                            : sub.status === 'PENDING_ACTIVATION'
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          sub.status === 'ACTIVE' ? 'bg-secondary' : 
                          sub.status === 'PENDING_ACTIVATION' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar size={14} className="text-gray-500" />
                        {moment(sub.nextBillingDate).format('MMM D, YYYY')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 px-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600">
            <CreditCard size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No subscriptions found</h3>
          <p className="text-gray-400 max-w-xs mx-auto mb-6">
            You haven't set up any recurring billing yet. Start by creating a subscription for a client.
          </p>
          {onCreateSubscription && (
            <button
              onClick={onCreateSubscription}
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 font-bold text-white hover:bg-teal-500 transition-all shadow-lg active:scale-95"
            >
              <Plus size={18} />
              Create Subscription
            </button>
          )}
        </div>
      )}
    </div>
  );
};
