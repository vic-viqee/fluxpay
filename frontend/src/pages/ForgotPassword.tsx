import React, { useState } from 'react';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setError('');
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
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-gray-400">Enter your email to receive a password reset link</p>
        </div>

        {message && <div className="p-4 text-sm text-green-400 bg-green-900 bg-opacity-50 rounded-lg border border-green-400">{message}</div>}
        {error && <div className="p-4 text-sm text-red-400 bg-red-900 bg-opacity-50 rounded-lg border border-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
            Send Reset Link
          </button>
        </form>

        <p className="text-sm text-center text-gray-400">
          Remembered your password? <a href="/login" className="font-medium text-main hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
