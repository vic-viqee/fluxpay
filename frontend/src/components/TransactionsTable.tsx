import React from 'react';
import moment from 'moment';

interface ITransaction {
  _id: string;
  subscriptionId: string;
  ownerId: string;
  amountKes: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  mpesaReceiptNo?: string;
  darajaRequestId: string;
  retryCount: number;
  transactionDate: string;
}

interface TransactionsTableProps {
  transactions: ITransaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  return (
    <div className="bg-surface-bg rounded-lg shadow-md p-6 border border-surface-bg">
      <h2 className="text-xl font-bold mb-4 text-white">Recent Transactions</h2>
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-bg">
            <thead className="bg-primary-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">M-Pesa Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-surface-bg divide-y divide-surface-bg">
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-white">KES {txn.amountKes.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      txn.status === 'SUCCESS' ? 'bg-secondary text-white' :
                      txn.status === 'PENDING' ? 'bg-accent text-white' :
                      txn.status === 'FAILED' ? 'bg-accent text-white' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{txn.mpesaReceiptNo || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{moment(txn.transactionDate).format('YYYY-MM-DD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="mb-4 text-gray-400">No payments yet. <br/> Your transactions will appear here once a client pays.</p>
          <a href="/documentation#payments" className="text-main hover:underline">
            Learn how payments work
          </a>
        </div>
      )}
    </div>
  );
};
