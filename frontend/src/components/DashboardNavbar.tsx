import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardNavbarProps {
  toggleSidebar: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-surface-bg shadow-sm p-4 flex justify-between items-center">
      <div className="md:hidden flex items-center"> {/* Hamburger icon for mobile */}
        <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-300 hover:bg-main hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <h1 className="text-xl font-bold text-white ml-4 md:ml-0">Dashboard</h1>
      <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-main bg-transparent border border-main rounded-md shadow-sm hover:bg-main hover:text-white transition-colors">Logout</button>
    </nav>
  );
};

export default DashboardNavbar;
