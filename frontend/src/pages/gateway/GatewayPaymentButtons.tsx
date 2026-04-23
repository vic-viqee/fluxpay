import React, { useState, useEffect } from 'react';
import { Plus, Copy, Check, Trash2, ExternalLink, Code, MousePointer, Edit2 } from 'lucide-react';
import api from '../../services/api';

interface PaymentButton {
  _id: string;
  buttonId: string;
  title: string;
  description?: string;
  defaultAmount?: number;
  allowCustomAmount: boolean;
  redirectUrl?: string;
  buttonText: string;
  buttonColor: string;
  totalClicks: number;
  totalPayments: number;
  totalAmount: number;
  createdAt: string;
}

const GatewayPaymentButtons: React.FC = () => {
  const [buttons, setButtons] = useState<PaymentButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingButton, setEditingButton] = useState<PaymentButton | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmbed, setCopiedEmbed] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    defaultAmount: '',
    allowCustomAmount: true,
    redirectUrl: '',
    buttonText: 'Pay with M-Pesa',
    buttonColor: '#25D366'
  });

  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gateway/buttons');
      setButtons(response.data.data);
    } catch (err) {
      console.error('Failed to fetch buttons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        defaultAmount: formData.defaultAmount ? parseFloat(formData.defaultAmount) : undefined,
        allowCustomAmount: formData.allowCustomAmount,
        redirectUrl: formData.redirectUrl || undefined,
        buttonText: formData.buttonText,
        buttonColor: formData.buttonColor
      };

      if (editingButton) {
        await api.patch(`/gateway/buttons/${editingButton._id}`, payload);
      } else {
        await api.post('/gateway/buttons', payload);
      }
      
      closeModal();
      fetchButtons();
    } catch (err) {
      console.error('Failed to save button:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment button?')) return;
    try {
      await api.delete(`/gateway/buttons/${id}`);
      fetchButtons();
    } catch (err) {
      console.error('Failed to delete button:', err);
    }
  };

  const handleEdit = (button: PaymentButton) => {
    setEditingButton(button);
    setFormData({
      title: button.title,
      description: button.description || '',
      defaultAmount: button.defaultAmount?.toString() || '',
      allowCustomAmount: button.allowCustomAmount,
      redirectUrl: button.redirectUrl || '',
      buttonText: button.buttonText,
      buttonColor: button.buttonColor
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingButton(null);
    setFormData({
      title: '',
      description: '',
      defaultAmount: '',
      allowCustomAmount: true,
      redirectUrl: '',
      buttonText: 'Pay with M-Pesa',
      buttonColor: '#25D366'
    });
  };

  const copyEmbedCode = (button: PaymentButton) => {
    const embedCode = `<!-- FluxPay Payment Button -->
<script src="${window.location.origin}/pay-button.js" async></script>
<button 
  class="fluxpay-button"
  data-button-id="${button.buttonId}"
  data-text="${button.buttonText}"
  data-color="${button.buttonColor}"
></button>`;
    
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(button._id);
    setTimeout(() => setCopiedEmbed(null), 2000);
  };

  const copyPayUrl = (button: PaymentButton) => {
    const payUrl = `${window.location.origin}/paybtn/${button.buttonId}`;
    navigator.clipboard.writeText(payUrl);
    setCopiedId(button._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const presetColors = ['#25D366', '#0077B5', '#FF6B6B', '#4ECDC4', '#FFA07A', '#9B59B6'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Buttons</h1>
          <p className="text-gray-500">Embed "Pay with M-Pesa" buttons on any website</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={18} />
          Create Button
        </button>
      </div>

      {/* Help Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Code size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">How to use payment buttons</h3>
            <p className="text-sm text-blue-600 mt-1">
              Create a button, copy the embed code, and paste it on your website. 
              Customers can pay directly without visiting a separate page.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : buttons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MousePointer size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No payment buttons yet</h3>
          <p className="text-gray-500 mt-1">Create your first payment button to embed on your website</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {buttons.map((button) => (
            <div key={button._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{button.title}</h3>
                  <p className="text-sm text-gray-500">{button.description || 'No description'}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(button)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(button._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium mb-4"
                style={{ backgroundColor: button.buttonColor }}
              >
                {button.buttonText}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-800">{button.totalClicks}</p>
                  <p className="text-xs text-gray-500">Clicks</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">{button.totalPayments}</p>
                  <p className="text-xs text-gray-500">Payments</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">KES {button.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-2">Payment URL (copy to share)</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyPayUrl(button)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {copiedId === button._id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    <span>{copiedId === button._id ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                  <a
                    href={`/paybtn/${button.buttonId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="text-xs text-gray-400 mb-2">Embed Code (paste on your website)</p>
                <button
                  onClick={() => copyEmbedCode(button)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  {copiedEmbed === button._id ? <Check size={16} /> : <Code size={16} />}
                  <span>{copiedEmbed === button._id ? 'Copied!' : 'Copy Embed Code'}</span>
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Created {new Date(button.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {editingButton ? 'Edit Payment Button' : 'Create Payment Button'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Pay for Order"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="What is this payment for?"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Amount (KES)</label>
                <input
                  type="number"
                  value={formData.defaultAmount}
                  onChange={(e) => setFormData(p => ({ ...p, defaultAmount: e.target.value }))}
                  placeholder="Leave empty to let customer enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowCustomAmount"
                  checked={formData.allowCustomAmount}
                  onChange={(e) => setFormData(p => ({ ...p, allowCustomAmount: e.target.checked }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="allowCustomAmount" className="text-sm text-gray-700">
                  Allow customer to enter custom amount
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL After Payment</label>
                <input
                  type="url"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData(p => ({ ...p, redirectUrl: e.target.value }))}
                  placeholder="https://yoursite.com/thank-you"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Customer will be redirected here after successful payment</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData(p => ({ ...p, buttonText: e.target.value }))}
                  placeholder="Pay with M-Pesa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Color</label>
                <div className="flex gap-2 mb-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, buttonColor: color }))}
                      className={`w-8 h-8 rounded-lg transition-transform ${formData.buttonColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData(p => ({ ...p, buttonColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingButton ? 'Update Button' : 'Create Button'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayPaymentButtons;