import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Clock, 
  AlertCircle,
  Users,
  QrCode,
  Zap,
  Plus,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { gatewayDashboard, mpesa } from '../../services/gatewayApi';

const GatewayDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [balance, setBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    fetchStats();
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserPlan(JSON.parse(userData));
    }
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

  const checkTillBalance = async () => {
    setLoadingBalance(true);
    try {
      const result = await mpesa.checkBalance();
      setBalance(result);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  };

  const planInfo = {
    free: { name: 'Free', color: 'bg-gray-100 text-gray-700', limit: 50 },
    starter: { name: 'Starter', color: 'bg-blue-100 text-blue-700', limit: 100 },
    growth: { name: 'Growth', color: 'bg-purple-100 text-purple-700', limit: 1000 },
    pro: { name: 'Pro', color: 'bg-yellow-100 text-yellow-700', limit: 999999 }
  };

  const currentPlan = planInfo[userPlan?.plan as keyof typeof planInfo] || planInfo.free;
  const transactionsUsed = userPlan?.currentMonthTransactions || 0;
  const transactionsPercent = Math.round((transactionsUsed / currentPlan.limit) * 100);

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

      {/* Plan Banner */}
      {userPlan?.plan === 'free' && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} />
                <span className="font-bold text-lg">Free Plan - Testing</span>
              </div>
              <p className="text-blue-100 text-sm">
                You're using the free tier with 50 transactions/month.
                {transactionsPercent >= 80 && (
                  <span className="text-yellow-200 font-medium ml-2">
                    ({transactionsUsed}/{currentPlan.limit} used - {100 - transactionsPercent}% remaining)
                  </span>
                )}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-200">
                <span className="px-2 py-1 bg-blue-500/30 rounded">API Access</span>
                <span className="px-2 py-1 bg-blue-500/30 rounded">Webhooks</span>
                <span className="px-2 py-1 bg-blue-500/30 rounded">Dashboard</span>
                <span className="px-2 py-1 bg-blue-800/50 rounded line-through opacity-60">B2C Payouts</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200 mb-1">Upgrade for more</div>
              <div className="flex gap-2">
                <Link
                  to="/pricing"
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Limit Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Transactions</span>
          <span className={`text-sm font-medium ${transactionsPercent >= 90 ? 'text-red-600' : 'text-gray-600'}`}>
            {transactionsUsed} / {currentPlan.limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              transactionsPercent >= 90 ? 'bg-red-500' :
              transactionsPercent >= 75 ? 'bg-yellow-500' :
              'bg-blue-600'
            }`}
            style={{ width: `${Math.min(transactionsPercent, 100)}%` }}
          />
        </div>
        {transactionsPercent >= 80 && (
          <p className="text-xs text-yellow-600 mt-2">
            You've used {transactionsPercent}% of your monthly transactions.
          </p>
        )}
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

      {/* Floating Quick Actions Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center ${
            showQuickActions ? 'rotate-45' : ''
          }`}
        >
          <Plus size={24} />
        </button>

        {/* Quick Actions Menu */}
        {showQuickActions && (
          <div className="absolute bottom-20 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-2 min-w-[200px]">
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Quick Actions</p>
            
            <Link
              to="/gateway/till"
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setShowQuickActions(false)}
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <QrCode size={16} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">New Payment</p>
                <p className="text-xs text-gray-500">Send STK push</p>
              </div>
            </Link>

            <Link
              to="/gateway/payment-links"
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setShowQuickActions(false)}
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <LinkIcon size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">Create Link</p>
                <p className="text-xs text-gray-500">Generate payment link</p>
              </div>
            </Link>

            <button
              onClick={() => {
                checkTillBalance();
                setShowQuickActions(false);
              }}
              disabled={loadingBalance}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={16} className={loadingBalance ? "text-blue-600 animate-pulse" : "text-blue-600"} />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800 text-sm">Check Balance</p>
                <p className="text-xs text-gray-500">View Till balance</p>
              </div>
            </button>

            <Link
              to="/gateway/transactions"
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setShowQuickActions(false)}
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CreditCard size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">View Transactions</p>
                <p className="text-xs text-gray-500">See all payments</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Balance Modal */}
      {balance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setBalance(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <button
              onClick={() => setBalance(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign size={32} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Till Balance</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Available</span>
                <span className="font-bold text-green-600">KES {parseFloat(balance.availableBalance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Reserved</span>
                <span className="font-semibold text-gray-800">KES {parseFloat(balance.reservedBalance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Uncleared</span>
                <span className="font-semibold text-yellow-600">KES {parseFloat(balance.unclearedBalance).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setBalance(null)}
              className="w-full mt-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayDashboard;
