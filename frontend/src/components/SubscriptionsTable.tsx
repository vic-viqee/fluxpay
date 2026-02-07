import React from 'react';
import moment from 'moment';

interface ISubscription {
  _id: string;
  clientId: string;
  planId: { // Populated ServicePlan
    _id: string;
    name: string;
    amountKes: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
  };
  ownerId: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  nextBillingDate: string;
  notes?: string;
  // Assuming client data might also be populated for display if needed
  client?: { name: string; phoneNumber: string; email?: string };
}

interface SubscriptionsTableProps {
  subscriptions: ISubscription[];
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ subscriptions }) => {
  return (
    <div className="bg-surface-bg rounded-lg shadow-md p-6 border border-surface-bg">
      <h2 className="text-xl font-bold mb-4 text-white">Your Subscriptions</h2>
      {subscriptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-bg">
            <thead className="bg-primary-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Next Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</th>
              </tr>
            </thead>
            <tbody className="bg-surface-bg divide-y divide-surface-bg">
              {subscriptions.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">{sub.planId.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">KES {sub.planId.amountKes.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sub.status === 'ACTIVE' ? 'bg-secondary text-white' :
                      sub.status === 'PENDING_ACTIVATION' ? 'bg-accent text-white' :
                      sub.status === 'CANCELLED' || sub.status === 'EXPIRED' ? 'bg-accent text-white' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{moment(sub.nextBillingDate).format('YYYY-MM-DD')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{moment(sub.startDate).format('YYYY-MM-DD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="mb-4 text-gray-400">You don’t have any subscriptions yet. <br/> Create one if you charge clients monthly.</p>
          <button
            className="bg-secondary hover:bg-teal-500 text-white font-bold py-2 px-4 rounded"
            // onClick handler will be added later
          >
            Create Subscription
          </button>
        </div>
      )}
    </div>
  );
};
