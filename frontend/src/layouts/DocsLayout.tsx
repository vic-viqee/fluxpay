import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Book, 
  Zap, 
  CreditCard, 
  Link as LinkIcon, 
  Users, 
  Receipt, 
  Key, 
  Webhook,
  Code,
  Search,
  Menu,
  X,
  Home
} from 'lucide-react';

const DocsLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const navItems = [
    { id: 'getting-started', label: 'Getting Started', icon: <Zap size={18} />, path: '/docs/getting-started', new: true },
    { id: 'quick-start', label: 'Quick Start', icon: <Zap size={18} />, path: '/docs/quick-start', badge: 'Popular' },
    { id: 'api-reference', label: 'API Reference', icon: <Code size={18} />, path: '/docs/api' },
    { id: 'dynamic-till', label: 'Dynamic Till', icon: <CreditCard size={18} />, path: '/docs/dynamic-till' },
    { id: 'payment-links', label: 'Payment Links', icon: <LinkIcon size={18} />, path: '/docs/payment-links' },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard size={18} />, path: '/docs/transactions' },
    { id: 'customers', label: 'Customers', icon: <Users size={18} />, path: '/docs/customers' },
    { id: 'receipts', label: 'Receipts', icon: <Receipt size={18} />, path: '/docs/receipts' },
    { id: 'api-keys', label: 'API Keys', icon: <Key size={18} />, path: '/docs/api-keys' },
    { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={18} />, path: '/docs/webhooks' },
    { id: 'integration', label: 'Integration', icon: <Code size={18} />, path: '/docs/integration' },
  ];

  const filteredNav = searchQuery 
    ? navItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navItems;

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <Link to="/docs" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">F</span>
            </div>
            <span className="font-bold text-gray-800">Docs</span>
          </Link>
        </div>
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to site
        </Link>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-white text-sm">F</span>
                  </div>
                  <span className="font-bold text-gray-800">FluxPay Docs</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              <Link
                to="/docs"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  currentPath === '/docs' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home size={18} />
                <span className="font-medium">Documentation Home</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    currentPath === item.path ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  {item.new && (
                    <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">New</span>
                  )}
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{item.badge}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Link to="/docs" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-white text-lg">F</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">FluxPay</h1>
              <p className="text-xs text-gray-500">Documentation</p>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/docs"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              currentPath === '/docs' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home size={18} />
            <span className="font-medium">Documentation Home</span>
          </Link>
          
          {filteredNav.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                currentPath === item.path ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {item.new && (
                <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">New</span>
              )}
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/gateway/signup"
            className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Book size={18} />
            <span className="font-medium">Get Started Free</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0">
        <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DocsLayout;