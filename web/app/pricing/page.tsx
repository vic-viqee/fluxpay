'use client'

import Link from 'next/link'
import { Navbar, Button, Card, Badge, Check } from '@/app/components'

const CheckIcon = () => <span className="text-success-500 font-bold">✓</span>

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for small businesses getting started',
      features: [
        'M-Pesa payments',
        '1 Virtual Till',
        'Basic dashboard',
        'Email support',
        'Transaction history',
        'Up to 100 transactions/month',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'Best for growing businesses',
      features: [
        'Everything in Starter',
        'Unlimited Virtual Tills',
        'Auto Subscriptions',
        'Priority support',
        'Advanced analytics',
        'Unlimited transactions',
        'Payment reminders',
        'Bulk payments',
      ],
      cta: 'Get Started',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large-scale operations',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'API access',
        'White-label options',
        'SLA guarantee',
        'Custom reporting',
        'Phone support',
      ],
      cta: 'Contact Us',
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="primary" className="mb-4 justify-center">
            Simple Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Pricing That Grows With You
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`flex flex-col h-full ${
                  plan.highlighted
                    ? 'ring-2 ring-primary-500 md:scale-105'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <Badge variant="secondary" className="mb-4 w-fit">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <p className="text-neutral-600 mb-6 text-sm">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-neutral-900">{plan.price}</span>
                    {plan.period !== 'pricing' && (
                      <span className="text-neutral-600">{plan.period}</span>
                    )}
                  </div>
                </div>

                <Link href="/signup" className="mb-8 block">
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    fullWidth
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <div className="space-y-4 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckIcon />
                      <span className="text-neutral-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  q: 'Can I switch plans anytime?',
                  a: 'Yes! You can upgrade or downgrade your plan at any time with no penalties.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major payment methods including credit cards, M-Pesa, and bank transfers.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied.',
                },
                {
                  q: 'Is there a setup fee?',
                  a: 'No setup fees ever. You only pay for what you use.',
                },
                {
                  q: 'What about transaction fees?',
                  a: 'Professional plans include low transaction fees. Contact us for custom rates.',
                },
                {
                  q: 'Do you offer API access?',
                  a: 'API access is available on Enterprise plans. Contact our team for details.',
                },
              ].map((faq, idx) => (
                <Card key={idx}>
                  <h4 className="font-bold text-neutral-900 mb-2">{faq.q}</h4>
                  <p className="text-neutral-600 text-sm">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-primary-500 text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Choose your plan and start accepting payments today
          </p>
          <Link href="/signup">
            <Button variant="tertiary" size="lg">
              Sign Up Free
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
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
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
