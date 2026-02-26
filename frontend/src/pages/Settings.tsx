import React, { useEffect, useState } from 'react';
import api from '../services/api';

type ThemeMode = 'dark' | 'light';

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
  const [settingsData, setSettingsData] = useState<SettingsModel>(emptySettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [theme, setTheme] = useState<ThemeMode>('dark');

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

  if (loading) {
    return <div className="text-center text-white">Loading settings data...</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings & Profile</h1>
        <button
          type="button"
          onClick={handleThemeToggle}
          className="rounded-md border border-main px-4 py-2 text-sm font-medium text-main hover:bg-main hover:text-white"
        >
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-900 bg-opacity-50 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mb-4 rounded-lg border border-secondary bg-secondary/20 p-4 text-sm text-secondary">
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSave} className="rounded-lg border border-surface-bg bg-surface-bg p-6 shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              value={settingsData.username}
              onChange={(e) => setField('username', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              value={settingsData.email}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Business Name</label>
            <input
              value={settingsData.businessName}
              onChange={(e) => setField('businessName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Business Type</label>
            <input
              value={settingsData.businessType}
              onChange={(e) => setField('businessType', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Business Phone</label>
            <input
              value={settingsData.businessPhoneNumber}
              onChange={(e) => setField('businessPhoneNumber', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">KRA PIN</label>
            <input
              value={settingsData.kraPin}
              onChange={(e) => setField('kraPin', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Till / Paybill</label>
            <input
              value={settingsData.businessTillOrPaybill}
              onChange={(e) => setField('businessTillOrPaybill', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Preferred Payment Method</label>
            <input
              value={settingsData.preferredPaymentMethod}
              onChange={(e) => setField('preferredPaymentMethod', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">Business Description</label>
          <textarea
            rows={3}
            value={settingsData.businessDescription}
            onChange={(e) => setField('businessDescription', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300">Business Logo</label>
          <input
            type="file"
            onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-main file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
          />
          {settingsData.logoUrl ? (
            <img src={settingsData.logoUrl} alt="Business Logo" className="mt-3 h-16 w-16 rounded-full object-cover" />
          ) : null}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-main px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

