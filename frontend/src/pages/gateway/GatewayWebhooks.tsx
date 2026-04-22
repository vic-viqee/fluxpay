import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';

const GatewayWebhooks: React.FC = () => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    events: ['payment.success', 'payment.failed']
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      // This would call a webhook listing endpoint
      // For now, we'll use the thirdparty webhooks
      const response = await fetch('/api/v1/webhooks', {
        headers: {
          'X-API-Key': localStorage.getItem('gatewayApiKey') || '',
          'X-API-Secret': localStorage.getItem('gatewayApiSecret') || ''
        }
      });
      const data = await response.json();
      setWebhooks(data.data || []);
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('gatewayApiKey') || '',
          'X-API-Secret': localStorage.getItem('gatewayApiSecret') || ''
        },
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setFormData({ url: '', name: '', events: ['payment.success', 'payment.failed'] });
      fetchWebhooks();
    } catch (err) {
      console.error('Failed to create webhook:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await fetch(`/api/v1/webhooks/${id}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': localStorage.getItem('gatewayApiKey') || '',
          'X-API-Secret': localStorage.getItem('gatewayApiSecret') || ''
        }
      });
      fetchWebhooks();
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const testWebhook = async (webhook: any) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString()
        })
      });
      setTestResult({
        success: response.ok,
        status: response.status,
        webhookId: webhook._id
      });
      setTimeout(() => setTestResult(null), 5000);
    } catch (err: any) {
      setTestResult({ success: false, error: err?.message || 'Failed to send test' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Webhooks</h1>
          <p className="text-gray-500">Receive real-time payment notifications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Webhook
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-xl ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
            {testResult.success 
              ? `Test sent! Webhook responded with status ${testResult.status}`
              : 'Failed to send test to webhook URL'}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">Webhook Events</h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <div className="bg-white rounded-lg p-3">
            <code className="text-blue-600">payment.success</code>
            <p className="text-xs text-gray-500 mt-1">Triggered when payment is successful</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <code className="text-blue-600">payment.failed</code>
            <p className="text-xs text-gray-500 mt-1">Triggered when payment fails</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <code className="text-blue-600">payment.pending</code>
            <p className="text-xs text-gray-500 mt-1">Triggered when payment is initiated</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <code className="text-blue-600">payment.cancelled</code>
            <p className="text-xs text-gray-500 mt-1">Triggered when payment is cancelled</p>
          </div>
        </div>
      </div>

      {/* Webhooks Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">URL</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Events</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No webhooks configured
                  </td>
                </tr>
              ) : (
                webhooks.map((webhook) => (
                  <tr key={webhook._id}>
                    <td className="p-4 font-medium text-gray-800">{webhook.name}</td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600 truncate max-w-xs">{webhook.url}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {webhook.events?.map((event: string) => (
                          <span key={event} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {event}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        webhook.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {webhook.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => testWebhook(webhook)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Send Test"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(webhook._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Add Webhook</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="My Webhook"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://yoursite.com/webhook"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                <div className="space-y-2">
                  {['payment.success', 'payment.failed', 'payment.pending', 'payment.cancelled'].map((event) => (
                    <label key={event} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(p => ({ ...p, events: [...p.events, event] }));
                          } else {
                            setFormData(p => ({ ...p, events: p.events.filter((e: string) => e !== event) }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayWebhooks;