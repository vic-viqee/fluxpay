import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const GoogleRegistrationCompletion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [registrationTicket, setRegistrationTicket] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null); // NEW: State for logo file
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const ticket = queryParams.get('ticket');

    if (!ticket) {
      setError('Missing registration ticket. Please try signing in with Google again.');
      return;
    }

    const loadTrustedContext = async () => {
      try {
        const response = await api.post('/auth/google/registration-context', { ticket });
        setRegistrationTicket(ticket);
        setUsername(response.data.username || '');
        setEmail(response.data.email || '');
      } catch {
        setError('Your Google registration session is invalid or expired. Please try again.');
      }
    };

    loadTrustedContext();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!businessName || !businessType || !businessPhoneNumber) {
      setError('Business name, type, and phone number are required.');
      return;
    }

    if (!registrationTicket) {
      setError('Missing registration ticket. Please restart Google sign-in.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('ticket', registrationTicket);
      formData.append('businessName', businessName);
      formData.append('businessType', businessType);
      formData.append('businessPhoneNumber', businessPhoneNumber);
      if (logoFile) formData.append('logo', logoFile);

      const response = await api.post('/auth/google-complete-registration', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.token || response.data.user) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        await refreshAuth();
        setMessage('Registration complete! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-bg rounded-lg shadow-md border border-surface-bg">
        <div className="text-center">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="w-32 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Complete Your Registration</h1>
          <p className="text-gray-400">Just a few more details to get started with FluxPay</p>
        </div>

        {message && <div className="p-4 text-sm text-green-400 bg-green-900 bg-opacity-50 rounded-lg border border-green-400">{message}</div>}
        {error && <div className="p-4 text-sm text-red-400 bg-red-900 bg-opacity-50 rounded-lg border border-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              value={username}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              disabled // Username from Google is not editable here
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              disabled // Email from Google is not editable here
            />
          </div>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="px-2 text-gray-400">Business Details (Required)</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              placeholder="Your Business Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Business Type</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              required
            >
              <option value="">Select Business Type</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Limited Company">Limited Company</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Business Phone Number</label>
            <input
              type="tel"
              value={businessPhoneNumber}
              onChange={(e) => setBusinessPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
              placeholder="+2547XXXXXXXX"
              required
            />
          </div>

          {/* NEW: Logo Upload Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Business Logo (Optional)</label>
            <input
              type="file"
              onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-main file:text-white hover:file:bg-blue-500"
            />
            {logoFile && <p className="text-sm text-gray-400 mt-2">Selected: {logoFile.name}</p>}
          </div>

          <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
            Complete Registration
          </button>
        </form>

        <p className="text-sm text-center text-gray-400">
          Already have an account? <a href="/login" className="font-medium text-main hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default GoogleRegistrationCompletion;
