'use client'

import Link from 'next/link'
import { Navbar, Card, Button, Input, Badge } from '@/app/components'
import { useState } from 'react'

export default function Settings() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar
        variant="authenticated"
        userMenuOpen={userMenuOpen}
        onUserMenuToggle={() => setUserMenuOpen(!userMenuOpen)}
        userName="Jane"
      />

      <div className="container-max py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Settings</h1>
            <p className="text-neutral-600">Manage your account, notifications, and preferences</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1">
            <Card className="p-0 divide-y divide-neutral-200">
              {[
                { id: 'profile', label: 'Profile Info', icon: '👤' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'business', label: 'Business Info', icon: '🏢' },
                { id: 'security', label: 'Security', icon: '🔒' },
                { id: 'payment', label: 'Payment Setup', icon: '💳' },
                { id: 'api', label: 'API Keys', icon: '🔑' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </Card>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {/* Profile Info */}
            {activeTab === 'profile' && (
              <Card className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">Profile Information</h2>
                  <div className="space-y-6">
                    <Input label="Full Name" value="Jane Kipchoge" />
                    <Input label="Email Address" value="jane@example.com" />
                    <Input label="Phone Number" value="+254712345678" />
                    <div>
                      <label className="label">Account Status</label>
                      <Badge variant="success">Active & Verified</Badge>
                    </div>
                    <Button variant="primary">Save Changes</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <Card className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Payment Received', desc: 'Get notified when a payment is received' },
                    { label: 'Payment Failed', desc: 'Alert when a payment fails' },
                    { label: 'Daily Summary', desc: 'Receive daily transaction summary' },
                    { label: 'Weekly Report', desc: 'Get weekly business report' },
                  ].map((notif, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0">
                      <div>
                        <p className="font-medium text-neutral-900">{notif.label}</p>
                        <p className="text-sm text-neutral-600">{notif.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  ))}
                </div>
                <Button variant="primary">Save Preferences</Button>
              </Card>
            )}

            {/* Business Info */}
            {activeTab === 'business' && (
              <Card className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Business Information</h2>
                <div className="space-y-6">
                  <Input label="Business Name" value="Kipchoge Electronics" />
                  <Input label="Business Type" value="Retail" />
                  <Input label="Location" value="Nairobi, Kenya" />
                  <Input label="Tax ID" value="TRN123456" />
                  <Button variant="primary">Update Business Info</Button>
                </div>
              </Card>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <Card className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-neutral-900 mb-3">Two-Factor Authentication</label>
                    <Badge variant="warning">Not Enabled</Badge>
                    <Button variant="secondary" className="mt-4">Enable 2FA</Button>
                  </div>
                  <div>
                    <label className="label">Change Password</label>
                    <Button variant="secondary">Change Password</Button>
                  </div>
                  <div>
                    <label className="label">Active Sessions</label>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-sm text-neutral-600">Current browser (Last active: just now)</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Payment Setup */}
            {activeTab === 'payment' && (
              <Card className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Payment Configuration</h2>
                <div className="space-y-6">
                  <div>
                    <label className="label">M-Pesa Account</label>
                    <Badge variant="success">Connected</Badge>
                    <p className="text-sm text-neutral-600 mt-2">Account: 254712345678</p>
                  </div>
                  <div>
                    <label className="label">Payout Account</label>
                    <Input placeholder="Enter your bank account" />
                  </div>
                  <Button variant="primary">Update Payment Method</Button>
                </div>
              </Card>
            )}

            {/* API Keys */}
            {activeTab === 'api' && (
              <Card className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">API Keys</h2>
                <div className="bg-danger-50 border border-danger-200 p-4 rounded-lg">
                  <p className="text-sm text-danger-700">⚠️ Keep your API keys secret. Do not share them with anyone.</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-2">Live API Key</p>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded font-mono text-sm truncate">
                        pk_live_123456789abcdef
                      </code>
                      <Button variant="ghost" size="sm">Copy</Button>
                    </div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-2">Test API Key</p>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded font-mono text-sm truncate">
                        pk_test_123456789abcdef
                      </code>
                      <Button variant="ghost" size="sm">Copy</Button>
                    </div>
                  </div>
                </div>
                <Button variant="danger">Regenerate Keys</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
