import React, { useState, useEffect } from 'react';
import { PhoneIncoming, Copy, Check, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { c2b } from '../../services/gatewayApi';

const GatewayC2B: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'setup' | 'transactions'>('setup');

  const confirmationUrl = `${window.location.origin}/api/gateway/c2b/confirm`;

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, pagination.page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await c2b.getTransactions({
        page: pagination.page,
        limit: 20
      });
      setTransactions(data.data);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      console.error('Failed to fetch C2B transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerC2BUrls = async () => {
    setRegistering(true);
    setError('');
    setSuccess('');
    try {
      await c2b.register(confirmationUrl);
      setRegistered(true);
      setSuccess('C2B URLs registered successfully! Manual payments via *384*# will now be tracked.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register C2B URLs');
    } finally {
      setRegistering(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(confirmationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReconcile = async (id: string) => {
    try {
      await c2b.reconcile(id);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to reconcile:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">C2B Manual Payments</h1>
          <p className="text-gray-500">Track and reconcile payments made via *384*# dial code</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('setup')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'setup'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Setup
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'setup' && (
        <div className="max-w-3xl">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info size={20} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">What is C2B Manual Payments?</p>
              <p className="mt-1">C2B allows you to track payments when customers dial <code className="bg-blue-100 px-1 rounded">*384*#</code> on their phone and manually enter your Till number. This is common for retail shops without QR scanners.</p>
            </div>
          </div>

          {/* Setup Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Register C2B URLs</h2>
              <p className="text-sm text-gray-500 mt-1">This registers your callback URL with Safaricom to receive manual payment notifications</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Confirmation URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-600 break-all">
                    {confirmationUrl}
                  </div>
                  <button
                    onClick={copyUrl}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p className="font-medium">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your callback URL must be publicly accessible (HTTPS)</li>
                      <li>C2B URL can only be registered once in production</li>
                      <li>After registration, restart your server to apply changes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={registerC2BUrls}
                disabled={registering || registered}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  registered
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {registering ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Registering...
                  </>
                ) : registered ? (
                  <>
                    <Check size={18} />
                    Registered Successfully
                  </>
                ) : (
                  <>
                    <PhoneIncoming size={18} />
                    Register C2B URLs
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                  {success}
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">How C2B Manual Tracking Works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Customer dials *384*#</p>
                  <p className="text-sm text-gray-500">Customer enters your Till number on their phone</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Customer enters amount</p>
                  <p className="text-sm text-gray-500">Customer types the payment amount and confirms</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Safaricom notifies FluxPay</p>
                  <p className="text-sm text-gray-500">Payment confirmation is sent to your registered URL</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">You reconcile in dashboard</p>
                  <p className="text-sm text-gray-500">View and mark manual payments as reconciled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Transaction ID</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No manual payments found yet. Register C2B URLs first.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm font-mono text-gray-600">{tx.transID}</td>
                      <td className="p-4 text-sm text-gray-600">{tx.phoneNumber}</td>
                      <td className="p-4 font-semibold text-gray-800">
                        KES {parseInt(tx.transAmount).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600">{tx.billRefNumber || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.isReconciled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.isReconciled ? 'Reconciled' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        {!tx.isReconciled && (
                          <button
                            onClick={() => handleReconcile(tx._id)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Mark Reconciled
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing {Math.min((pagination.page - 1) * 20 + 1, pagination.total)} - {Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-1 bg-gray-100 rounded-lg text-sm">
                  {pagination.page} / {pagination.totalPages || 1}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GatewayC2B;
