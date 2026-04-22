import React, { useState, useEffect } from 'react';
import { Plus, Copy, Check, Trash2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { gatewayPaymentLinks } from '../../services/gatewayApi';

const GatewayPaymentLinks: React.FC = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    expiresAt: '',
    maxUses: '',
    redirectUrl: ''
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const data = await gatewayPaymentLinks.getAll();
      setLinks(data.data);
    } catch (err) {
      console.error('Failed to fetch payment links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gatewayPaymentLinks.create({
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expiresAt: formData.expiresAt || undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        redirectUrl: formData.redirectUrl || undefined
      });
      setShowModal(false);
      setFormData({ title: '', description: '', amount: '', expiresAt: '', maxUses: '', redirectUrl: '' });
      fetchLinks();
    } catch (err) {
      console.error('Failed to create payment link:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment link?')) return;
    try {
      await gatewayPaymentLinks.delete(id);
      fetchLinks();
    } catch (err) {
      console.error('Failed to delete payment link:', err);
    }
  };

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Links</h1>
          <p className="text-gray-500">Create and manage payment links for customers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Link
        </button>
      </div>

      {/* Links Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : links.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <LinkIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No payment links yet</h3>
          <p className="text-gray-500 mt-1">Create your first payment link to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <div key={link._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{link.title}</h3>
                  <p className="text-sm text-gray-500">{link.description || 'No description'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  link.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  link.status === 'EXPIRED' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {link.status}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-800">KES {link.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{link.currentUses} / {link.maxUses || '∞'} uses</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyLink(link.paymentLink, link._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {copiedId === link._id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  <span className="text-sm">{copiedId === link._id ? 'Copied!' : 'Copy'}</span>
                </button>
                <a
                  href={link.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => handleDelete(link._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Created {new Date(link.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Create Payment Link</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Invoice Payment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                  placeholder="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(p => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(p => ({ ...p, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
                <input
                  type="url"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData(p => ({ ...p, redirectUrl: e.target.value }))}
                  placeholder="https://yoursite.com/thank-you"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayPaymentLinks;
