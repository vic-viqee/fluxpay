'use client'

import Link from 'next/link'
import { Navbar, Card, Button, Badge, Footer } from '@/app/components'
import { useState } from 'react'

export default function Demo() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" userMenuOpen={userMenuOpen} onUserMenuToggle={() => setUserMenuOpen(!userMenuOpen)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="primary" className="mb-4 inline-block">See It In Action</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Experience FluxPay
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            Watch how FluxPay streamlines your payment processing with our interactive demo
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary">Start Demo</Button>
            <Button variant="secondary">Schedule Demo</Button>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 md:py-32">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card hover className="text-center">
              <p className="text-4xl mb-3">📹</p>
              <h3 className="font-bold text-neutral-900 mb-2">Platform Tour</h3>
              <p className="text-sm text-neutral-600">15 min overview of key features</p>
            </Card>
            <Card hover className="text-center">
              <p className="text-4xl mb-3">💳</p>
              <h3 className="font-bold text-neutral-900 mb-2">Payment Processing</h3>
              <p className="text-sm text-neutral-600">See payments in real-time</p>
            </Card>

          </div>
        </div>
      </section>

      {/* Live Demo Stats */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 py-20 md:py-32">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Demo Environment Statistics</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: 'Test Customers', value: '500+' },
              { label: 'Sample Transactions', value: '10K+' },
              { label: 'Processing Time', value: '<1s' },
              { label: 'Uptime', value: '99.9%' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center text-white">
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-secondary-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features Demo */}
      <section className="py-20 md:py-32">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12">Interactive Demo Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎮',
                title: 'Try Payment Flow',
                desc: 'Process a sample payment from start to finish without using real funds'
              },
              {
                icon: '👥',
                title: 'Manage Clients',
                desc: 'Create test clients and virtual tills to explore client management features'
              },
              {
                icon: '📊',
                title: 'View Reports',
                desc: 'Generate and export sample reports to see reporting capabilities'
              },
              {
                icon: '🔔',
                title: 'Notification System',
                desc: 'Receive live notifications as payments are processed in demo mode'
              },
              {
                icon: '💰',
                title: 'Settlement Details',
                desc: 'Track settlement schedules and view detailed transaction breakdowns'
              },
              {
                icon: '⚙️',
                title: 'Configuration',
                desc: 'Customize settings and explore all configuration options safely'
              }
            ].map((feature, idx) => (
              <Card key={idx} hover padding="lg">
                <p className="text-5xl mb-4">{feature.icon}</p>
                <h3 className="font-bold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-neutral-600 mb-8">
            Experience the power of FluxPay for yourself. Sign up for a free account today.
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Link href="/signup">
              <Button variant="primary">Create Free Account</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Talk to Our Team</Button>
            </Link>
          </div>
          <p className="text-neutral-600 text-sm">✓ No credit card required • ✓ Full platform access • ✓ 14-day free trial</p>
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  )
}
