import React from 'react';
import moment from 'moment';
import { Activity, CheckCircle2, XCircle, Clock, Receipt, ArrowRight, ExternalLink } from 'lucide-react';

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
  isLoading?: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-surface-bg rounded-xl border border-gray-800 overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-bg rounded-xl border border-gray-800 overflow-hidden shadow-sm">
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-primary-bg/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Transaction Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">M-Pesa Receipt</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.map((txn) => (
                <tr key={txn._id} className="hover:bg-primary-bg/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        txn.status === 'SUCCESS' ? 'bg-secondary/10 text-secondary' : 
                        txn.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        <Receipt size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">KES {txn.amountKes.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{txn.darajaRequestId.slice(0, 12)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      txn.status === 'SUCCESS' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                      txn.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {txn.status === 'SUCCESS' ? <CheckCircle2 size={12} /> : 
                       txn.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-medium ${txn.mpesaReceiptNo ? 'text-gray-300' : 'text-gray-600 italic'}`}>
                      {txn.mpesaReceiptNo || 'Pending receipt'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400">
                      <p>{moment(txn.transactionDate).format('MMM D, YYYY')}</p>
                      <p className="text-[10px]">{moment(txn.transactionDate).format('h:mm A')}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-500 hover:text-white" title="View Details">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 px-6">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600">
            <Activity size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No transactions yet</h3>
          <p className="text-gray-400 max-w-xs mx-auto mb-6">
            Your transaction history will appear here once you start receiving payments from your clients.
          </p>
          <a 
            href="/documentation" 
            className="inline-flex items-center gap-2 text-sm font-bold text-main hover:underline"
          >
            Learn how payments work <ArrowRight size={14} />
          </a>
        </div>
      )}
    </div>
  );
};
