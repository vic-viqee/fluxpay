import React, { useState, useEffect } from 'react';
import { Plus, Copy, Check, Trash2, Key as KeyIcon } from 'lucide-react';
import { createApiKey, getApiKeys, revokeApiKey, deleteApiKey } from '../../services/api';

const GatewayApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<any>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const data = await getApiKeys();
      setApiKeys(data.data || []);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await createApiKey({ name });
      setNewKey(data);
      setShowModal(true);
      setName('');
      fetchApiKeys();
    } catch (err) {
      console.error('Failed to create API key:', err);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    try {
      await revokeApiKey(id);
      fetchApiKeys();
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await deleteApiKey(id);
      fetchApiKeys();
    } catch (err) {
      console.error('Failed to delete API key:', err);
    }
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">API Keys</h1>
          <p className="text-gray-500">Manage API keys for e-commerce integration</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Key
        </button>
      </div>

      {/* New Key Modal */}
      {newKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyIcon size={20} className="text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">API Key Created!</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            Copy and save this API key now. You won't be able to see it again.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-sm break-all">{newKey.key}</code>
              <button
                onClick={() => copyKey(newKey.key, 'new')}
                className="p-2 hover:bg-gray-100 rounded-lg ml-2"
              >
                {copiedId === 'new' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Secret: <code>{newKey.secret?.replace(/./g, '*')}</code>
            </div>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Done
          </button>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">API Key</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Created</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Last Used</th>
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
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No API keys yet. Create one to start integrating.
                  </td>
                </tr>
              ) : (
                apiKeys.map((key) => (
                  <tr key={key._id}>
                    <td className="p-4 font-medium text-gray-800">{key.name}</td>
                    <td className="p-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {key.key?.slice(0, 12)}...
                      </code>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {key.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {key.isActive && (
                          <button
                            onClick={() => handleRevoke(key._id)}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(key._id)}
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
      {showModal && !newKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Create API Key</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My E-commerce Site"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayApiKeys;