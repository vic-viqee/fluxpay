import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initiateStkPushPayment } from '../services/api';

const SubscriptionCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [accountReference, setAccountReference] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">No plan selected</h1>
          <button onClick={() => navigate('/pricing')} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
            Go to Pricing
          </button>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    setMessage({ text: '', type: '' });
    let isValid = true;

    if (!phoneNumber) {
      setMessage({ text: 'Phone Number is required.', type: 'error' });
      isValid = false;
    } else if (!/^2547\d{8}$/.test(phoneNumber)) { // Basic Kenyan M-Pesa format validation
      setMessage({ text: 'Invalid Kenyan M-Pesa phone number (e.g., 2547XXXXXXXX).', type: 'error' });
      isValid = false;
    }

    if (!amount || Number(amount) <= 1) {
      setMessage({ text: 'Amount must be greater than 1.', type: 'error' });
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await initiateStkPushPayment({
        phoneNumber,
        amount: Number(amount),
        accountReference: accountReference || `${plan} Subscription`, // Default if not provided
        transactionDescription: transactionDescription || `Payment for ${plan} plan`, // Default if not provided
      });
      setMessage({ text: `STK Push sent to ${phoneNumber}. Please check your phone.`, type: 'success' });
      // Clear form after successful initiation
      setPhoneNumber('');
      setAmount('');
      setAccountReference('');
      setTransactionDescription('');
      // Optionally, navigate to dashboard after successful initiation
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('STK Push initiation failed:', error);
      setMessage({ text: error.response?.data?.message || 'Failed to initiate STK Push. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-bg rounded-lg shadow-md border border-surface-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
          <p className="text-gray-400">You are subscribing to the <strong>{plan}</strong> plan.</p>
        </div>

        <div className="p-6 border border-surface-bg rounded-lg">
            <p className="text-lg font-semibold text-white">Summary:</p>
            <div className="flex justify-between mt-4 text-gray-300">
                <span>{plan} Plan (Monthly)</span>
                <span>{plan === 'Starter' ? 'KES 999' : 'KES 2,499'}</span>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>Transaction Fee</span>
                <span>1.5%</span>
            </div>
            <div className="border-t border-surface-bg my-4"></div>
            <div className="flex justify-between font-bold text-lg text-white">
                <span>Total Due Today</span>
                <span>{plan === 'Starter' ? 'KES 999' : 'KES 2,499'}</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">Phone Number (e.g., 2547XXXXXXXX)</label>
            <input
              type="text"
              id="phoneNumber"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount (KES)</label>
            <input
              type="number"
              id="amount"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="accountReference" className="block text-sm font-medium text-gray-300">Account Reference (Optional)</label>
            <input
              type="text"
              id="accountReference"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={accountReference}
              onChange={(e) => setAccountReference(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="transactionDescription" className="block text-sm font-medium text-gray-300">Transaction Description (Optional)</label>
            <input
              type="text"
              id="transactionDescription"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={transactionDescription}
              onChange={(e) => setTransactionDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {message.text && (
            <div className={`p-3 rounded-md ${message.type === 'error' ? 'bg-red-900 text-red-400 border border-red-400' : 'bg-secondary bg-opacity-20 text-secondary border border-secondary'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main"
            disabled={isLoading}
          >
            {isLoading ? 'Initiating Payment...' : 'Pay with M-Pesa'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
