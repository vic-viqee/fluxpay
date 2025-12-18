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
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="md:hidden flex items-center"> {/* Hamburger icon for mobile */}
        <button onClick={toggleSidebar} className="btn btn-secondary">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <h1 className="text-xl font-bold text-gray-800 ml-4 md:ml-0">Dashboard</h1>
      <button onClick={handleLogout} className="btn btn-outline">Logout</button>
    </nav>
  );
};

export default DashboardNavbar;
