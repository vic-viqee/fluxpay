'use client'

import Link from 'next/link'
import { Navbar, Card, Button, Badge } from '@/app/components'
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
            <Card hover className="text-center">
              <p className="text-4xl mb-3">📊</p>
              <h3 className="font-bold text-neutral-900 mb-2">Dashboard Analytics</h3>
              <p className="text-sm text-neutral-600">Track your business metrics</p>
            </Card>
          </div>

          {/* Video Embed Area */}
          <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 aspect-video rounded-lg overflow-hidden flex items-center justify-center mb-12">
            <div className="text-center text-white">
              <p className="text-6xl mb-4">▶️</p>
              <p className="text-lg">Video Demo Area</p>
              <p className="text-neutral-400 mt-2">Click to play interactive demo</p>
            </div>
          </Card>

          {/* Features Highlighted in Demo */}
          <h2 className="text-3xl font-bold text-neutral-900 mb-12">What You'll See In The Demo</h2>
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {[
              {
                title: 'Seamless Payment Collection',
                desc: 'Experience instant payment processing with M-Pesa integration',
                points: ['Real-time transactions', 'Instant settlement', 'Multi-till support']
              },
              {
                title: 'Comprehensive Dashboard',
                desc: 'Monitor your business performance with detailed analytics',
                points: ['Revenue tracking', 'Transaction history', 'Customer insights']
              },
              {
                title: 'Virtual Till Management',
                desc: 'Manage multiple payment channels from one platform',
                points: ['Create unlimited tills', 'Customize till settings', 'Generate till codes']
              },
              {
                title: 'Advanced Reporting',
                desc: 'Get actionable insights with comprehensive reports',
                points: ['Custom date ranges', 'Export to CSV', 'Scheduled reports']
              }
            ].map((feature, idx) => (
              <div key={idx} className="border-l-4 border-primary-500 pl-6 py-4">
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 mb-4">{feature.desc}</p>
                <ul className="space-y-2">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-neutral-700">
                      <span className="text-primary-500">✓</span> {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold mb-4">FluxPay</p>
              <p className="text-neutral-400 text-sm">Simplifying payments for African SMBs</p>
            </div>
            <div>
              <p className="font-bold mb-4">Product</p>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">Company</p>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 FluxPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
