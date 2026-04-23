import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface ButtonData {
  _id: string;
  buttonId: string;
  title: string;
  description?: string;
  defaultAmount?: number;
  allowCustomAmount: boolean;
  redirectUrl?: string;
  buttonText: string;
  buttonColor: string;
  ownerName: string;
  ownerLogo?: string;
}

const PublicPaymentButton: React.FC = () => {
  const { buttonId } = useParams<{ buttonId: string }>();
  const [button, setButton] = useState<ButtonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchButton = async () => {
      try {
        const response = await api.get(`/pay/buttons/${buttonId}`);
        setButton(response.data);
        if (response.data.defaultAmount) {
          setAmount(response.data.defaultAmount.toString());
        }
        setLoading(false);
      } catch (err: any) {
        setError('Payment button not found or is no longer active');
        setLoading(false);
      }
    };

    const trackClick = async () => {
      try {
        await api.post(`/pay/buttons/${buttonId}/click`);
      } catch (err) {
        console.error('Failed to track click:', err);
      }
    };

    if (buttonId) {
      fetchButton();
      trackClick();
    }
  }, [buttonId]);

  const formatPhone = (phone: string) => {
    return phone.replace(/^0/, '254').replace(/^\+?254(\d{9})$/, '254$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalAmount = parseInt(amount);
    if (!finalAmount || finalAmount < 1) {
      setFormError('Please enter a valid amount');
      return;
    }

    const normalized = formatPhone(phoneNumber);
    if (!normalized.startsWith('254')) {
      setFormError('Please enter a valid Kenyan phone number (07xx or 254xx)');
      return;
    }

    setStatus('processing');

    try {
      const response = await api.post(`/pay/buttons/${buttonId}/pay`, {
        phoneNumber: normalized,
        amount: finalAmount,
        customerName,
        customerEmail
      });

      if (response.data.redirectUrl) {
        setRedirectUrl(response.data.redirectUrl);
      }
      
      setStatus('success');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Payment initiation failed');
      setStatus('form');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Button Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Check Your Phone</h1>
          <p className="text-gray-400 mb-2">
            A payment request has been sent to <span className="text-white font-medium">{phoneNumber}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Enter your M-Pesa PIN on your phone to complete the payment of{' '}
            <span className="text-green-400 font-bold">KES {parseInt(amount).toLocaleString()}</span>
          </p>
          
          {redirectUrl && (
            <a
              href={redirectUrl}
              className="inline-block w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              Continue
            </a>
          )}
          
          <div className="text-xs text-gray-600">
            {button?.ownerName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          {button?.ownerLogo ? (
            <img src={button.ownerLogo} alt={button.ownerName} className="h-12 mx-auto mb-4" />
          ) : (
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-gray-900">F</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-white">{button?.title}</h1>
          {button?.description && (
            <p className="text-gray-400 text-sm mt-1">{button.description}</p>
          )}
        </div>

        <div className="bg-gray-700/50 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Amount to pay</p>
          <p className="text-3xl font-bold text-white">
            KES {amount ? parseInt(amount).toLocaleString() : '—'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {button?.allowCustomAmount && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Amount (KES)</label>
              <input
                type="tel"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">M-Pesa Phone Number *</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="07XX XXX XXX"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {formError && (
            <p className="text-red-400 text-sm">{formError}</p>
          )}

          <button
            type="submit"
            disabled={status === 'processing'}
            className="w-full py-3 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: button?.buttonColor || '#25D366' }}
          >
            {status === 'processing' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              button?.buttonText || 'Pay with M-Pesa'
            )}
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-6">
          Secure payment powered by FluxPay
        </p>
      </div>
    </div>
  );
};

export default PublicPaymentButton;