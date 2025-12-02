'use client'

import Link from 'next/link'
import { Navbar, Card, Button, Badge, Input } from '@/app/components'
import { useState } from 'react'

export default function Payments() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const transactions = [
    { id: 1, date: 'Dec 2, 2025', customer: 'John Doe', amount: '$250.00', status: 'completed', till: 'Main Till' },
    { id: 2, date: 'Dec 2, 2025', customer: 'Jane Smith', amount: '$150.50', status: 'completed', till: 'Branch A' },
    { id: 3, date: 'Dec 1, 2025', customer: 'Tech Solutions', amount: '$500.00', status: 'completed', till: 'Main Till' },
    { id: 4, date: 'Dec 1, 2025', customer: 'Local Cafe', amount: '$75.25', status: 'pending', till: 'Branch B' },
    { id: 5, date: 'Nov 30, 2025', customer: 'Sarah Johnson', amount: '$320.00', status: 'completed', till: 'Main Till' },
  ]

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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Payments & Transactions</h1>
            <p className="text-neutral-600">View, manage, and reconcile all your transactions</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <p className="text-neutral-600 text-sm mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-neutral-900">156</p>
          </Card>
          <Card>
            <p className="text-neutral-600 text-sm mb-2">This Month</p>
            <p className="text-3xl font-bold text-success-600">$12,450</p>
          </Card>
          <Card>
            <p className="text-neutral-600 text-sm mb-2">Pending</p>
            <p className="text-3xl font-bold text-warning-600">$2,100</p>
          </Card>
          <Card>
            <p className="text-neutral-600 text-sm mb-2">Failed</p>
            <p className="text-3xl font-bold text-danger-600">$150</p>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Search customer or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="input">
              <option>All Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
            <select className="input">
              <option>All Tills</option>
              <option>Main Till</option>
              <option>Branch A</option>
              <option>Branch B</option>
            </select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm">
              🔄 Reconcile
            </Button>
            <Button variant="secondary" size="sm">
              📥 Export
            </Button>
            <Button variant="tertiary" size="sm">
              🔗 Payment Link
            </Button>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">Till</th>
                  <th className="text-right py-3 px-4 font-semibold text-neutral-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-neutral-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="py-4 px-4 text-neutral-900">{tx.date}</td>
                    <td className="py-4 px-4 text-neutral-900">{tx.customer}</td>
                    <td className="py-4 px-4 text-neutral-600">{tx.till}</td>
                    <td className="py-4 px-4 text-right font-bold text-neutral-900">{tx.amount}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        variant={
                          tx.status === 'completed'
                            ? 'success'
                            : tx.status === 'pending'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-primary-500 hover:text-primary-600 font-medium text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-neutral-600 text-sm">Showing 1-5 of 156 transactions</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">← Previous</Button>
            <Button variant="ghost" size="sm">Next →</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
