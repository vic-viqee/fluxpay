import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Receipt, 
  Key, 
  Webhook,
  LogOut, 
  Menu, 
  X,
  QrCode,
  MousePointer,
  ArrowUpCircle,
  Lock,
  Crown
} from 'lucide-react';

const GatewayLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userPlan, setUserPlan] = useState<string>('free');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserPlan(user.plan || 'free');
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/gateway' },
    { id: 'till', label: 'Dynamic Till', icon: <QrCode size={20} />, path: '/gateway/till' },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard size={20} />, path: '/gateway/transactions' },
    { id: 'payment-links', label: 'Payment Links', icon: <MousePointer size={20} />, path: '/gateway/payment-links' },
    { id: 'payment-buttons', label: 'Payment Buttons', icon: <MousePointer size={20} />, path: '/gateway/payment-buttons' },
    { id: 'customers', label: 'Customers', icon: <Users size={20} />, path: '/gateway/customers' },
    { id: 'receipts', label: 'Receipts', icon: <Receipt size={20} />, path: '/gateway/receipts' },
    { id: 'api-keys', label: 'API Keys', icon: <Key size={20} />, path: '/gateway/api-keys' },
    { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={20} />, path: '/gateway/webhooks' },
    { 
      id: 'b2c', 
      label: 'B2C Payouts', 
      icon: <ArrowUpCircle size={20} />, 
      path: '/pricing',
      locked: true 
    },
  ];

  const premiumNavItems = navItems.filter(item => item.locked);
  const regularNavItems = navItems.filter(item => !item.locked);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/gateway/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">F</span>
            </div>
            <span className="font-bold text-gray-800">FluxPay Gateway</span>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
          <LogOut size={20} />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white text-sm">F</span>
                </div>
                <span className="font-bold text-gray-800">FluxPay</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPath === item.path || (item.path === '/gateway' && currentPath === '/gateway')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-white text-lg">F</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">FluxPay</h1>
              <p className="text-xs text-gray-500">Gateway Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {regularNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.path || (item.path === '/gateway' && currentPath === '/gateway')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* Premium Section */}
          {premiumNavItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <Crown size={14} />
                Premium Features
              </div>
              {premiumNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  <Lock size={18} />
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">PRO</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Plan Badge */}
        {userPlan === 'free' && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Your Plan</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">Free</span>
                <Link
                  to="/pricing"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Upgrade
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default GatewayLayout;
