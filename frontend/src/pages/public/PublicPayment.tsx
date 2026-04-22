import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface PaymentLinkData {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  ownerName: string;
  ownerLogo?: string;
  paymentLink: string;
}

const PublicPayment: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [paymentLink, setPaymentLink] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      try {
        const response = await api.get(`/gateway/pay/${code}`);
        setPaymentLink(response.data);
        setLoading(false);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Payment link not found');
        } else if (err.response?.status === 410) {
          setError(err.response.data.message || 'Payment link has expired');
        } else {
          setError('Failed to load payment link');
        }
        setLoading(false);
      }
    };

    if (code) {
      fetchPaymentLink();
    }
  }, [code]);

  const formatPhone = (phone: string) => {
    return phone.replace(/^0/, '254').replace(/^\+?254(\d{9})$/, '254$1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const normalized = formatPhone(phoneNumber);
    if (!normalized.startsWith('254')) {
      setFormError('Please enter a valid Kenyan phone number (07xx or 254xx)');
      return;
    }

    setStatus('processing');

    try {
      await api.post(`/gateway/pay/${code}`, {
        phoneNumber: normalized,
        customerName,
        customerEmail
      });
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
          <h1 className="text-xl font-bold text-white mb-2">Payment Unavailable</h1>
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
            <span className="text-green-400 font-bold">KES {paymentLink?.amount.toLocaleString()}</span>
          </p>
          <div className="text-xs text-gray-600">
            {paymentLink?.ownerName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          {paymentLink?.ownerLogo ? (
            <img src={paymentLink.ownerLogo} alt={paymentLink.ownerName} className="h-12 mx-auto mb-4" />
          ) : (
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-gray-900">F</span>
            </div>
          )}
          <h1 className="text-xl font-bold text-white">{paymentLink?.title}</h1>
          {paymentLink?.description && (
            <p className="text-gray-400 text-sm mt-1">{paymentLink.description}</p>
          )}
        </div>

        <div className="bg-gray-700/50 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Amount to pay</p>
          <p className="text-3xl font-bold text-white">
            KES {paymentLink?.amount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">{paymentLink?.currency}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {status === 'processing' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with M-Pesa'
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

export default PublicPayment;