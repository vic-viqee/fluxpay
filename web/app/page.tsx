'use client'

import Link from 'next/link'
import { Navbar, Button, Card } from '@/app/components'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-1)' }}>
      <Navbar variant="public" />

      {/* Hero Section */}
      <section style={{ paddingTop: 'var(--spacing-32)', paddingBottom: 'var(--spacing-24)', backgroundColor: 'var(--color-surface-1)' }}>
        <div className="container-max">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-8)' }}>
              TRUSTED BY KENYAN BUSINESSES
            </span>
            <h1 style={{ fontSize: 'clamp(2.25rem, 8vw, 3.75rem)', fontWeight: '700', lineHeight: '1.2', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-6)' }}>
              Smart M-Pesa Payments on Autopilot
            </h1>
            <p style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: 'var(--spacing-8)', maxWidth: '650px', margin: '0 auto var(--spacing-8)' }}>
              FluxPay automates recurring billing, STK Push payments, and subscription management. No Paybill needed—just set it once and watch the money flow.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-12)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', width: '100%', maxWidth: '400px' }}>
                <Link href="/signup" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" className="btn-full-width" size="lg">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/demo" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" className="btn-full-width" size="lg">
                    View Demo
                  </Button>
                </Link>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>

            {/* Trust Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-tertiary)' }}>TRUSTED BY</span>
              <div style={{ display: 'flex', gap: 'var(--spacing-6)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                {['Gyms', 'ISPs', 'SaaS', 'Tutors', 'Freelancers'].map((type, idx) => (
                  <span key={idx} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ paddingTop: 'var(--spacing-24)', paddingBottom: 'var(--spacing-24)', backgroundColor: 'var(--color-surface-2)' }}>
        <div className="container-max">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-16)' }}>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
              Everything you need to collect payments
            </h2>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>
              Built for Kenyan businesses that need predictable, professional, automated M-Pesa collections.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-8)' }}>
            {[
              { icon: '🔄', title: 'Recurring Billing', desc: 'Automatically charge customers weekly, monthly, or on custom schedules using M-Pesa STK Push.' },
              { icon: '⚡', title: 'Instant STK Checkout', desc: 'Fast, clean checkout flow for one-time payments with branded confirmation and receipts.' },
              { icon: '🏪', title: 'Virtual Till', desc: 'No Paybill? No problem. Get a shared virtual Till with auto-reconciliation and branded receipts.' },
              { icon: '📊', title: 'Real-Time Dashboard', desc: 'Track revenue, active subscriptions, overdue payments, customer history, and churn—all in one place.' },
              { icon: '🔔', title: 'Smart Reminders', desc: 'Friendly, automated payment reminders that feel human. Failed payments retry automatically.' },
              { icon: '🔌', title: 'Developer API', desc: 'Full-featured API with webhooks for SaaS integrations and custom workflows.' },
            ].map((feature, idx) => (
              <Card key={idx} padding="md" hover={true}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-4)' }}>{feature.icon}</div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ paddingTop: 'var(--spacing-24)', paddingBottom: 'var(--spacing-24)', backgroundColor: 'var(--color-surface-1)' }}>
        <div className="container-max">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-16)' }}>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
              Why businesses choose FluxPay
            </h2>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>
              FluxPay gives you what traditional Paybills, Tills, and spreadsheets cannot—predictable, professional, automated M-Pesa collections.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-8)' }}>
            {[
              { icon: '⚙️', title: 'No Paybill Required', desc: 'Freelancers get a virtual Till immediately. Start collecting payments in minutes.' },
              { icon: '🤖', title: 'Automated Collections', desc: 'Set it once—FluxPay handles recurring billing automatically. Zero manual work.' },
              { icon: '🇰🇪', title: 'Built for Kenyan Business', desc: 'WhatsApp integration, M-Pesa flows, SMS communication—designed for how Kenya works.' },
              { icon: '✅', title: 'Transparent & Trustworthy', desc: 'Every action is visible. Customers get clear receipts. Automations are explained.' },
              { icon: '📈', title: 'Better Retention', desc: 'Smart retries and friendly reminders reduce churn and keep subscriptions active.' },
              { icon: '📋', title: 'Professional Tools', desc: 'PDF receipts, exports, dashboards, and reports—without needing accounting knowledge.' },
            ].map((benefit, idx) => (
              <div key={idx} style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-4)' }}>{benefit.icon}</div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
                  {benefit.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ paddingTop: 'var(--spacing-24)', paddingBottom: 'var(--spacing-24)', backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <div className="container-max">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-12)', textAlign: 'center' }}>
            {[
              { number: 'KSh 456K', label: 'Monthly Revenue' },
              { number: '127', label: 'Active Subscriptions' },
              { number: '94.2%', label: 'Success Rate' },
              { number: '2.4 hrs', label: 'Avg. Collection Time' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', marginBottom: 'var(--spacing-2)' }}>
                  {stat.number}
                </div>
                <div style={{ color: '#e8f1ff', fontSize: 'var(--font-size-base)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ paddingTop: 'var(--spacing-24)', paddingBottom: 'var(--spacing-24)', backgroundColor: 'var(--color-surface-2)' }}>
        <div className="container-max" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
            Ready to automate your M-Pesa collections?
          </h2>
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-8)', maxWidth: '600px', margin: '0 auto var(--spacing-8)' }}>
            Join hundreds of Kenyan businesses using FluxPay to collect payments automatically. No Paybill required. Start in minutes.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg">
                Talk to Sales
              </Button>
            </Link>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--spacing-6)' }}>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: 'white', paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)' }}>
        <div className="container-max">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
            <div>
              <h3 style={{ fontWeight: '700', marginBottom: 'var(--spacing-4)' }}>Product</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                <li><Link href="/features" style={{ color: '#9ca3af', textDecoration: 'none' }}>Features</Link></li>
                <li><Link href="/pricing" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</Link></li>
                <li><Link href="/documentation" style={{ color: '#9ca3af', textDecoration: 'none' }}>API</Link></li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontWeight: '700', marginBottom: 'var(--spacing-4)' }}>Company</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                <li><Link href="/about" style={{ color: '#9ca3af', textDecoration: 'none' }}>About</Link></li>
                <li><Link href="/blog" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</Link></li>
                <li><Link href="/careers" style={{ color: '#9ca3af', textDecoration: 'none' }}>Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontWeight: '700', marginBottom: 'var(--spacing-4)' }}>Resources</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                <li><Link href="/documentation" style={{ color: '#9ca3af', textDecoration: 'none' }}>Documentation</Link></li>
                <li><Link href="/guides" style={{ color: '#9ca3af', textDecoration: 'none' }}>Guides</Link></li>
                <li><Link href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontWeight: '700', marginBottom: 'var(--spacing-4)' }}>Legal</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                <li><Link href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</Link></li>
                <li><Link href="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</Link></li>
                <li><Link href="/security" style={{ color: '#9ca3af', textDecoration: 'none' }}>Security</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: 'var(--spacing-8)', textAlign: 'center', color: '#9ca3af' }}>
            <p>&copy; 2025 FluxPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

