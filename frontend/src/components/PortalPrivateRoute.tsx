import { Navigate, Outlet } from 'react-router-dom';
import { usePortalAuth } from '../context/PortalAuthContext';

const PortalPrivateRoute = () => {
  const { isAuthenticated, loading } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/portal/login" />;
};

export default PortalPrivateRoute;
