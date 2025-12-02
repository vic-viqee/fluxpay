'use client'

import Link from 'next/link'
import { Navbar, Button, Card, Badge } from '@/app/components'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="mb-4">
                ✨ Welcome to FluxPay
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Accept Payments,<br />
                <span className="text-primary-500">Effortlessly</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
                FluxPay makes it simple to accept M-Pesa payments, manage virtual tills, and grow your business with real-time insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button variant="primary" size="lg" fullWidth>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="tertiary" size="lg" fullWidth>
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl h-96 flex items-center justify-center text-white text-2xl font-bold">
                Dashboard Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container-max">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 justify-center">
              Core Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Everything You Need to Accept Payments
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Powerful tools designed for African businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📱',
                title: 'M-Pesa Integration',
                desc: 'Accept payments directly via M-Pesa, the trusted payment method.',
              },
              {
                icon: '🏪',
                title: 'Virtual Tills',
                desc: 'Create multiple payment endpoints for branches and departments.',
              },
              {
                icon: '🔄',
                title: 'Auto Subscriptions',
                desc: 'Set up recurring billing and automate your revenue collection.',
              },
              {
                icon: '📊',
                title: 'Real-time Dashboard',
                desc: 'Monitor all transactions and revenue as they happen.',
              },
              {
                icon: '🔔',
                title: 'Payment Reminders',
                desc: 'Send automated payment reminders to your customers.',
              },
              {
                icon: '⚡',
                title: 'Bulk Payments',
                desc: 'Process multiple payments at once for efficiency.',
              },
            ].map((feature, idx) => (
              <Card key={idx} hover>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.desc}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/features">
              <Button variant="secondary">View All Features</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 md:py-32 bg-primary-500">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50K+', label: 'Active Users' },
              { number: '$100M+', label: 'Payments Processed' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Support' },
            ].map((stat, idx) => (
              <div key={idx} className="text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container-max text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Ready to Start Accepting Payments?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using FluxPay to streamline their payment collection.
          </p>
          <Link href="/signup">
            <Button variant="primary" size="lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">FluxPay</h3>
              <p className="text-neutral-400">Making payments simple for African businesses.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/help-center" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 FluxPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
