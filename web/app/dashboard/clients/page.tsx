'use client'

import Link from 'next/link'
import { Navbar, Card, Button, Input, Badge, Table } from '@/app/components'
import { useState } from 'react'

export default function Clients() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const clients = [
    { id: 1, name: 'Kipchoge Electronics', email: 'contact@kipchoge.com', till: 'TILL-001', status: 'active', revenue: 'KSh 45,230', joined: '2024-01-15' },
    { id: 2, name: 'Nairobi Bakery', email: 'info@nairobi-bakery.com', till: 'TILL-002', status: 'active', revenue: 'KSh 32,150', joined: '2024-02-10' },
    { id: 3, name: 'Tech Hub Solutions', email: 'sales@techhub.com', till: 'TILL-003', status: 'inactive', revenue: 'KSh 0', joined: '2024-01-20' },
    { id: 4, name: 'Fashion Plus Store', email: 'admin@fashionplus.com', till: 'TILL-004', status: 'active', revenue: 'KSh 67,890', joined: '2023-12-05' },
    { id: 5, name: 'Coffee Corner', email: 'hello@coffeecorner.com', till: 'TILL-005', status: 'pending', revenue: 'KSh 12,500', joined: '2024-02-28' },
  ]

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Clients</h1>
            <p className="text-neutral-600">Manage all your business clients and their virtual tills</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button variant="ghost">← Back</Button>
            </Link>
            <Button variant="primary">+ Add Client</Button>
          </div>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:border-neutral-400">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
            <select className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:border-neutral-400">
              <option>All Tills</option>
              <option>Till-001</option>
              <option>Till-002</option>
              <option>Till-003</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Export</Button>
            <Button variant="ghost" size="sm">Bulk Actions</Button>
          </div>
        </Card>

        {/* Clients Table */}
        <Card className="overflow-hidden">
          <Table
            columns={[
              { key: 'name', label: 'Client Name', render: (value, row) => (
                <div>
                  <p className="font-medium text-neutral-900">{value}</p>
                  <p className="text-sm text-neutral-600">{row.email}</p>
                </div>
              )},
              { key: 'till', label: 'Virtual Till' },
              { key: 'revenue', label: 'Monthly Revenue' },
              { key: 'status', label: 'Status', render: (value) => (
                <Badge variant={
                  value === 'active' ? 'success' :
                  value === 'inactive' ? 'danger' :
                  'warning'
                }>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Badge>
              )},
              { key: 'joined', label: 'Joined', render: (value) => (
                <span className="text-neutral-700">{new Date(value).toLocaleDateString()}</span>
              )},
              { key: 'action', label: 'Action', render: (_, row) => (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">View</Button>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              )},
            ]}
            data={filteredClients}
            striped
          />
        </Card>

        {/* Client Detail Cards - Featured Clients */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Top Performing Clients</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Fashion Plus Store', revenue: 'KSh 67,890', transactions: '234', trend: '↑ 12%' },
              { name: 'Kipchoge Electronics', revenue: 'KSh 45,230', transactions: '156', trend: '↑ 8%' },
              { name: 'Nairobi Bakery', revenue: 'KSh 32,150', transactions: '89', trend: '↑ 5%' },
            ].map((client, idx) => (
              <Card key={idx} hover padding="md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-neutral-900">{client.name}</h3>
                  <Badge variant="success">{client.trend}</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-neutral-900">{client.revenue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Transactions This Month</p>
                    <p className="text-lg font-semibold text-primary-600">{client.transactions}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Clients by Status Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { status: 'Active', count: '42', color: 'success' },
            { status: 'Pending', count: '8', color: 'warning' },
            { status: 'Inactive', count: '5', color: 'danger' },
          ].map((stat, idx) => (
            <Card key={idx} hover>
              <Badge variant={stat.color as any} className="mb-3">{stat.status}</Badge>
              <p className="text-4xl font-bold text-neutral-900">{stat.count}</p>
              <p className="text-neutral-600 mt-1">Clients</p>
            </Card>
          ))}
        </div>

        {/* Empty State Card */}
        <Card className="mt-12 bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200 text-center py-12">
          <div className="max-w-md mx-auto">
            <p className="text-3xl mb-3">📧</p>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Want to reach out to clients?</h3>
            <p className="text-neutral-600 mb-4">Send bulk notifications, manage client communications, and keep everyone updated</p>
            <Button variant="primary">Send Notification</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
