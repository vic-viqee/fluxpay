import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { logout } = useAuth();
  const navigate = useNavigate();

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
      
      // Fetch everything in parallel for speed
      const [userRes, subsRes, transRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/subscriptions'),
        api.get('/transactions') // Ensure you have this endpoint in backend!
      ]);

      setUser(userRes.data);
      setSubscriptions(subsRes.data);
      const transData = transRes.data || [];
      setTransactions(transData);

      // --- Calculate Stats ---
      const totalRev = transData
        .filter((t: ITransaction) => t.status === 'completed')
        .reduce((acc: number, t: ITransaction) => acc + t.amount, 0);
      
      const activeSubs = subsRes.data.filter((s: ISubscription) => s.status === 'active').length; // Ensure backend returns 'status'
      
      const successRateCalc = transData.length > 0 
        ? (transData.filter((t: ITransaction) => t.status === 'completed').length / transData.length) * 100 
        : 0;

      const pendingPay = transData.filter((t: ITransaction) => t.status === 'pending').length;

      setStats({
        totalRevenue: totalRev,
        activeSubscriptions: activeSubs || subsRes.data.length, // Fallback if no status field
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
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSimulateStkPush = async () => {
    const phone = prompt('Enter M-Pesa Phone Number (e.g., 254712345678):');
    const amount = prompt('Enter Amount to push (KES):');
    
    if (phone && amount) {
      setStkLoading(true);
      try {
        await api.post('/payments/stk-push', { phoneNumber: phone, amount: parseInt(amount) });
        alert('STK Push initiated successfully! Check your phone.');
        // Optional: Refresh transactions after a delay to see the pending record
        setTimeout(fetchData, 3000);
      } catch (error) {
        console.error(error);
        alert('Failed to initiate STK Push.');
      } finally {
        setStkLoading(false);
      }
    }
  };

  const handleSubscriptionAdded = (newSub: ISubscription) => {
    // Optimistically update the list, or re-fetch
    setSubscriptions(prev => [newSub, ...prev]); 
    setIsModalOpen(false); 
    fetchData(); // Re-fetch to update stats
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar (Visual only for now) */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">FluxPay</h1>
        </div>
        <nav className="mt-6 text-sm">
          <a href="#" className="block py-3 px-6 bg-gray-800 border-l-4 border-blue-500">Dashboard</a>
          <a href="#" className="block py-3 px-6 hover:bg-gray-800 text-gray-400 hover:text-white transition">Customers</a>
          <a href="#" className="block py-3 px-6 hover:bg-gray-800 text-gray-400 hover:text-white transition">Subscriptions</a>
          <a href="#" className="block py-3 px-6 hover:bg-gray-800 text-gray-400 hover:text-white transition">Payments</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-500">Welcome, {user?.username}</span>
               <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800">Logout</button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-gray-800 hidden md:block">Overview</h1>
            <div className="flex space-x-3 w-full md:w-auto justify-end">
              <button className="btn btn-outline text-gray-600 border-gray-300 hover:bg-gray-50">Export</button>
              <button 
                onClick={handleSimulateStkPush} 
                disabled={stkLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
              >
                {stkLoading ? 'Sending...' : 'Simulate STK Push'}
              </button>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
              >
                Add Subscription
              </button>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Revenue */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-green-500">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">KES {stats.totalRevenue.toLocaleString()}</dd>
              <dd className="text-xs text-green-600 mt-1">+0.0% this month</dd>
            </div>
            {/* Subscriptions */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-blue-500">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</dd>
              <dd className="text-xs text-gray-500 mt-1">Total active plans</dd>
            </div>
            {/* Success Rate */}
            <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-purple-500">
              <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats.successRate.toFixed(1)}%</dd>
              <dd className="text-xs text-gray-500 mt-1">Based on transactions</dd>
            </div>
             {/* Pending */}
             <div className="bg-white overflow-hidden shadow rounded-lg p-5 border-l-4 border-yellow-500">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{stats.pendingPayments}</dd>
              <dd className="text-xs text-yellow-600 mt-1">Action required</dd>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Subscriptions</h3>
            </div>
            <div className="overflow-x-auto">
              {subscriptions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No subscriptions yet. Click "Add Subscription" to start.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
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

          {/* Transactions Table */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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

        </div>
      </main>

      {/* Modal */}
      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSubscriptionAdded} 
      />
    </div>
  );
};

export default Dashboard;