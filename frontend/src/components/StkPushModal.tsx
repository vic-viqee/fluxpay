import React, { useState } from 'react';
import { Smartphone, DollarSign, X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { initiateSimulatedStkPushPayment } from '../services/api';

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
      setMessage({ text: 'Invalid M-Pesa format (e.g., 2547... or 2541...).', type: 'error' });
      return;
    }
    if (Number(amount) <= 0) {
      setMessage({ text: 'Amount must be greater than 0.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await initiateSimulatedStkPushPayment({
        phoneNumber,
        amount: Number(amount),
      });
      setMessage({ text: `STK Push sent! Please check your phone.`, type: 'success' });
      
      setTimeout(() => {
        setPhoneNumber('');
        setAmount('');
        onSuccess();
        onClose();
      }, 2000);

    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Failed to initiate STK Push.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface-bg border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-primary-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <Smartphone size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Test STK Push</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8">
          {message.text && (
            <div className={`p-4 mb-6 text-sm rounded-xl flex items-center gap-3 border ${
              message.type === 'error' 
              ? 'bg-red-900/20 border-red-800 text-red-400' 
              : 'bg-secondary/10 border-secondary/20 text-secondary'
            }`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="stkPhoneNumber" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Smartphone size={14} /> M-Pesa Number
              </label>
              <input
                type="tel"
                id="stkPhoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all placeholder:text-gray-600"
                placeholder="2547..."
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="stkAmount" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <DollarSign size={14} /> Amount (KES)
              </label>
              <input
                type="number"
                id="stkAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all placeholder:text-gray-600"
                placeholder="Enter amount"
                min="1"
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-3 bg-primary-bg border border-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 px-4 py-3 bg-main hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-main/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Send STK
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
