import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <aside
      className={"transform top-0 left-0 w-64 bg-gray-800 text-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-50 " +
                 (isOpen ? 'translate-x-0' : '-translate-x-full') +
                 " md:relative md:translate-x-0 "}
    >
      <div className="p-4 flex flex-col h-full">
        <Link to="/dashboard" className="flex items-center mb-6">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="h-10" />
        </Link>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link to="/dashboard" className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md" onClick={toggleSidebar}>
                {/* Icon for Dashboard */}
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/customers" className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md" onClick={toggleSidebar}>
                {/* Icon for Customers */}
                <span className="ml-3">Customers</span>
              </Link>
            </li>
            <li>
              <Link to="/subscriptions" className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md" onClick={toggleSidebar}>
                {/* Icon for Subscriptions */}
                <span className="ml-3">Subscriptions</span>
              </Link>
            </li>
            <li>
              <Link to="/payments" className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md" onClick={toggleSidebar}>
                {/* Icon for Payments */}
                <span className="ml-3">Payments</span>
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md" onClick={toggleSidebar}>
                {/* Icon for Analytics */}
                <span className="ml-3">Analytics</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md" onClick={toggleSidebar}>
                {/* Icon for Settings */}
                <span className="ml-3">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
