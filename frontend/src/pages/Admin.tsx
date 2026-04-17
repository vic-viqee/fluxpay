import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, CreditCard, Activity, DollarSign, 
  Package, Key, Webhook, ChevronLeft, ChevronRight,
  LogOut, X, TrendingUp, Shield, Menu, Search
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Overview {
  totalBusinesses: number;
  activeBusinesses: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number; transactions: number }[];
  transactions: { total: number; success: number; pending: number; failed: number };
  subscriptions: { total: number; active: number; failed: number; paused: number };
  apiKeys: { total: number; active: number };
  webhooks: { total: number; active: number };
}

interface Business {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  plan: string;
  createdAt: string;
  totalRevenue: number;
  successfulTransactions: number;
  activeSubscriptions: number;
  activeApiKeys: number;
}

interface Transaction {
  _id: string;
  ownerId: { businessName: string; email: string };
  amountKes: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  mpesaReceiptNo?: string;
  darajaRequestId: string;
  transactionDate: string;
}

interface Subscription {
  _id: string;
  ownerId: { businessName: string; email: string };
  clientId: { name: string; phoneNumber: string };
  planId: { name: string; amountKes: number };
  status: string;
  nextBillingDate: string;
  createdAt: string;
}

interface ApiKey {
  _id: string;
  key: string;
  name: string;
  ownerId: { businessName: string; email: string };
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

interface WebhookRecord {
  _id: string;
  url: string;
  name: string;
  events: string[];
  ownerId: { businessName: string; email: string };
  isActive: boolean;
  lastTriggeredAt?: string;
  failureCount: number;
  createdAt: string;
}

interface PlanLimit {
  _id: string;
  businessName: string;
  email: string;
  plan: string;
  limit: number | string;
  used: number;
  percentage: number;
  remaining: number | string;
  resetAt: string;
  status: 'ok' | 'warning' | 'blocked';
  createdAt: string;
}

interface AuditLog {
  _id: string;
  adminId: { businessName: string; email: string };
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

interface PaginationState {
  page: number;
  totalPages: number;
  total: number;
}

const Admin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [planLimits, setPlanLimits] = useState<PlanLimit[]>([]);
  const [planStats, setPlanStats] = useState<{ plan: string; businesses: number; totalTransactions: number }[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        setLoading(false);
        fetchOverview();
        fetchBusinesses();
      }
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!isAdmin) return;
    
    switch (activeTab) {
      case 'transactions': fetchTransactions(); break;
      case 'subscriptions': fetchSubscriptions(); break;
      case 'apiKeys': fetchApiKeys(); break;
      case 'webhooks': fetchWebhooks(); break;
      case 'limits': fetchPlanLimits(); break;
      case 'audit': fetchAuditLogs(); break;
    }
  }, [activeTab, transactionStatus, subscriptionStatus, pagination.page, dateRange]);

  const fetchOverview = async () => {
    try {
      const response = await api.get('/admin/overview');
      setOverview(response.data);
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    }
  };

  const fetchBusinesses = async (page = 1) => {
    try {
      const response = await api.get(`/admin/businesses?page=${page}&search=${searchTerm}`);
      setBusinesses(response.data.data);
      setPagination({ page: response.data.page, totalPages: response.data.totalPages, total: response.data.total });
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    }
  };

  const fetchTransactions = async (page = pagination.page) => {
    try {
      const statusParam = transactionStatus ? `&status=${transactionStatus}` : '';
      const dateParam = dateRange.start ? `&startDate=${dateRange.start}&endDate=${dateRange.end}` : '';
      const response = await api.get(`/admin/transactions?page=${page}&limit=20${statusParam}${dateParam}`);
      setTransactions(response.data.data);
      setPagination({ page: response.data.page, totalPages: response.data.totalPages, total: response.data.total });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const fetchSubscriptions = async (page = pagination.page) => {
    try {
      const statusParam = subscriptionStatus ? `&status=${subscriptionStatus}` : '';
      const response = await api.get(`/admin/subscriptions?page=${page}&limit=20${statusParam}`);
      setSubscriptions(response.data.data);
      setPagination({ page: response.data.page, totalPages: response.data.totalPages, total: response.data.total });
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    }
  };

  const fetchApiKeys = async (page = pagination.page) => {
    try {
      const response = await api.get(`/admin/apikeys?page=${page}&limit=20`);
      setApiKeys(response.data.data);
      setPagination({ page: response.data.page, totalPages: response.data.totalPages, total: response.data.total });
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    }
  };

  const fetchWebhooks = async (page = pagination.page) => {
    try {
      const response = await api.get(`/admin/webhooks?page=${page}&limit=20`);
      setWebhooks(response.data.data);
      setPagination({ page: response.data.page, totalPages: response.data.totalPages, total: response.data.total });
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    }
  };

  const fetchPlanLimits = async (page = pagination.page) => {
    try {
      const response = await api.get(`/admin/plan-limits?page=${page}&limit=20`);
      setPlanLimits(response.data.data);
      setPlanStats(response.data.planStats || []);
      setPagination({ page: response.data.page, totalPages: response.data.totalPages, total: response.data.total });
    } catch (err) {
      console.error('Failed to fetch plan limits:', err);
    }
  };

  const fetchAuditLogs = async (page = pagination.page) => {
    try {
      const response = await api.get(`/admin/audit-logs?page=${page}&limit=20`);
      setAuditLogs(response.data.data);
      setPagination({ page: response.data.page, totalPages: response.data.totalPages, total: response.data.total });
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  const formatKES = (value: number) => `KES ${value.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400';
      case 'PENDING': case 'PENDING_ACTIVATION': return 'bg-yellow-500/20 text-yellow-400';
      case 'FAILED': case 'CANCELLED': case 'EXPIRED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  // Show loading while checking auth
  if (authLoading || (loading && !user)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If logged in but not admin, redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Activity size={20} /> },
    { id: 'businesses', label: 'Businesses', icon: <Users size={20} /> },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard size={20} /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Package size={20} /> },
    { id: 'limits', label: 'Plan Limits', icon: <TrendingUp size={20} /> },
    { id: 'apiKeys', label: 'API Keys', icon: <Key size={20} /> },
    { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={20} /> },
    { id: 'audit', label: 'Audit Trail', icon: <Shield size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">F</span>
            </div>
            <span className="font-bold text-white">FluxPay Admin</span>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-slate-800 rounded-lg">
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">F</span>
                </div>
                <span className="font-bold text-white">FluxPay</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-white text-lg">F</span>
            </div>
            <div>
              <h1 className="font-bold text-white">FluxPay</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white capitalize">{activeTab.replace('_', ' ')}</h1>
            <p className="text-slate-400 mt-1">Manage your FluxPay platform</p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                      <Users size={24} className="text-indigo-400" />
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp size={12} /> +12%
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{overview.totalBusinesses}</h3>
                  <p className="text-slate-400 text-sm mt-1">Total Businesses</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Activity size={24} className="text-emerald-400" />
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp size={12} /> Active
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{overview.activeBusinesses}</h3>
                  <p className="text-slate-400 text-sm mt-1">Active Today</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <DollarSign size={24} className="text-yellow-400" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{formatKES(overview.totalRevenue)}</h3>
                  <p className="text-slate-400 text-sm mt-1">Total Revenue</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Package size={24} className="text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white">{overview.subscriptions.active}</h3>
                  <p className="text-slate-400 text-sm mt-1">Active Subscriptions</p>
                </div>
              </div>

              {/* Revenue Chart */}
              {overview.monthlyRevenue.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overview.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12}
                          tickFormatter={(v) => {
                            const [y, m] = v.split('-');
                            return new Date(parseInt(y), parseInt(m)-1).toLocaleDateString('en', { month: 'short' });
                          }}
                        />
                        <YAxis stroke="#94a3b8" fontSize={12}
                          tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                        />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          formatter={(value) => [formatKES(Number(value)), 'Revenue']}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-4">Transactions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400">Success</span>
                      <span className="font-bold text-white">{overview.transactions.success}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400">Pending</span>
                      <span className="font-bold text-white">{overview.transactions.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-400">Failed</span>
                      <span className="font-bold text-white">{overview.transactions.failed}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-4">Subscriptions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400">Active</span>
                      <span className="font-bold text-white">{overview.subscriptions.active}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total</span>
                      <span className="font-bold text-white">{overview.subscriptions.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400">Paused</span>
                      <span className="font-bold text-white">{overview.subscriptions.paused}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-4">Platform Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">API Keys</span>
                      <span className="font-bold text-white">{overview.apiKeys.active} / {overview.apiKeys.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Webhooks</span>
                      <span className="font-bold text-white">{overview.webhooks.active} / {overview.webhooks.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Businesses Tab */}
          {activeTab === 'businesses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses(1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button onClick={() => fetchBusinesses(1)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                  Search
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Business</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">Plan</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Revenue</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Transactions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {businesses.map((biz) => (
                        <tr key={biz._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-white">{biz.businessName}</p>
                              <p className="text-sm text-slate-500">{biz.email}</p>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              biz.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                              biz.plan === 'Growth' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-700 text-slate-400'
                            }`}>{biz.plan || 'Free'}</span>
                          </td>
                          <td className="p-4 font-medium text-white">{formatKES(biz.totalRevenue)}</td>
                          <td className="p-4 text-slate-400 hidden sm:table-cell">{biz.successfulTransactions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <AdminPagination pagination={pagination} activeTab={activeTab} fetchHandlers={{ businesses: fetchBusinesses, transactions: fetchTransactions, subscriptions: fetchSubscriptions, apiKeys: fetchApiKeys, webhooks: fetchWebhooks, limits: fetchPlanLimits, audit: fetchAuditLogs }} />
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={transactionStatus}
                  onChange={(e) => { setTransactionStatus(e.target.value); fetchTransactions(1); }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
                <input type="date" value={dateRange.start}
                  onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input type="date" value={dateRange.end}
                  onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={() => fetchTransactions(1)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                  Filter
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Business</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-white">{tx.ownerId?.businessName || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{tx.ownerId?.email}</p>
                          </td>
                          <td className="p-4 font-medium text-white">{formatKES(tx.amountKes)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 hidden sm:table-cell">{tx.mpesaReceiptNo || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <AdminPagination pagination={pagination} activeTab={activeTab} fetchHandlers={{ businesses: fetchBusinesses, transactions: fetchTransactions, subscriptions: fetchSubscriptions, apiKeys: fetchApiKeys, webhooks: fetchWebhooks, limits: fetchPlanLimits, audit: fetchAuditLogs }} />
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={subscriptionStatus}
                  onChange={(e) => { setSubscriptionStatus(e.target.value); fetchSubscriptions(1); }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING_ACTIVATION">Pending</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Business</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">Client</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Plan</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {subscriptions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-white">{sub.ownerId?.businessName || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{sub.ownerId?.email}</p>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <p className="text-white">{sub.clientId?.name || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{sub.clientId?.phoneNumber}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-white">{sub.planId?.name || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{formatKES(sub.planId?.amountKes || 0)}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sub.status)}`}>
                              {sub.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <AdminPagination pagination={pagination} activeTab={activeTab} fetchHandlers={{ businesses: fetchBusinesses, transactions: fetchTransactions, subscriptions: fetchSubscriptions, apiKeys: fetchApiKeys, webhooks: fetchWebhooks, limits: fetchPlanLimits, audit: fetchAuditLogs }} />
            </div>
          )}

          {/* Plan Limits Tab */}
          {activeTab === 'limits' && (
            <div className="space-y-6">
              {planStats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {planStats.map((stat) => (
                    <div key={stat.plan} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="text-sm text-slate-400">{stat.plan || 'Free'}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.businesses}</p>
                      <p className="text-xs text-slate-500">{stat.totalTransactions} txns</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Business</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Plan</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Usage</th>
                        <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {planLimits.map((limit) => (
                        <tr key={limit._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-white">{limit.businessName}</p>
                            <p className="text-sm text-slate-500">{limit.email}</p>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              limit.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                              limit.plan === 'Growth' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-700 text-slate-400'
                            }`}>{limit.plan || 'Free'}</span>
                          </td>
                          <td className="p-4">
                            <div className="w-24">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">{limit.used}</span>
                                <span className="text-slate-400">{limit.limit === 'Unlimited' ? '∞' : limit.limit}</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full ${
                                  limit.status === 'blocked' ? 'bg-red-500' :
                                  limit.status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`} style={{ width: `${Math.min(limit.percentage, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(limit.status)}`}>
                              {limit.status === 'ok' ? 'OK' : limit.status === 'warning' ? 'Warning' : 'Blocked'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <AdminPagination pagination={pagination} activeTab={activeTab} fetchHandlers={{ businesses: fetchBusinesses, transactions: fetchTransactions, subscriptions: fetchSubscriptions, apiKeys: fetchApiKeys, webhooks: fetchWebhooks, limits: fetchPlanLimits, audit: fetchAuditLogs }} />
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'apiKeys' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Name</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">Business</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {apiKeys.map((key) => (
                      <tr key={key._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-white">{key.name}</p>
                          <code className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{key.key}</code>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-white">{key.ownerId?.businessName || 'N/A'}</p>
                          <p className="text-sm text-slate-500">{key.ownerId?.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${key.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {key.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 hidden sm:table-cell">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination pagination={pagination} activeTab={activeTab} fetchHandlers={{ businesses: fetchBusinesses, transactions: fetchTransactions, subscriptions: fetchSubscriptions, apiKeys: fetchApiKeys, webhooks: fetchWebhooks, limits: fetchPlanLimits, audit: fetchAuditLogs }} />
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Name</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden lg:table-cell">URL</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Failures</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {webhooks.map((wh) => (
                      <tr key={wh._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-white">{wh.name}</p>
                          <p className="text-sm text-slate-500">{wh.ownerId?.businessName}</p>
                        </td>
                        <td className="p-4 text-slate-400 text-sm max-w-xs truncate hidden lg:table-cell">{wh.url}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${wh.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {wh.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={wh.failureCount > 0 ? 'text-red-400' : 'text-slate-400'}>
                            {wh.failureCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination pagination={pagination} activeTab={activeTab} fetchHandlers={{ businesses: fetchBusinesses, transactions: fetchTransactions, subscriptions: fetchSubscriptions, apiKeys: fetchApiKeys, webhooks: fetchWebhooks, limits: fetchPlanLimits, audit: fetchAuditLogs }} />
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Time</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase">Action</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden sm:table-cell">Resource</th>
                      <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">No audit logs yet</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4 text-slate-400 text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs font-medium">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 hidden sm:table-cell">{log.resource}</td>
                          <td className="p-4 text-slate-500 text-xs hidden md:table-cell">{log.ipAddress || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <AdminPagination pagination={pagination} activeTab={activeTab} fetchHandlers={{ businesses: fetchBusinesses, transactions: fetchTransactions, subscriptions: fetchSubscriptions, apiKeys: fetchApiKeys, webhooks: fetchWebhooks, limits: fetchPlanLimits, audit: fetchAuditLogs }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const AdminPagination: React.FC<{ pagination: PaginationState; activeTab: string; fetchHandlers: Record<string, (page: number) => void> }> = ({ pagination, activeTab, fetchHandlers }) => {
  const handlePrev = () => fetchHandlers[activeTab]?.(pagination.page - 1);
  const handleNext = () => fetchHandlers[activeTab]?.(pagination.page + 1);
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      <p className="text-slate-400 text-sm">
        Showing {Math.min((pagination.page - 1) * 20 + 1, pagination.total)} - {Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
      </p>
      <div className="flex gap-2">
        <button onClick={handlePrev} disabled={pagination.page === 1}
          className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">
          <ChevronLeft size={18} />
        </button>
        <span className="px-4 py-2 bg-slate-800 rounded-lg text-sm">
          {pagination.page} / {pagination.totalPages || 1}
        </span>
        <button onClick={handleNext} disabled={pagination.page >= pagination.totalPages}
          className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Admin;
