import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  User,
  LogOut,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';

const PortalLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = usePortalAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/portal/dashboard' },
    { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={20} />, path: '/portal/subscriptions' },
    { id: 'transactions', label: 'Transactions', icon: <FileText size={20} />, path: '/portal/transactions' },
    { id: 'invoices', label: 'Invoices', icon: <Receipt size={20} />, path: '/portal/invoices' },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, path: '/portal/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">F</span>
            </div>
            <span className="font-bold text-gray-800">Customer Portal</span>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
          <LogOut size={20} />
        </button>
      </header>

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
                    currentPath === item.path
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

      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-white text-lg">F</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">FluxPay</h1>
              <p className="text-xs text-gray-500">Customer Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Signed in as</p>
              <p className="font-medium text-gray-800 text-sm truncate">{user.email}</p>
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

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default PortalLayout;
