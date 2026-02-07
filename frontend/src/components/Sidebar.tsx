import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import moment from 'moment';

interface UserProfile {
  _id: string;
  businessName?: string;
  username: string;
  email: string;
  createdAt: string;
  has_received_payment: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: UserProfile | null;
}

const NavLink: React.FC<{ to: string; label: string; disabled: boolean; onClick: () => void; }> = ({ to, label, disabled, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const linkClasses = `flex items-center p-2 rounded-md transition-colors ${
    isActive ? 'bg-main text-white' : 'text-gray-300 hover:bg-secondary hover:text-white'
  } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`;

  return (
    <li title={disabled ? "Unlock this feature by receiving your first payment." : ""}>
      <Link
        to={disabled ? '#' : to}
        className={linkClasses}
        onClick={onClick}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        <span className="ml-3">{label}</span>
      </Link>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, user }) => {
  const accountAgeInHours = user ? moment().diff(moment(user.createdAt), 'hours') : 0;
  const canSeeAdvancedFeatures = user?.has_received_payment || accountAgeInHours < 48;

  return (
    <aside
      className={"transform top-0 left-0 w-64 bg-primary-bg text-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-50 " +
                 (isOpen ? 'translate-x-0' : '-translate-x-full') +
                 " md:relative md:translate-x-0 "}
    >
      <div className="p-4 flex flex-col h-full">
        <Link to="/dashboard" className="flex items-center mb-6">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="h-10" />
        </Link>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <NavLink to="/dashboard" label="Dashboard" disabled={false} onClick={toggleSidebar} />
            <NavLink to="/customers" label="Customers" disabled={false} onClick={toggleSidebar} />
            <NavLink to="/subscriptions" label="Subscriptions" disabled={false} onClick={toggleSidebar} />
            <NavLink to="/payments" label="Payments" disabled={false} onClick={toggleSidebar} />
            <NavLink to="/analytics" label="Analytics" disabled={!canSeeAdvancedFeatures} onClick={toggleSidebar} />
            <NavLink to="/settings" label="Settings" disabled={!canSeeAdvancedFeatures} onClick={toggleSidebar} />
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
