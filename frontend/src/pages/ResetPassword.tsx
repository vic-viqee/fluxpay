import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>(); // Get token from URL params

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage('Your password has been reset successfully. Redirecting to login...');
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-bg rounded-lg shadow-md border border-surface-bg">
        <div className="text-center">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="w-32 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-gray-400">Enter your new password</p>
        </div>

        {message && <div className="p-4 text-sm text-green-400 bg-green-900 bg-opacity-50 rounded-lg border border-green-400">{message}</div>}
        {error && <div className="p-4 text-sm text-red-400 bg-red-900 bg-opacity-50 rounded-lg border border-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
