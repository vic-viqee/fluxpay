import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Clock, 
  AlertCircle,
  Users,
  QrCode
} from 'lucide-react';
import { gatewayDashboard } from '../../services/gatewayApi';

const GatewayDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await gatewayDashboard.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { today, month, recentTransactions, totalCustomers } = stats || {
    today: { success: { count: 0, total: 0 }, pending: { count: 0, total: 0 }, failed: { count: 0, total: 0 } },
    month: { success: { count: 0, total: 0 }, pending: { count: 0, total: 0 }, failed: { count: 0, total: 0 } },
    recentTransactions: [],
    totalCustomers: 0
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's your payment overview.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/gateway/till"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <QrCode size={18} />
            Open Till
          </Link>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">KES {today.success.total.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm mt-1">Today's Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CreditCard size={24} className="text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{today.success.count}</h3>
          <p className="text-gray-500 text-sm mt-1">Successful Transactions</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{today.pending.count}</h3>
          <p className="text-gray-500 text-sm mt-1">Pending Payments</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{totalCustomers}</h3>
          <p className="text-gray-500 text-sm mt-1">Total Customers</p>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">This Month</h3>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">KES {month.success.total.toLocaleString()}</h3>
          <p className="text-sm text-green-600 mt-1">{month.success.count} successful payments</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <Clock size={20} className="text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">KES {month.pending.total.toLocaleString()}</h3>
          <p className="text-sm text-yellow-600 mt-1">{month.pending.count} pending payments</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Failed</h3>
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">KES {month.failed.total.toLocaleString()}</h3>
          <p className="text-sm text-red-600 mt-1">{month.failed.count} failed payments</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions?.length > 0 ? (
                recentTransactions.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{tx.customerId?.name || tx.phoneNumber}</p>
                      <p className="text-sm text-gray-500">{tx.phoneNumber}</p>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">KES {tx.amountKes.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(tx.transactionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GatewayDashboard;
