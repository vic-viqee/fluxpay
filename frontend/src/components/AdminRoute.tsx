import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Admin from '../pages/Admin';

const AdminRoute: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <Admin />;
};

export default AdminRoute;