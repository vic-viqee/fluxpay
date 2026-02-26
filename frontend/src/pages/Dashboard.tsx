import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AddSubscriptionModal } from '../components/AddSubscriptionModal';
import { StkPushModal } from '../components/StkPushModal';
import { SubscriptionsTable } from '../components/SubscriptionsTable';
import { TransactionsTable } from '../components/TransactionsTable';
import { useAuth } from '../context/AuthContext';

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [plansCount, setPlansCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isStkModalOpen, setIsStkModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    successRate: 0,
    pendingPayments: 0,
  });

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [subsRes, transRes, plansRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/transactions'),
        api.get('/plans'),
      ]);

      const subsData = subsRes.data || [];
      const transData = transRes.data || [];
      const plansData = plansRes.data?.plans || [];

      setSubscriptions(subsData);
      setTransactions(transData);
      setPlansCount(plansData.length);

      const totalRev = transData
        .filter((t: ITransaction) => t.status === 'SUCCESS')
        .reduce((acc: number, t: ITransaction) => acc + t.amountKes, 0);

      const activeSubs = subsData.filter((s: ISubscription) => s.status === 'ACTIVE').length;
      const successRateCalc =
        transData.length > 0
          ? (transData.filter((t: ITransaction) => t.status === 'SUCCESS').length / transData.length) * 100
          : 0;
      const pendingPay = transData.filter((t: ITransaction) => t.status === 'PENDING').length;

      setStats({
        totalRevenue: totalRev,
        activeSubscriptions: activeSubs,
        successRate: successRateCalc,
        pendingPayments: pendingPay,
      });

      if (user.has_received_payment && localStorage.getItem('hasCelebrated') !== 'true') {
        setShowCelebration(true);
        localStorage.setItem('hasCelebrated', 'true');
        setTimeout(() => setShowCelebration(false), 5000);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubscriptionAdded = (newSub: any) => {
    setSubscriptions((prev) => [newSub, ...prev]);
    setIsAddSubModalOpen(false);
    fetchData();
  };

  const handleStkPushSuccess = () => {
    fetchData();
  };

  if (loading || !user) {
    return <div className="p-8 text-center text-white">Loading dashboard data...</div>;
  }

  const hasPlans = plansCount > 0;
  const hasSubscriptions = subscriptions.length > 0;

  return (
    <div className="w-full bg-primary-bg p-6">
      <div className="mb-6 flex flex-col items-center justify-between md:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Welcome back, {user?.username}</p>
        </div>

        <div className="mt-4 flex items-center space-x-3 md:mt-0">
          <button
            onClick={() => setIsStkModalOpen(true)}
            className="rounded-md border border-secondary bg-transparent px-4 py-2 text-sm font-medium text-secondary shadow-sm transition hover:bg-secondary hover:text-white"
          >
            Simulate STK Push (TEST)
          </button>
          <button
            onClick={() => setIsAddSubModalOpen(true)}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-teal-500"
          >
            Create Subscription
          </button>
        </div>
      </div>

      {!hasPlans || !hasSubscriptions ? (
        <div className="mb-8 rounded-lg border border-main/40 bg-surface-bg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-white">Complete your setup</h2>
          <p className="mt-1 text-sm text-gray-400">Follow these steps to start collecting recurring payments.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className={`rounded border p-3 ${hasPlans ? 'border-secondary/50 bg-secondary/10' : 'border-gray-600 bg-primary-bg'}`}>
              <p className="text-sm text-white">{hasPlans ? 'Done: Service plan created' : 'Step 1: Create your first service plan'}</p>
              {!hasPlans ? (
                <button
                  type="button"
                  onClick={() => navigate('/plans')}
                  className="mt-2 rounded bg-main px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
                >
                  Go to Plans
                </button>
              ) : null}
            </div>
            <div className={`rounded border p-3 ${hasSubscriptions ? 'border-secondary/50 bg-secondary/10' : 'border-gray-600 bg-primary-bg'}`}>
              <p className="text-sm text-white">{hasSubscriptions ? 'Done: Subscription created' : 'Step 2: Create your first subscription'}</p>
              {!hasSubscriptions ? (
                <button
                  type="button"
                  onClick={() => setIsAddSubModalOpen(true)}
                  className="mt-2 rounded bg-secondary px-3 py-1 text-xs font-medium text-white hover:bg-teal-500"
                >
                  Create Subscription
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showCelebration ? (
        <div className="mb-8 rounded-lg border-l-4 border-accent bg-surface-bg p-8 text-center shadow-sm">
          <h2 className="text-4xl font-bold text-accent">You just received your first payment!</h2>
        </div>
      ) : !user?.has_received_payment ? (
        <div className="mb-8 rounded-lg border border-surface-bg bg-surface-bg p-12 text-center shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-white">Your account is ready. Let's collect your first payment.</h2>
          <button
            onClick={() => setIsStkModalOpen(true)}
            className="rounded-lg bg-main px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-500"
          >
            Request Payment
          </button>
          <p className="mt-4 text-gray-400">Create a payment request and send it to your client.</p>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="overflow-hidden rounded-lg border-l-4 border-main bg-surface-bg p-5 shadow-sm">
            <dt className="truncate text-sm font-medium text-gray-400">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-bold text-white">KES {stats.totalRevenue.toLocaleString()}</dd>
            <dd className="mt-1 text-xs font-medium text-main">Verified Payments</dd>
          </div>
          <div className="overflow-hidden rounded-lg border-l-4 border-secondary bg-surface-bg p-5 shadow-sm">
            <dt className="truncate text-sm font-medium text-gray-400">Active Subscriptions</dt>
            <dd className="mt-1 text-3xl font-bold text-white">{stats.activeSubscriptions}</dd>
            <dd className="mt-1 text-xs text-gray-400">Total active plans</dd>
          </div>
          <div className="overflow-hidden rounded-lg border-l-4 border-accent bg-surface-bg p-5 shadow-sm">
            <dt className="truncate text-sm font-medium text-gray-400">Success Rate</dt>
            <dd className="mt-1 text-3xl font-bold text-white">{stats.successRate.toFixed(1)}%</dd>
            <dd className="mt-1 text-xs text-gray-400">Based on transactions</dd>
          </div>
          <div className="overflow-hidden rounded-lg border-l-4 border-yellow-500 bg-surface-bg p-5 shadow-sm">
            <dt className="truncate text-sm font-medium text-gray-400">Pending Payments</dt>
            <dd className="mt-1 text-3xl font-bold text-white">{stats.pendingPayments}</dd>
            <dd className="mt-1 text-xs font-medium text-yellow-400">Action required</dd>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <SubscriptionsTable
          subscriptions={subscriptions}
          onCreateSubscription={() => setIsAddSubModalOpen(true)}
        />
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
