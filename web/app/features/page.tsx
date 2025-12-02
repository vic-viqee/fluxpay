'use client'

import Link from 'next/link'
import { Navbar, Button, Card, Badge } from '@/app/components'

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="primary" className="mb-4 justify-center">
            Our Capabilities
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Powerful Features for Your Business
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Everything you need to accept payments, manage transactions, and grow
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-max">
          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="success" className="mb-4">
                  M-Pesa Integration
                </Badge>
                <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                  Accept Payments Via M-Pesa
                </h2>
                <p className="text-lg text-neutral-600 mb-6">
                  Integrate with M-Pesa and start accepting payments from millions of users instantly. No complex setup required.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex gap-3">
                    <span className="text-success-500 font-bold">✓</span>
                    <span>Instant M-Pesa integration</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-success-500 font-bold">✓</span>
                    <span>Real-time payment notifications</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-success-500 font-bold">✓</span>
                    <span>Secure and reliable</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-success-50 to-primary-50 rounded-2xl h-80 flex items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl h-80 flex items-center justify-center order-last md:order-first">
                <span className="text-6xl">🏪</span>
              </div>
              <div>
                <Badge variant="secondary" className="mb-4">
                  Virtual Tills
                </Badge>
                <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                  Manage Multiple Tills Easily
                </h2>
                <p className="text-lg text-neutral-600 mb-6">
                  Create and manage virtual tills for different branches, departments, or teams. Track revenue by location with ease.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex gap-3">
                    <span className="text-secondary-500 font-bold">✓</span>
                    <span>Unlimited virtual tills</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-secondary-500 font-bold">✓</span>
                    <span>Track revenue by location</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-secondary-500 font-bold">✓</span>
                    <span>Easy till management</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="tertiary" className="mb-4">
                  Auto Subscriptions
                </Badge>
                <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                  Automate Recurring Payments
                </h2>
                <p className="text-lg text-neutral-600 mb-6">
                  Set up automatic recurring payments for subscriptions, memberships, and services. Get paid on schedule, every time.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex gap-3">
                    <span className="text-tertiary-500 font-bold">✓</span>
                    <span>Automated billing cycles</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-tertiary-500 font-bold">✓</span>
                    <span>Reduce payment chasing</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-tertiary-500 font-bold">✓</span>
                    <span>Flexible payment schedules</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-tertiary-50 to-primary-50 rounded-2xl h-80 flex items-center justify-center">
                <span className="text-6xl">🔄</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-to-br from-info-50 to-primary-50 rounded-2xl h-80 flex items-center justify-center order-last md:order-first">
                <span className="text-6xl">📊</span>
              </div>
              <div>
                <Badge variant="info" className="mb-4">
                  Real-time Dashboard
                </Badge>
                <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                  Monitor Your Business Live
                </h2>
                <p className="text-lg text-neutral-600 mb-6">
                  Get real-time insights into payments, revenue, and customer activity. Make data-driven decisions instantly.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex gap-3">
                    <span className="text-info-500 font-bold">✓</span>
                    <span>Live transaction tracking</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-info-500 font-bold">✓</span>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-info-500 font-bold">✓</span>
                    <span>Custom reports</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-primary-50">
        <div className="container-max text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Start using FluxPay today and transform how you accept payments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
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
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/help-center" className="hover:text-white">Help Center</Link></li>
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
