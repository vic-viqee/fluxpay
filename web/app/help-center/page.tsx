'use client'

import Link from 'next/link'
import { Navbar, Button, Card, Badge, Input } from '@/app/components'
import { useState } from 'react'

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('')

  const faqs = [
    {
      category: 'Getting Started',
      items: [
        { q: 'How do I create a FluxPay account?', a: 'Sign up at fluxpay.com, complete your profile, and you\'re ready to start accepting payments.' },
        { q: 'How long does verification take?', a: 'Most accounts are verified within 24 hours. You can start accepting payments immediately.' },
        { q: 'What documents do I need?', a: 'We need your business registration and identification. For individuals, a national ID is sufficient.' },
      ],
    },
    {
      category: 'Payments',
      items: [
        { q: 'How are payments processed?', a: 'Payments are processed instantly and deposited to your account within 24 hours.' },
        { q: 'What payment methods do you support?', a: 'Currently, we support M-Pesa, bank transfers, and credit/debit cards.' },
        { q: 'Are there transaction fees?', a: 'Transaction fees vary by plan. Check our pricing page for details.' },
      ],
    },
    {
      category: 'Virtual Tills',
      items: [
        { q: 'How many tills can I create?', a: 'Professional and Enterprise plans have unlimited virtual tills.' },
        { q: 'How do I manage multiple tills?', a: 'You can manage all tills from your dashboard with separate tracking for each.' },
      ],
    },
    {
      category: 'Support',
      items: [
        { q: 'How do I contact support?', a: 'You can reach us via email, chat, or phone. We respond within 2 hours for urgent issues.' },
        { q: 'What are your support hours?', a: 'We offer 24/7 support for Enterprise customers. Other plans have standard business hours support.' },
      ],
    },
  ]

  const filteredFaqs = faqs.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container-max">
          <Badge variant="success" className="mb-4">
            Help & Support
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            How Can We Help?
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl">
            Find answers to common questions, explore our documentation, and get support
          </p>

          <Input
            type="search"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xl"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-neutral-50 border-b border-neutral-200">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '📖', title: 'Documentation', desc: 'Read our guides' },
              { icon: '🎥', title: 'Video Tutorials', desc: 'Watch how-to videos' },
              { icon: '💬', title: 'Community', desc: 'Join our community' },
              { icon: '📧', title: 'Contact Support', desc: 'Get in touch' },
            ].map((link, idx) => (
              <button
                key={idx}
                className="p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-2">{link.icon}</div>
                <h3 className="font-bold text-neutral-900">{link.title}</h3>
                <p className="text-sm text-neutral-600">{link.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-max">
          <h2 className="text-4xl font-bold text-neutral-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-12">
            {filteredFaqs.map((section, sectionIdx) =>
              section.items.length > 0 ? (
                <div key={sectionIdx}>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                    {section.category}
                  </h3>
                  <div className="space-y-4">
                    {section.items.map((item, itemIdx) => (
                      <Card key={itemIdx} hover>
                        <details className="group cursor-pointer">
                          <summary className="flex justify-between items-center font-bold text-neutral-900">
                            {item.q}
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <p className="mt-4 text-neutral-700">{item.a}</p>
                        </details>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null
            )}

            {filteredFaqs.every((section) => section.items.length === 0) && (
              <div className="text-center py-12">
                <p className="text-lg text-neutral-600">No results found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 md:py-32 bg-primary-50">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">Still Have Questions?</h2>
          <p className="text-lg text-neutral-600 mb-8">
            Our support team is here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg">
              Email Support
            </Button>
            <Button variant="secondary" size="lg">
              Start Live Chat
            </Button>
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
