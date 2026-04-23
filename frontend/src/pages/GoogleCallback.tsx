import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GoogleCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const completeGoogleLogin = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const token = params.get('token');
      const ticket = params.get('ticket');
      const error = params.get('error');

      if (error) {
        navigate(`/login?error=${error}`);
        return;
      }

      if (ticket) {
        navigate(`/google-register-complete?ticket=${encodeURIComponent(ticket)}`);
        return;
      }

      if (token) {
        localStorage.setItem('token', token);
        await refreshAuth();
        navigate('/dashboard');
        return;
      }

      if (!code) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.post('/auth/google/exchange-code', { code });
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        await refreshAuth();
        navigate('/dashboard');
      } catch (err) {
        navigate('/login');
      }
    };

    completeGoogleLogin();
  }, [location, navigate, refreshAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg">
      <div className="text-white">Loading...</div>
    </div>
  );
};

export default GoogleCallback;