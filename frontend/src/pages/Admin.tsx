import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, CreditCard, Activity, DollarSign, 
  Package, Key, Webhook, Search, ChevronLeft, ChevronRight,
  Menu, Bell, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Overview {
  totalBusinesses: number;
  activeBusinesses: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number; transactions: number }[];
  transactions: { total: number; success: number; pending: number; failed: number };
  subscriptions: { total: number; active: number; failed: number };
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

const Admin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchOverview();
      fetchBusinesses();
    }
  }, [isAdmin, activeTab]);

  const checkAdminStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

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
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    }
  };

  const formatKES = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-primary-bg flex">
      {/* Admin Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-surface-bg border-r border-gray-800 transform transition-transform duration-200 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-gray-800">
          <Link to="/dashboard" className="text-2xl font-bold text-white">FluxPay</Link>
          <p className="text-sm text-gray-400">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
            { id: 'businesses', label: 'Businesses', icon: <Users size={18} /> },
            { id: 'transactions', label: 'Transactions', icon: <CreditCard size={18} /> },
            { id: 'subscriptions', label: 'Subscriptions', icon: <Package size={18} /> },
            { id: 'apiKeys', label: 'API Keys', icon: <Key size={18} /> },
            { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === tab.id ? 'bg-main text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
            <LogOut size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col">
        {/* Admin Navbar */}
        <div className="bg-surface-bg border-b border-gray-800 p-4 flex items-center justify-between">
          <button className="md:hidden p-2 text-gray-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-main rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-white text-sm">{user?.businessName || 'Admin'}</span>
            </div>
          </div>
        </div>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">Manage FluxPay platform</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
              <TabButton 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
                icon={<Activity size={16} />} 
                label="Overview" 
              />
              <TabButton 
                active={activeTab === 'businesses'} 
                onClick={() => setActiveTab('businesses')} 
                icon={<Users size={16} />} 
                label="Businesses" 
              />
              <TabButton 
                active={activeTab === 'transactions'} 
                onClick={() => setActiveTab('transactions')} 
                icon={<CreditCard size={16} />} 
                label="Transactions" 
              />
              <TabButton 
                active={activeTab === 'subscriptions'} 
                onClick={() => setActiveTab('subscriptions')} 
                icon={<Package size={16} />} 
                label="Subscriptions" 
              />
              <TabButton 
                active={activeTab === 'apiKeys'} 
                onClick={() => setActiveTab('apiKeys')} 
                icon={<Key size={16} />} 
                label="API Keys" 
              />
              <TabButton 
                active={activeTab === 'webhooks'} 
                onClick={() => setActiveTab('webhooks')} 
                icon={<Webhook size={16} />} 
                label="Webhooks" 
              />
            </div>

            {activeTab === 'overview' && overview && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total Businesses" 
                    value={overview.totalBusinesses.toString()} 
                    icon={<Users className="text-main" />}
                  />
                  <StatCard 
                    title="Active Businesses" 
                    value={overview.activeBusinesses.toString()} 
                    icon={<Activity className="text-secondary" />}
                  />
                  <StatCard 
                    title="Total Revenue" 
                    value={formatKES(overview.totalRevenue)} 
                    icon={<DollarSign className="text-green-500" />}
                  />
                  <StatCard 
                    title="Active Subscriptions" 
                    value={overview.subscriptions.active.toString()} 
                    icon={<Package className="text-accent" />}
                  />
                </div>

                {/* Transaction & Subscription Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Transaction Status</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Successful</span>
                        <span className="text-green-400 font-medium">{overview.transactions.success}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pending</span>
                        <span className="text-yellow-400 font-medium">{overview.transactions.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Failed</span>
                        <span className="text-red-400 font-medium">{overview.transactions.failed}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Transactions</span>
                          <span className="text-white font-bold">{overview.transactions.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Subscription Status</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active</span>
                        <span className="text-green-400 font-medium">{overview.subscriptions.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Failed</span>
                        <span className="text-red-400 font-medium">{overview.subscriptions.failed}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total</span>
                          <span className="text-white font-bold">{overview.subscriptions.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Keys & Webhooks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Keys</span>
                        <span className="text-green-400 font-medium">{overview.apiKeys.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Keys</span>
                        <span className="text-white font-medium">{overview.apiKeys.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Webhooks</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Webhooks</span>
                        <span className="text-green-400 font-medium">{overview.webhooks.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Webhooks</span>
                        <span className="text-white font-medium">{overview.webhooks.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'businesses' && (
              <div className="space-y-6">
                {/* Search */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search businesses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses()}
                      className="w-full bg-surface-bg border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-main/50 outline-none"
                    />
                  </div>
                  <button
                    onClick={() => fetchBusinesses()}
                    className="px-4 py-2 bg-main text-white rounded-xl hover:bg-blue-600"
                  >
                    Search
                  </button>
                </div>

                {/* Table */}
                <div className="bg-surface-bg rounded-2xl border border-gray-800 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">Business</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Revenue</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Transactions</th>
                        <th className="text-left p-4 text-gray-400 font-medium">API Keys</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.map((business) => (
                        <tr key={business._id} className="border-t border-gray-800 hover:bg-gray-800/30">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{business.businessName}</p>
                              <p className="text-gray-400 text-sm">{business.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              business.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                              business.plan === 'Growth' ? 'bg-blue-500/20 text-blue-400' :
                              business.plan === 'Starter' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {business.plan || 'Free'}
                            </span>
                          </td>
                          <td className="p-4 text-white">{formatKES(business.totalRevenue)}</td>
                          <td className="p-4 text-gray-300">{business.successfulTransactions}</td>
                          <td className="p-4 text-gray-300">{business.activeApiKeys}</td>
                          <td className="p-4 text-gray-400">
                            {new Date(business.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <p className="text-gray-400">
                    Showing {businesses.length} of {pagination.total} businesses
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchBusinesses(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 bg-surface-bg border border-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => fetchBusinesses(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 bg-surface-bg border border-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'overview' && activeTab !== 'businesses' && (
              <div className="text-center py-12 text-gray-400">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view coming soon...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className="p-2 bg-gray-800 rounded-lg">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-main text-white' : 'text-gray-400 hover:text-white hover:bg-surface-bg'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default Admin;