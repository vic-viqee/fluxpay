import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Shield, User, Layout, Moon, Sun, CheckCircle2, AlertCircle, Key, Plus, Trash2, Copy } from 'lucide-react';

type ThemeMode = 'dark' | 'light';
type TabType = 'general' | 'security' | 'apiKeys';

interface ApiKey {
  _id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

interface SettingsModel {
  username: string;
  email: string;
  businessName: string;
  businessType: string;
  kraPin: string;
  businessTillOrPaybill: string;
  businessPhoneNumber: string;
  preferredPaymentMethod: string;
  businessDescription: string;
  logoUrl: string;
  plan: string;
}

const emptySettings: SettingsModel = {
  username: '',
  email: '',
  businessName: '',
  businessType: '',
  kraPin: '',
  businessTillOrPaybill: '',
  businessPhoneNumber: '',
  preferredPaymentMethod: 'M-Pesa STK Push',
  businessDescription: '',
  logoUrl: '',
  plan: '',
};

const applyTheme = (mode: ThemeMode) => {
  if (mode === 'light') {
    document.documentElement.classList.add('theme-light');
  } else {
    document.documentElement.classList.remove('theme-light');
  }
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settingsData, setSettingsData] = useState<SettingsModel>(emptySettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ key: string; secret: string; name: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = (localStorage.getItem('themeMode') as ThemeMode) || 'dark';
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const response = await api.get('/settings');
        setSettingsData({ ...emptySettings, ...response.data });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch settings data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  useEffect(() => {
    if (activeTab === 'apiKeys') {
      fetchApiKeys();
    }
  }, [activeTab]);

  const fetchApiKeys = async () => {
    setApiKeysLoading(true);
    setApiKeyError(null);
    try {
      const response = await api.get('/apikeys');
      setApiKeys(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch API keys:', err);
      setApiKeyError(err.response?.data?.message || 'Failed to load API keys');
    } finally {
      setApiKeysLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    setApiKeyError(null);
    try {
      const response = await api.post('/apikeys', { name: newKeyName });
      const newKey = response.data.data;
      setApiKeys(prev => [newKey, ...prev]);
      setNewlyCreatedKey({ key: newKey.key, secret: newKey.secret, name: newKey.name });
      setNewKeyName('');
    } catch (err: any) {
      console.error('Failed to create API key:', err);
      setApiKeyError(err.response?.data?.message || 'Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await api.delete(`/apikeys/${keyId}`);
      setApiKeys(prev => prev.filter(k => k._id !== keyId));
    } catch (err) {
      console.error('Failed to delete API key:', err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const setField = (field: keyof SettingsModel, value: string) => {
    setSettingsData((prev) => ({ ...prev, [field]: value }));
  };

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('themeMode', nextTheme);
    applyTheme(nextTheme);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('username', settingsData.username);
      formData.append('businessName', settingsData.businessName);
      formData.append('businessType', settingsData.businessType);
      formData.append('kraPin', settingsData.kraPin);
      formData.append('businessTillOrPaybill', settingsData.businessTillOrPaybill);
      formData.append('businessPhoneNumber', settingsData.businessPhoneNumber);
      formData.append('preferredPaymentMethod', settingsData.preferredPaymentMethod);
      formData.append('businessDescription', settingsData.businessDescription);
      formData.append('plan', settingsData.plan);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await api.put('/settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.settings) {
        setSettingsData({ ...emptySettings, ...response.data.settings, email: settingsData.email });
      }
      setLogoFile(null);
      setMessage('Settings saved successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    setError(null);
    setMessage('');
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8 text-white">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your business profile and security</p>
        </div>
        <button
          type="button"
          onClick={handleThemeToggle}
          className="flex items-center gap-2 px-4 py-2 bg-surface-bg border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-1">
          <TabButton 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
            icon={<User size={18} />} 
            label="General" 
          />
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
            icon={<Shield size={18} />} 
            label="Security" 
          />
          <TabButton 
            active={activeTab === 'apiKeys'} 
            onClick={() => setActiveTab('apiKeys')} 
            icon={<Key size={18} />} 
            label="API Keys" 
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-xl flex items-center gap-3">
              <CheckCircle2 size={18} />
              {message}
            </div>
          )}

          {activeTab === 'general' ? (
            <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6 md:p-8 shadow-sm">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-primary-bg border border-gray-700 flex items-center justify-center overflow-hidden">
                      {settingsData.logoUrl ? (
                        <img src={settingsData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Layout className="text-gray-600" size={32} />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-main hover:bg-blue-600 p-2 rounded-lg cursor-pointer shadow-lg transition-all active:scale-90">
                      <Sun size={14} className="text-white" />
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">Business Identity</h3>
                    <p className="text-sm text-gray-400">Update your public profile and contact information</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Personal Name / Username" 
                    value={settingsData.username} 
                    onChange={(v) => setField('username', v)} 
                  />
                  <InputField 
                    label="Email Address" 
                    value={settingsData.email} 
                    disabled 
                  />
                  <InputField 
                    label="Business Name" 
                    value={settingsData.businessName} 
                    onChange={(v) => setField('businessName', v)} 
                  />
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Business Type</label>
                    <select
                      value={settingsData.businessType}
                      onChange={(e) => setField('businessType', e.target.value)}
                      className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-main/50 outline-none transition-all"
                    >
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Limited Company">Limited Company</option>
                      <option value="Freelancer">Freelancer</option>
                    </select>
                  </div>
                  <InputField 
                    label="Business Phone (STK Collections)" 
                    value={settingsData.businessPhoneNumber} 
                    onChange={(v) => setField('businessPhoneNumber', v)} 
                  />
                  <InputField 
                    label="KRA PIN" 
                    value={settingsData.kraPin} 
                    onChange={(v) => setField('kraPin', v)} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Business Description</label>
                  <textarea
                    rows={3}
                    value={settingsData.businessDescription}
                    onChange={(e) => setField('businessDescription', e.target.value)}
                    className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-main/50 outline-none transition-all"
                    placeholder="Tell us a bit about what you do..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-main hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-main/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? 'Saving Changes...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Change Password</h3>
              <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                <InputField 
                  label="Current Password" 
                  type="password" 
                  value={currentPassword} 
                  onChange={setCurrentPassword} 
                />
                <div className="h-[1px] bg-gray-800 my-2"></div>
                <InputField 
                  label="New Password" 
                  type="password" 
                  value={newPassword} 
                  onChange={setNewPassword} 
                />
                <InputField 
                  label="Confirm New Password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={setConfirmPassword} 
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Make sure your new password is at least 8 characters long and includes numbers and special characters.
                </p>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-8 py-3 bg-main hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-main/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'apiKeys' && (
            <div className="bg-surface-bg rounded-2xl border border-gray-800 p-6 md:p-8 shadow-sm">
              {apiKeyError && (
                <div className="mb-6 p-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl">
                  {apiKeyError}
                </div>
              )}
              
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-2">API Keys</h2>
                <p className="text-sm text-gray-400">
                  Use these keys to integrate FluxPay Payment Gateway into your apps. 
                  Keep your secret keys safe - never share them publicly.
                </p>
              </div>

              <div className="flex gap-4 mb-8">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production App, Test Environment"
                  className="flex-1 bg-primary-bg border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-main/50 outline-none"
                />
                <button
                  onClick={handleCreateApiKey}
                  disabled={creatingKey || !newKeyName.trim()}
                  className="px-6 py-2.5 bg-main hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={18} />
                  {creatingKey ? 'Creating...' : 'Create Key'}
                </button>
              </div>

              {newlyCreatedKey && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-green-400" />
                    <span className="font-medium text-green-400">API Key Created Successfully</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    Copy and save your secret now. It will not be shown again.
                  </p>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                    <code className="flex-1 text-sm text-gray-300 font-mono truncate">
                      Key: {newlyCreatedKey.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey.key, newlyCreatedKey.key)}
                      className="text-gray-400 hover:text-white"
                      title="Copy key"
                    >
                      {copied === newlyCreatedKey.key ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 mt-2">
                    <code className="flex-1 text-sm text-gray-300 font-mono truncate">
                      Secret: {newlyCreatedKey.secret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey.secret, 'secret')}
                      className="text-gray-400 hover:text-white"
                      title="Copy secret"
                    >
                      {copied === 'secret' ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <button
                    onClick={() => setNewlyCreatedKey(null)}
                    className="mt-4 text-sm text-gray-400 hover:text-white"
                  >
                    I've saved it • Don't show this again
                  </button>
                </div>
              )}

              {apiKeysLoading ? (
                <div className="text-center py-8 text-gray-400">Loading API keys...</div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-primary-bg rounded-xl">
                  No API keys yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey._id} className="bg-primary-bg border border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-white">{apiKey.name}</h3>
                          <p className="text-xs text-gray-400">
                            Created {new Date(apiKey.createdAt).toLocaleDateString()}
                            {apiKey.lastUsedAt && ` • Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${apiKey.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                        <code className="flex-1 text-sm text-gray-300 font-mono truncate">
                          Key: {apiKey.key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="text-gray-400 hover:text-white"
                          title="Copy key"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 mt-2">
                        <code className="flex-1 text-sm text-gray-300 font-mono">
                          Secret: {'•'.repeat(32)}
                        </code>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleDeleteApiKey(apiKey._id)}
                          className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
      ? 'bg-main text-white shadow-lg shadow-main/20' 
      : 'text-gray-400 hover:bg-surface-bg hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

const InputField: React.FC<{ label: string, value: string, onChange?: (v: string) => void, disabled?: boolean, type?: string }> = ({ label, value, onChange, disabled, type = 'text' }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-main/50 outline-none transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-800' : ''
      }`}
    />
  </div>
);

export default Settings;
