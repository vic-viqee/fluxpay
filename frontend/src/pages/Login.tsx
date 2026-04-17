import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { googleAuthUrl } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/login', { email, password });
      
      // Wait for auth to be refreshed and get user data
      await refreshAuth();
      
      // Get updated user from localStorage or re-fetch
      const userResponse = await api.get('/users/me');
      const userData = userResponse.data;
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-bg rounded-lg shadow-md border border-surface-bg">
        <div className="text-center">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="w-32 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400">Sign in to manage your payments</p>
        </div>

        {error && <div className="p-4 text-sm text-red-400 bg-red-900 bg-opacity-50 rounded-lg border border-red-400">{error}</div>}

        <div>
          <a
            href={googleAuthUrl}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </a>
        </div>

        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-2 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-main bg-gray-700 border-gray-600 rounded focus:ring-main" />
              <label className="ml-2 block text-sm text-gray-300">Remember me</label>
            </div>
            <a href="/forgot-password" className="text-sm text-main hover:underline">Forgot password?</a>
          </div>

          <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
            Sign In
          </button>
        </form>

        <p className="text-sm text-center text-gray-400">
          Don't have an account? <a href="/signup" className="font-medium text-main hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;