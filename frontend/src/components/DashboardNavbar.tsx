import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, Bell, User, Search } from 'lucide-react';

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Overview';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="bg-primary-bg/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-800 px-4 py-3 md:px-8">
      <div className="flex items-center justify-between">
        {/* Left Side: Toggle & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar} 
            className="md:hidden p-2 text-gray-400 hover:bg-surface-bg rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Center: Search (Visible on Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions, customers..." 
              className="w-full bg-surface-bg border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-main/50 focus:border-main transition-all"
            />
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 text-gray-400 hover:bg-surface-bg rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-primary-bg"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-gray-800 mx-1 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white leading-none">{user?.username}</p>
              <p className="text-[10px] text-gray-500 mt-1">{user?.email}</p>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 bg-surface-bg rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
                {user?.logoUrl ? (
                  <img src={user.logoUrl} alt="Avatar" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-main/20 flex items-center justify-center text-main">
                    <User size={18} />
                  </div>
                )}
              </button>
              
              {/* Dropdown Menu (Simplified) */}
              <div className="absolute right-0 mt-2 w-48 bg-surface-bg border border-gray-800 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 z-50">
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-primary-bg hover:text-white transition-colors flex items-center gap-2"
                >
                  <User size={16} /> Profile Settings
                </button>
                <div className="h-[1px] bg-gray-800 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
