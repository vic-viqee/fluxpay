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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M-Pesa Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td className="px-6 py-4 whitespace-nowrap">KES {txn.amountKes.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      txn.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                      txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      txn.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{txn.mpesaReceiptNo || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{moment(txn.transactionDate).format('YYYY-MM-DD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No recent transactions found.</p>
      )}
    </div>
  );
};
