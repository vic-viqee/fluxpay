import React from 'react';
import moment from 'moment';

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
  onCreateSubscription?: () => void;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ subscriptions, onCreateSubscription }) => {
  return (
    <div className="rounded-lg border border-surface-bg bg-surface-bg p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold text-white">Your Subscriptions</h2>
      {subscriptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-bg">
            <thead className="bg-primary-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Next Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-bg bg-surface-bg">
              {subscriptions.map((sub) => {
                const planName = sub.planId?.name || 'Deleted plan';
                const planAmount = typeof sub.planId?.amountKes === 'number' ? `KES ${sub.planId.amountKes.toLocaleString()}` : 'N/A';

                return (
                  <tr key={sub._id}>
                    <td className="whitespace-nowrap px-6 py-4 text-white">{planName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-white">{planAmount}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          sub.status === 'ACTIVE'
                            ? 'bg-secondary text-white'
                            : sub.status === 'PENDING_ACTIVATION'
                              ? 'bg-accent text-white'
                              : sub.status === 'CANCELLED' || sub.status === 'EXPIRED'
                                ? 'bg-accent text-white'
                                : 'bg-gray-600 text-gray-200'
                        }`}
                      >
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-300">{moment(sub.nextBillingDate).format('YYYY-MM-DD')}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-300">{moment(sub.startDate).format('YYYY-MM-DD')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="mb-4 text-gray-400">You don't have any subscriptions yet.<br />Create one if you charge clients monthly.</p>
          {onCreateSubscription ? (
            <button
              onClick={onCreateSubscription}
              className="rounded bg-secondary px-4 py-2 font-bold text-white hover:bg-teal-500"
            >
              Create Subscription
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
