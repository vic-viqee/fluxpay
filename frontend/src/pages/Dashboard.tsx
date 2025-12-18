import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AddSubscriptionModal } from '../components/AddSubscriptionModal';
import { StkPushModal } from '../components/StkPushModal'; // Import the new modal
import { SubscriptionsTable } from '../components/SubscriptionsTable';
import { TransactionsTable } from '../components/TransactionsTable';
import { useAuth } from '../context/AuthContext';

// --- Interfaces ---
interface UserProfile {
  businessName?: string;
  username: string;
  email: string;
  createdAt: string;
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
  const { } = useAuth();

  // --- State ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isStkModalOpen, setIsStkModalOpen] = useState(false); // State for the new modal

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
  const handleSubscriptionAdded = (newSub: any) => {
    setSubscriptions(prev => [newSub, ...prev]);
    setIsAddSubModalOpen(false);
    fetchData(); // Refetch all data
  };

  const handleStkPushSuccess = () => {
    fetchData(); // Refetch all data
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard Data...</div>;
  }

  return (
    <div className="w-full p-6">

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard - Live View</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.username}</p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setIsStkModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition font-medium text-sm"
          >
            Simulate STK Push
          </button>
          <button
            onClick={() => setIsAddSubModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow transition font-medium text-sm"
          >
            Add Subscription
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-green-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">KES {stats.totalRevenue.toLocaleString()}</dd>
          <dd className="text-xs text-green-600 mt-1 font-medium">Verified Payments</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-blue-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>      
          <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</dd>    
          <dd className="text-xs text-gray-500 mt-1">Total active plans</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-purple-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</dd>
          <dd className="text-xs text-gray-500 mt-1">Based on transactions</dd>
        </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg p-5 border-l-4 border-yellow-500">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">{stats.pendingPayments}</dd>        
          <dd className="text-xs text-yellow-600 mt-1 font-medium">Action required</dd>
        </div>
      </div>
      
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