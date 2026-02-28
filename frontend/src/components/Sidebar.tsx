import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  History, PieChart, Settings, 
  ChevronRight, LogOut, Package
} from 'lucide-react';

interface UserProfile {
  _id: string;
  businessName?: string;
  username: string;
  email: string;
  createdAt: string;
  has_received_payment?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: UserProfile | null;
}

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon, disabled, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li title={disabled ? "Unlock this feature by receiving your first payment." : ""}>
      <Link
        to={disabled ? '#' : to}
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
          ? 'bg-main text-white shadow-lg shadow-main/20' 
          : 'text-gray-400 hover:bg-surface-bg hover:text-white'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        <div className="flex items-center gap-3">
          <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-main'} transition-colors`}>
            {icon}
          </span>
          <span className="font-medium text-sm">{label}</span>
        </div>
        {isActive && <ChevronRight size={14} className="opacity-50" />}
      </Link>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, user }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary-bg border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full p-6">
        {/* Logo Section */}
        <div className="mb-10 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-main rounded-xl flex items-center justify-center shadow-lg shadow-main/20 group-hover:scale-105 transition-transform">
              <img src="/img/favicon-32x32.png" alt="F" className="w-6 h-6 invert" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FluxPay</span>
          </Link>
          <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-400 hover:bg-surface-bg rounded-lg">
            <ChevronRight className="rotate-180" size={20} />
          </button>
        </div>

        {/* Business Context */}
        {user && (
          <div className="mb-8 p-4 bg-surface-bg rounded-2xl border border-gray-800">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Business</p>
            <p className="text-sm font-bold text-white truncate">{user.businessName || user.username}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user.has_received_payment ? 'bg-secondary' : 'bg-yellow-500'}`} />
              <span className="text-[10px] text-gray-400 font-medium">
                {user.has_received_payment ? 'Active Account' : 'Pending Activation'}
              </span>
            </div>
          </div>
        )}
        
        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          <ul className="space-y-1">
            <NavLink to="/dashboard" label="Overview" icon={<LayoutDashboard size={20} />} onClick={toggleSidebar} />
            <NavLink to="/customers" label="Customers" icon={<Users size={20} />} onClick={toggleSidebar} />
            <NavLink to="/subscriptions" label="Subscriptions" icon={<Package size={20} />} onClick={toggleSidebar} />
            <NavLink to="/payments" label="Payments" icon={<History size={20} />} onClick={toggleSidebar} />
            <NavLink to="/analytics" label="Analytics" icon={<PieChart size={20} />} onClick={toggleSidebar} />
          </ul>

          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-8 mb-4">Account</p>
          <ul className="space-y-1">
            <NavLink to="/settings" label="Settings" icon={<Settings size={20} />} onClick={toggleSidebar} />
          </ul>
        </nav>

        {/* Footer Info */}
        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-2 text-gray-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            System Operational
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
