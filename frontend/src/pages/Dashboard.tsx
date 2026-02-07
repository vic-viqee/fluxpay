import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { AddSubscriptionModal } from '../components/AddSubscriptionModal';
import { StkPushModal } from '../components/StkPushModal';
import { SubscriptionsTable } from '../components/SubscriptionsTable';
import { TransactionsTable } from '../components/TransactionsTable';
import { useAuth } from '../context/AuthContext';

// --- Interfaces ---
interface UserProfile {
  businessName?: string;
  username: string;
  email: string;
  createdAt: string;
  has_received_payment: boolean;
}

interface ISubscription {
  _id: string;
  clientId: string;
  planId: {
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
}

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

// --- Main Component ---
const Dashboard: React.FC = () => {
  const { user } = useOutletContext<{ user: UserProfile | null }>();
  const { } = useAuth();

  // --- State ---
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isStkModalOpen, setIsStkModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    successRate: 0,
    pendingPayments: 0,
  });

  // --- Fetch Data ---
  const fetchData = async () => {
    if (!user) return; // Don't fetch if user is not loaded yet
    try {
      setLoading(true);

      const [subsRes, transRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/transactions')
      ]);

      const subsData = subsRes.data || [];
      setSubscriptions(subsData);
      const transData = transRes.data || [];
      setTransactions(transData);

      // --- Calculate Stats ---
      const totalRev = transData
        .filter((t: ITransaction) => t.status === 'SUCCESS')
        .reduce((acc: number, t: ITransaction) => acc + t.amountKes, 0);

      const activeSubs = subsData.filter((s: ISubscription) => s.status === 'ACTIVE').length;   

      const successRateCalc = transData.length > 0
        ? (transData.filter((t: ITransaction) => t.status === 'SUCCESS').length / transData.length) * 100
        : 0;

      const pendingPay = transData.filter((t: ITransaction) => t.status === 'PENDING').length;      

      setStats({
        totalRevenue: totalRev,
        activeSubscriptions: activeSubs,
        successRate: successRateCalc,
        pendingPayments: pendingPay
      });

      // --- First Payment Celebration ---
      if (user.has_received_payment && localStorage.getItem('hasCelebrated') !== 'true') {
        setShowCelebration(true);
        localStorage.setItem('hasCelebrated', 'true');
        setTimeout(() => setShowCelebration(false), 5000); // Hide after 5 seconds
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- Handlers ---
  const handleSubscriptionAdded = (newSub: any) => {
    setSubscriptions(prev => [newSub, ...prev]);
    setIsAddSubModalOpen(false);
    fetchData(); // Refetch all data
  };

  const handleStkPushSuccess = () => {
    fetchData(); // Refetch all data
  };

  if (loading || !user) {
    return <div className="p-8 text-center text-primary-bg">Loading Dashboard Data...</div>;
  }

  return (
    <div className="w-full p-6 bg-primary-bg">

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, {user?.username}</p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setIsStkModalOpen(true)}
            className="text-sm font-medium text-secondary bg-transparent hover:bg-secondary hover:text-white px-4 py-2 rounded-md shadow-sm transition border border-secondary"
          >
            Simulate STK Push (TEST)
          </button>
          <button
            onClick={() => setIsAddSubModalOpen(true)}
            className="text-sm font-medium text-white bg-secondary hover:bg-teal-500 px-4 py-2 rounded-md shadow transition"
          >
            Create Subscription
          </button>
        </div>
      </div>

      {/* --- Conditional Hero / Stats --- */}
      {showCelebration ? (
        <div className="bg-surface-bg shadow-sm rounded-lg p-8 text-center mb-8 border-l-4 border-accent">
          <h2 className="text-4xl font-bold text-accent">🎉 You just received your first payment!</h2>
        </div>
      ) : !user?.has_received_payment ? (
        <div className="bg-surface-bg shadow-sm rounded-lg p-12 text-center mb-8 border border-surface-bg">
          <h2 className="text-2xl font-semibold text-white mb-4">Your account is ready. Let’s collect your first payment.</h2>
          <button
            onClick={() => setIsStkModalOpen(true)}
            className="bg-main hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition text-lg"
          >
            ➕ Request Payment
          </button>
          <p className="text-gray-400 mt-4">Create a payment request and send it to your client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-bg overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-main">
            <dt className="text-sm font-medium text-gray-400 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-bold text-white">KES {stats.totalRevenue.toLocaleString()}</dd>
            <dd className="text-xs text-main mt-1 font-medium">Verified Payments</dd>
          </div>
          <div className="bg-surface-bg overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-secondary">
            <dt className="text-sm font-medium text-gray-400 truncate">Active Subscriptions</dt>      
            <dd className="mt-1 text-3xl font-bold text-white">{stats.activeSubscriptions}</dd>    
            <dd className="text-xs text-gray-400 mt-1">Total active plans</dd>
          </div>
          <div className="bg-surface-bg overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-accent">
            <dt className="text-sm font-medium text-gray-400 truncate">Success Rate</dt>
            <dd className="mt-1 text-3xl font-bold text-white">{stats.successRate.toFixed(1)}%</dd>

            <dd className="text-xs text-gray-400 mt-1">Based on transactions</dd>
          </div>
            <div className="bg-surface-bg overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-yellow-500">
            <dt className="text-sm font-medium text-gray-400 truncate">Pending Payments</dt>
            <dd className="mt-1 text-3xl font-bold text-white">{stats.pendingPayments}</dd>        
            <dd className="text-xs text-yellow-400 mt-1 font-medium">Action required</dd>
          </div>
        </div>
      )}
      
      {/* Use the new table components */}
      <div className="space-y-8">
        <SubscriptionsTable subscriptions={subscriptions} />
        <TransactionsTable transactions={transactions} />
      </div>

      <AddSubscriptionModal
        isOpen={isAddSubModalOpen}
        onClose={() => setIsAddSubModalOpen(false)}
        onSuccess={handleSubscriptionAdded}
      />
      <StkPushModal
        isOpen={isStkModalOpen}
        onClose={() => setIsStkModalOpen(false)}
        onSuccess={handleStkPushSuccess}
      />
    </div>
  );
};

export default Dashboard;