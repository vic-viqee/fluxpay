import React, { useState } from 'react';
import { Phone, Copy, Check, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { gatewayTransactions } from '../../services/gatewayApi';

const GatewayDynamicTill: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountReference, setAccountReference] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState<string>('');

  const businessTill = '123456';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !phoneNumber || !accountReference) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await gatewayTransactions.initiate({
        phoneNumber,
        amount: parseInt(amount),
        accountReference,
        transactionDesc: description || accountReference,
      });
      setTransactionId(response.transactionId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const copyTill = () => {
    navigator.clipboard.writeText(businessTill);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setAmount('');
    setPhoneNumber('');
    setAccountReference('');
    setDescription('');
    setSuccess(false);
    setTransactionId('');
  };

  if (success) {
    return (
      <div className="p-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-green-500 p-6 text-center">
              <Check size={48} className="text-white mx-auto mb-2" />
              <h2 className="text-xl font-bold text-white">Payment Initiated</h2>
              <p className="text-green-100">Waiting for customer to complete payment</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-800">KES {parseInt(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-800">{phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-500">Reference</span>
                <span className="font-medium text-gray-800">{accountReference}</span>
              </div>
              {transactionId && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="text-sm font-mono text-gray-600">{transactionId.slice(-8)}</span>
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Waiting for payment...</p>
                  <p className="mt-1">Ask the customer to check their phone and enter their M-Pesa PIN.</p>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                New Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dynamic Till</h1>
          <p className="text-gray-500">Enter amount and let customers pay via M-Pesa</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="2547XXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Reference *</label>
                <input
                  type="text"
                  value={accountReference}
                  onChange={(e) => setAccountReference(e.target.value)}
                  placeholder="Invoice # or Description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment description"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Initiating...
                  </>
                ) : (
                  <>
                    <Phone size={18} />
                    Send Payment Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* QR Display */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Scan to Pay</h3>
              <p className="text-gray-500 text-sm">Customer scans this QR code</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner mb-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    business: businessTill,
                    amount: amount || '0',
                    reference: accountReference || 'payment'
                  })}
                  size={200}
                  level="H"
                />
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Business Till</p>
                    <p className="font-bold text-xl text-gray-800">{businessTill}</p>
                  </div>
                  <button
                    onClick={copyTill}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                  </button>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>How to pay:</strong>
                  </p>
                  <ol className="mt-2 text-sm text-blue-600 list-decimal list-inside space-y-1">
                    <li>Customer scans QR code</li>
                    <li>Enters {amount || 'amount'} on their phone</li>
                    <li>Enters PIN to confirm</li>
                    <li>Payment received automatically</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatewayDynamicTill;
