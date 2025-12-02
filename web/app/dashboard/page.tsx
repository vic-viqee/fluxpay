'use client'

import Link from 'next/link'
import { Navbar, Card, Badge, Button } from '@/app/components'
import { useState } from 'react'

export default function Dashboard() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Welcome Back, Jane!</h1>
          <p className="text-neutral-600">Here's your business overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Revenue', value: '$12,450.50', icon: '💰', color: 'primary' },
            { label: 'Transactions Today', value: '24', icon: '💳', color: 'success' },
            { label: 'Pending', value: '$2,100.00', icon: '⏳', color: 'warning' },
            { label: 'Active Tills', value: '3', icon: '🏪', color: 'secondary' },
          ].map((stat, idx) => (
            <Card key={idx} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-neutral-600 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {[
                { date: 'Today 10:30 AM', amount: '+$250.00', customer: 'John Doe', status: 'completed' },
                { date: 'Today 09:15 AM', amount: '+$150.50', customer: 'Jane Smith', status: 'completed' },
                { date: 'Yesterday 04:45 PM', amount: '+$500.00', customer: 'Tech Solutions', status: 'completed' },
                { date: 'Yesterday 02:20 PM', amount: '+$75.25', customer: 'Local Cafe', status: 'pending' },
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0">
                  <div>
                    <p className="font-medium text-neutral-900">{tx.customer}</p>
                    <p className="text-sm text-neutral-600">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success-600">{tx.amount}</p>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/payments" className="block mt-6">
              <Button variant="ghost" fullWidth>
                View All Transactions
              </Button>
            </Link>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="primary" fullWidth size="sm">
                  Create Payment Link
                </Button>
                <Button variant="secondary" fullWidth size="sm">
                  Send Invoice
                </Button>
                <Button variant="tertiary" fullWidth size="sm">
                  Manage Tills
                </Button>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-info-50 to-blue-50">
              <Badge variant="info" className="mb-3">Tip of the Day</Badge>
              <p className="text-neutral-700 text-sm">
                Did you know? Virtual tills help you track revenue by location. Create one for each branch!
              </p>
            </Card>
          </div>
        </div>

        {/* Navigation to Other Pages */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link href="/dashboard/payments">
            <Card hover className="h-full cursor-pointer text-center py-8">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-bold text-neutral-900">Payments & Transactions</h3>
              <p className="text-sm text-neutral-600 mt-2">View and manage all transactions</p>
            </Card>
          </Link>
          <Link href="/dashboard/clients">
            <Card hover className="h-full cursor-pointer text-center py-8">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="font-bold text-neutral-900">Clients</h3>
              <p className="text-sm text-neutral-600 mt-2">Manage your customers</p>
            </Card>
          </Link>
          <Link href="/dashboard/settings">
            <Card hover className="h-full cursor-pointer text-center py-8">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="font-bold text-neutral-900">Settings</h3>
              <p className="text-sm text-neutral-600 mt-2">Account & preferences</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
