import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GoogleCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const completeGoogleLogin = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const token = params.get('token');
      const ticket = params.get('ticket');

      if (ticket) {
        navigate(`/google-register-complete?ticket=${encodeURIComponent(ticket)}`);
        return;
      }

      if (token) {
        await login();
        navigate('/dashboard');
        return;
      }

      if (!code) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.post('/auth/google/exchange-code', { code });
        
        if (response.data.token || response.status === 200) {
          await login();
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    completeGoogleLogin();
  }, [location, login, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg">
      <div className="text-white">Loading...</div>
    </div>
  );
};

export default GoogleCallback;