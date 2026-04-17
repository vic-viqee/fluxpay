import React, { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, CreditCard, Activity, DollarSign, 
  ArrowUpRight, ArrowDownRight, AlertCircle 
} from 'lucide-react';
import api from '../services/api';

const COLORS = ['#0066FF', '#00C2A8', '#FF6B35', '#EF4444', '#F59E0B'];

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await api.get('/analytics');
        setAnalyticsData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const formatTrend = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const isTrendPositive = (metric: string): boolean => {
    if (!analyticsData?.trends) return true;
    const trendValue = analyticsData.trends[metric];
    return trendValue >= 0;
  };

  const formatKES = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[month - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-primary-bg min-h-screen">
        <div className="max-w-4xl mx-auto p-4 text-sm text-red-400 bg-red-900 bg-opacity-20 rounded-lg border border-red-800 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  const { totals, transactionStatusBreakdown, subscriptionStatusBreakdown, monthlyRevenue } = analyticsData;

  // Transform monthly revenue for Recharts
  const revenueChartData = monthlyRevenue.map((item: any) => ({
    name: `${getMonthName(item._id.month)} ${item._id.year}`,
    revenue: item.revenue,
    transactions: item.transactions
  }));

  // Transform status breakdown for Recharts
  const statusData = transactionStatusBreakdown.map((item: any) => ({
    name: item._id,
    value: item.count
  }));

  const subStatusData = subscriptionStatusBreakdown.map((item: any) => ({
    name: item._id,
    value: item.count
  }));

  return (
    <div className="min-h-screen bg-primary-bg text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1 text-sm md:text-base">Track your business growth and transaction performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-surface-bg border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Activity size={16} />
              Last 6 Months
            </button>
            <a 
              href="/dashboard" 
              className="px-4 py-2 bg-main hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={formatKES(totals.totalRevenue)} 
            icon={<DollarSign className="text-secondary" />} 
            trend={analyticsData.trends ? formatTrend(analyticsData.trends.revenue) : 'N/A'}
            isPositive={isTrendPositive('revenue')}
          />
          <StatCard 
            title="Active Subscriptions" 
            value={totals.totalSubscriptions} 
            icon={<CreditCard className="text-main" />} 
            trend={analyticsData.trends ? formatTrend(analyticsData.trends.subscriptions) : 'N/A'}
            isPositive={isTrendPositive('subscriptions')}
          />
          <StatCard 
            title="Total Customers" 
            value={totals.totalCustomers} 
            icon={<Users className="text-accent" />} 
            trend={analyticsData.trends ? formatTrend(analyticsData.trends.customers) : 'N/A'}
            isPositive={isTrendPositive('customers')}
          />
          <StatCard 
            title="Success Rate" 
            value={`${totals.successRate.toFixed(1)}%`} 
            icon={<Activity className="text-green-500" />} 
            trend={totals.successRate > 90 ? "Healthy" : "Needs Review"}
            isPositive={totals.successRate > 90}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Revenue Chart */}
          <div className="lg:col-span-2 bg-surface-bg border border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-main"></div> Revenue</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `KES ${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1F26', border: '1px solid #374151', borderRadius: '8px' }}
                    itemStyle={{ color: '#E5E7EB' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Status Pie Chart */}
          <div className="bg-surface-bg border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Transaction Status</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1F26', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Transactions</span>
                <span className="font-semibold">{totals.totalTransactions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-secondary font-semibold">{totals.successRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-bg border border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-accent">Subscription Health</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1F26', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {subStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'ACTIVE' ? '#00C2A8' : '#FF6B35'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-main to-blue-700 rounded-xl p-8 text-white flex flex-col justify-between overflow-hidden relative shadow-lg">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2 text-white">Need deeper insights?</h3>
              <p className="text-blue-100 max-w-xs text-sm md:text-base">
                Upgrade to our Enterprise plan to access advanced cohort analysis and automated financial reconciliation.
              </p>
            </div>
            <button className="relative z-10 mt-6 bg-white text-main font-bold py-3 px-6 rounded-lg self-start hover:bg-gray-100 transition-all shadow-md active:scale-95">
              Explore Enterprise
            </button>
            <TrendingUp className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  isPositive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, isPositive }) => (
  <div className="bg-surface-bg border border-gray-800 rounded-xl p-6 shadow-sm hover:border-gray-700 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-primary-bg rounded-lg group-hover:bg-gray-700 transition-colors">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-secondary' : 'text-accent'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  </div>
);

export default Analytics;
