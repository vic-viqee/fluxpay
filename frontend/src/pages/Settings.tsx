import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Shield, User, Layout, Moon, Sun, CheckCircle2, AlertCircle } from 'lucide-react';

type ThemeMode = 'dark' | 'light';
type TabType = 'general' | 'security';

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
