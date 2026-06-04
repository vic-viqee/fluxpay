import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';

interface Webhook {
  _id: string;
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggeredAt: string | null;
  failureCount: number;
  createdAt: string;
}

const GatewayWebhooks: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; webhookId: string } | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    url: '',
    name: '',
    events: ['payment.success', 'payment.failed'] as string[],
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gateway/webhooks');
      const data = response.data?.data || response.data || [];
      setWebhooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/gateway/webhooks', formData);
      setShowModal(false);
      setFormData({ url: '', name: '', events: ['payment.success', 'payment.failed'] });
      fetchWebhooks();
    } catch (err) {
      console.error('Failed to create webhook:', err);
    }
  };

  const handleToggle = async (webhook: Webhook) => {
    setSavingId(webhook._id);
    try {
      await api.patch(`/gateway/webhooks/${webhook._id}`, { isActive: !webhook.isActive });
      fetchWebhooks();
    } catch (err) {
      console.error('Failed to toggle webhook:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await api.delete(`/gateway/webhooks/${id}`);
      fetchWebhooks();
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const testWebhook = async (webhook: Webhook) => {
    setTestResult(null);
    setSavingId(webhook._id);
    try {
      const response = await api.post(`/gateway/webhooks/${webhook._id}/test`);
      const data = response.data || response;
      setTestResult({
        success: data.status === 'delivered',
        message: data.status === 'delivered'
          ? `Test sent! Webhook responded with status ${data.statusCode}`
          : `Failed: ${data.error}`,
        webhookId: webhook._id,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.detail || 'Failed to send test',
        webhookId: webhook._id,
      });
    } finally {
      setSavingId(null);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const eventLabels: Record<string, string> = {
    'payment.success': 'Payment Success',
    'payment.failed': 'Payment Failed',
    'payment.pending': 'Payment Pending',
    'payment.cancelled': 'Payment Cancelled',
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

      {testResult && (
        <div className={`p-4 rounded-xl ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
            {testResult.message}
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">Webhook Events</h3>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {Object.entries(eventLabels).map(([event, label]) => (
            <div key={event} className="bg-white rounded-lg p-3">
              <code className="text-blue-600">{event}</code>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">URL</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Events</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Secret</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
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
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {revealedSecrets.has(webhook._id)
                            ? webhook.secret
                            : `${webhook.secret?.slice(0, 8)}...`}
                        </code>
                        <button
                          onClick={() => toggleSecret(webhook._id)}
                          className="text-gray-400 hover:text-gray-600"
                          title={revealedSecrets.has(webhook._id) ? 'Hide secret' : 'Reveal secret'}
                        >
                          {revealedSecrets.has(webhook._id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggle(webhook)}
                        disabled={savingId === webhook._id}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          webhook.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {savingId === webhook._id ? (
                          <span className="animate-spin">...</span>
                        ) : webhook.isActive ? (
                          <ToggleRight size={14} />
                        ) : (
                          <ToggleLeft size={14} />
                        )}
                        {webhook.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => testWebhook(webhook)}
                          disabled={savingId === webhook._id}
                          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
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
                  {Object.entries(eventLabels).map(([event, label]) => (
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
                      <span className="text-sm">
                        <code className="text-blue-600">{event}</code>
                        <span className="text-gray-500 ml-1">— {label}</span>
                      </span>
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