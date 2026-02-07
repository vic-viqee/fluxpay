import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

interface UserProfile {
  _id: string;
  businessName?: string;
  username: string;
  email: string;
  createdAt: string;
  has_received_payment: boolean;
}

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen bg-primary-bg">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} user={user} />
      
      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardNavbar toggleSidebar={toggleSidebar} /> {/* Pass toggleSidebar to Navbar */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary-bg p-6">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
