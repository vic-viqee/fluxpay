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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Your Subscriptions</h2>
      {subscriptions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{sub.planId.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">KES {sub.planId.amountKes.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      sub.status === 'PENDING_ACTIVATION' ? 'bg-yellow-100 text-yellow-800' :
                      sub.status === 'CANCELLED' || sub.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{moment(sub.nextBillingDate).format('YYYY-MM-DD')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{moment(sub.startDate).format('YYYY-MM-DD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No subscriptions found.</p>
      )}
    </div>
  );
};
