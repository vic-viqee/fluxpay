import React, { useState } from 'react';
import { initiateStkPushPayment } from '../services/api';

interface StkPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StkPushModal: React.FC<StkPushModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!phoneNumber || !amount) {
      setMessage({ text: 'Phone Number and Amount are required.', type: 'error' });
      return;
    }
    if (!/^254(7|1)\d{8}$/.test(phoneNumber)) {
      setMessage({ text: 'Invalid Kenyan M-Pesa phone number format (e.g., 2547... or 2541...).', type: 'error' });
      return;
    }
    if (Number(amount) <= 0) {
      setMessage({ text: 'Amount must be greater than 0.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await initiateStkPushPayment({
        phoneNumber,
        amount: Number(amount),
      });
      setMessage({ text: `STK Push sent to ${phoneNumber}. Please check your phone.`, type: 'success' });
      
      // Clear form and close modal after a delay
      setTimeout(() => {
        setPhoneNumber('');
        setAmount('');
        onSuccess();
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('STK Push initiation failed:', error);
      setMessage({ text: error.response?.data?.message || 'Failed to initiate STK Push.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Simulate STK Push</h2>
          <button onClick={onClose} className="btn btn-secondary">&times;</button>
        </div>
        
        {message.text && (
          <div className={`p-3 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="stkPhoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="stkPhoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 2547XXXXXXXX"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="stkAmount" className="block text-sm font-medium text-gray-700">Amount (KES)</label>
            <input
              type="number"
              id="stkAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send STK Push'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
