import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AddSubscriptionModal, ISubscription } from '../components/AddSubscriptionModal';
import { useAuth } from '../context/AuthContext';

// --- Interfaces ---
interface UserProfile {
  businessName?: string;
  username: string;
  email: string;
  createdAt: string;
}

interface ITransaction {
  _id: string;
  mpesaRef: string;
  amount: number;
  phoneNumber: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

// --- Main Component ---
const Dashboard: React.FC = () => {
  const { logout } = useAuth(); // kept for logic, but UI removed
  
  // --- State ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stkLoading, setStkLoading] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    successRate: 0,
    pendingPayments: 0,
  });

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [userRes, subsRes, transRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/subscriptions'),
        api.get('/transactions')
      ]);

      setUser(userRes.data);
      setSubscriptions(subsRes.data);
      const transData = transRes.data || [];
      setTransactions(transData);

      // --- Calculate Stats ---
      const totalRev = transData
        .filter((t: ITransaction) => t.status === 'completed')
        .reduce((acc: number, t: ITransaction) => acc + t.amount, 0);
      
      const activeSubs = subsRes.data.filter((s: ISubscription) => s.status === 'active').length;
      
      const successRateCalc = transData.length > 0 
        ? (transData.filter((t: ITransaction) => t.status === 'completed').length / transData.length) * 100 
        : 0;

      const pendingPay = transData.filter((t: ITransaction) => t.status === 'pending').length;

      setStats({
        totalRevenue: totalRev,
        activeSubscriptions: activeSubs || subsRes.data.length,
        successRate: successRateCalc,
        pendingPayments: pendingPay
      });

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const handleSimulateStkPush = async () => {
    const phone = prompt('Enter M-Pesa Phone Number (e.g., 254712345678):');
    const amount = prompt('Enter Amount to push (KES):');
    
    if (phone && amount) {
      setStkLoading(true);
      try {
        await api.post('/payments/stk-push', { phoneNumber: phone, amount: parseInt(amount) });
        alert('STK Push initiated successfully! Check your phone.');
        setTimeout(fetchData, 3000); // Refresh stats
      } catch (error) {
        console.error(error);
        alert('Failed to initiate STK Push.');
      } finally {
        setStkLoading(false);
      }
    }
  };

  const handleSubscriptionAdded = (newSub: ISubscription) => {
    setSubscriptions(prev => [newSub, ...prev]); 
    setIsModalOpen(false); 
    fetchData(); 
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard Data...</div>;
  }

  // --- RENDER ---
  // NOTICE: No <aside>, No <header>, No "FluxPay" Logo. Just the content.
  return (
    <div className="w-full"> 
      
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard - Live View</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.username}</p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <button 
            onClick={handleSimulateStkPush} 
            disabled={stkLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition font-medium text-sm"
          >
            {stkLoading ? 'Sending...' : 'Simulate STK Push'}
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow transition font-medium text-sm"
          >
            Add Subscription
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-green-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">KES {stats.totalRevenue.toLocaleString()}</dd>
          <dd className="text-xs text-green-600 mt-1 font-medium">Verified Payments</dd>
        </div>
        {/* Subscriptions */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-blue-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</dd>
          <dd className="text-xs text-gray-500 mt-1">Total active plans</dd>
        </div>
        {/* Success Rate */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-purple-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</dd>
          <dd className="text-xs text-gray-500 mt-1">Based on transactions</dd>
        </div>
          {/* Pending */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-yellow-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.pendingPayments}</dd>
          <dd className="text-xs text-yellow-600 mt-1 font-medium">Action required</dd>
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Subscriptions</h3>
        </div>
        <div className="overflow-x-auto">
          {subscriptions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No subscriptions found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KES {sub.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{sub.billingFrequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No transactions recorded yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.mpesaRef || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KES {t.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        t.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        t.status === 'failed' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal is strictly invisible until triggered */}
      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSubscriptionAdded} 
      />
    </div>
  );
};

export default Dashboard;