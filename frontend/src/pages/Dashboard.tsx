import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, Plus, CreditCard, Users, Activity, 
  TrendingUp, ArrowRight, Settings, PieChart,
  CheckCircle2, Clock
} from 'lucide-react';
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
  const [refreshing, setRefreshing] = useState(false);

  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isStkModalOpen, setIsStkModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    successRate: 0,
    pendingPayments: 0,
  });

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (!user) return;

    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

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

      const activeSubscriptionsCount = subsData.filter((s: ISubscription) => s.status === 'ACTIVE').length;
      const successRateCalc =
        transData.length > 0
          ? (transData.filter((t: ITransaction) => t.status === 'SUCCESS').length / transData.length) * 100
          : 0;
      const pendingPay = transData.filter((t: ITransaction) => t.status === 'PENDING').length;

      setStats({
        totalRevenue: totalRev,
        activeSubscriptions: activeSubscriptionsCount,
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
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscriptionAdded = (newSub: any) => {
    setSubscriptions((prev) => [newSub, ...prev]);
    setIsAddSubModalOpen(false);
    fetchData(true);
  };

  const handleStkPushSuccess = () => {
    fetchData(true);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  const hasPlans = plansCount > 0;
  const hasSubscriptions = subscriptions.length > 0;

  return (
    <div className="w-full bg-primary-bg min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="mt-1 text-gray-400">Welcome back, <span className="text-white font-medium">{user?.username}</span></p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2 bg-surface-bg border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsStkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-secondary hover:text-white transition-all font-medium text-sm"
            >
              <Activity size={18} />
              Test STK Push
            </button>
            <button
              onClick={() => setIsAddSubModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-main hover:bg-blue-600 transition-all font-medium text-sm shadow-lg"
            >
              <Plus size={18} />
              New Subscription
            </button>
          </div>
        </div>

        {/* Setup Progress if needed */}
        {(!hasPlans || !hasSubscriptions) && (
          <div className="mb-8 overflow-hidden rounded-xl border border-main/30 bg-surface-bg shadow-sm">
            <div className="bg-main/10 p-4 border-b border-main/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-main rounded-lg text-white">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 className="font-semibold">Complete your setup</h2>
                  <p className="text-xs text-gray-400">Finish these steps to start collecting payments</p>
                </div>
              </div>
              <div className="text-sm font-bold text-main">
                {hasPlans && hasSubscriptions ? '100%' : hasPlans ? '50%' : '0%'}
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SetupStep 
                isDone={hasPlans} 
                title="Create a Service Plan" 
                desc="Define your pricing and billing frequency" 
                actionLabel="Create Plan"
                onAction={() => navigate('/plans')}
              />
              <SetupStep 
                isDone={hasSubscriptions} 
                title="Add a Subscriber" 
                desc="Assign a plan to your first customer" 
                actionLabel="Add Subscriber"
                onAction={() => setIsAddSubModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Celebration State */}
        {showCelebration && (
          <div className="mb-8 rounded-xl bg-gradient-to-r from-secondary to-teal-600 p-1 flex items-center justify-center animate-bounce shadow-xl">
            <div className="bg-surface-bg w-full rounded-lg p-6 text-center">
              <h2 className="text-3xl font-bold text-secondary">🎉 First Payment Received!</h2>
              <p className="text-gray-300 mt-2">Congratulations! Your business is officially live on FluxPay.</p>
            </div>
          </div>
        )}

        {/* Empty State for new users who haven't received payment */}
        {!user?.has_received_payment && hasSubscriptions && (
          <div className="mb-8 rounded-xl border border-dashed border-gray-700 bg-surface-bg/50 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-main/10 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={32} className="text-main" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to collect your first payment?</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              You have subscriptions set up. Use the button below to manually trigger a payment request or wait for the automated billing.
            </p>
            <button
              onClick={() => setIsStkModalOpen(true)}
              className="px-8 py-3 bg-main hover:bg-blue-600 rounded-lg font-bold transition-all shadow-lg active:scale-95"
            >
              Trigger STK Push Now
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardStatCard 
            label="Total Revenue" 
            value={`KES ${stats.totalRevenue.toLocaleString()}`} 
            icon={<TrendingUp size={20} className="text-secondary" />}
            footer="Verified Collections"
            color="secondary"
          />
          <DashboardStatCard 
            label="Active Subscriptions" 
            value={stats.activeSubscriptions} 
            icon={<Users size={20} className="text-main" />}
            footer="Currently recurring"
            color="main"
          />
          <DashboardStatCard 
            label="Success Rate" 
            value={`${stats.successRate.toFixed(1)}%`} 
            icon={<Activity size={20} className="text-accent" />}
            footer="Transaction health"
            color="accent"
          />
          <DashboardStatCard 
            label="Pending Payments" 
            value={stats.pendingPayments} 
            icon={<Clock size={20} className="text-yellow-500" />}
            footer="Action required"
            color="yellow-500"
          />
        </div>

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-surface-bg rounded-xl border border-gray-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock size={18} className="text-main" />
                  Recent Subscriptions
                </h3>
                <button onClick={() => navigate('/subscriptions')} className="text-xs text-main hover:underline flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <SubscriptionsTable
                subscriptions={subscriptions.slice(0, 5)}
                isLoading={loading}
                onCreateSubscription={() => setIsAddSubModalOpen(true)}
              />
            </div>

            <div className="bg-surface-bg rounded-xl border border-gray-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity size={18} className="text-secondary" />
                  Recent Transactions
                </h3>
                <button onClick={() => navigate('/payments')} className="text-xs text-main hover:underline flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <TransactionsTable transactions={transactions.slice(0, 5)} isLoading={loading} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-bg rounded-xl border border-gray-800 p-6 shadow-sm">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus size={18} className="text-accent" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <QuickActionButton 
                  label="Add Customer" 
                  icon={<Users size={16} />} 
                  onClick={() => navigate('/customers')} 
                />
                <QuickActionButton 
                  label="New Service Plan" 
                  icon={<Settings size={16} />} 
                  onClick={() => navigate('/plans')} 
                />
                <QuickActionButton 
                  label="Business Settings" 
                  icon={<Settings size={16} />} 
                  onClick={() => navigate('/settings')} 
                />
                <QuickActionButton 
                  label="Deep Analytics" 
                  icon={<PieChart size={16} />} 
                  onClick={() => navigate('/analytics')} 
                  highlight
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-sm text-gray-300 mb-1">PRO TIP</h4>
                <p className="text-xs text-gray-400">
                  Enable webhooks in settings to receive real-time payment notifications on your own server.
                </p>
                <button className="mt-4 text-xs font-bold text-main flex items-center gap-1 hover:translate-x-1 transition-transform">
                  Configure Webhooks <ArrowRight size={12} />
                </button>
              </div>
              <div className="absolute -bottom-2 -right-2 opacity-5">
                <Settings size={80} />
              </div>
            </div>
          </div>
        </div>
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

interface SetupStepProps {
  isDone: boolean;
  title: string;
  desc: string;
  actionLabel: string;
  onAction: () => void;
}

const SetupStep: React.FC<SetupStepProps> = ({ isDone, title, desc, actionLabel, onAction }) => (
  <div className={`p-4 rounded-lg border flex items-start gap-4 transition-all ${isDone ? 'bg-secondary/5 border-secondary/20' : 'bg-primary-bg border-gray-700'}`}>
    <div className={`mt-1 p-1 rounded-full ${isDone ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-500'}`}>
      {isDone ? <CheckCircle2 size={16} /> : <div className="w-4 h-4" />}
    </div>
    <div className="flex-1">
      <h4 className={`text-sm font-semibold ${isDone ? 'text-secondary' : 'text-white'}`}>{title}</h4>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
      {!isDone && (
        <button 
          onClick={onAction}
          className="mt-3 text-xs font-bold text-main hover:text-blue-400 flex items-center gap-1"
        >
          {actionLabel} <ArrowRight size={12} />
        </button>
      )}
    </div>
  </div>
);

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  footer: string;
  color: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ label, value, icon, footer, color }) => (
  <div className="bg-surface-bg border border-gray-800 rounded-xl p-6 shadow-sm hover:border-gray-700 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-primary-bg rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="w-8 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full bg-${color}`} style={{ width: '60%' }}></div>
      </div>
    </div>
    <p className="text-sm font-medium text-gray-400">{label}</p>
    <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
      <CheckCircle2 size={10} /> {footer}
    </p>
  </div>
);

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  highlight?: boolean;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ label, icon, onClick, highlight }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-all active:scale-95 ${
      highlight 
      ? 'bg-main/10 border-main/30 text-main hover:bg-main/20' 
      : 'bg-primary-bg border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>
    <ArrowRight size={14} className="opacity-50" />
  </button>
);

export default Dashboard;
