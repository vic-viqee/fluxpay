'use client'

import Link from 'next/link'
import { Navbar, Card, Button, Badge, Input, Footer } from '@/app/components'
import { useState } from 'react'

export default function FAQ() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create a FluxPay account?',
      answer: 'Visit our sign-up page and fill in your business information. Verification typically takes 24 hours. You\'ll receive a confirmation email once your account is active.'
    },
    {
      category: 'getting-started',
      question: 'What documents do I need to verify my account?',
      answer: 'You\'ll need a valid government ID, business registration documents, and proof of address. All documents should be clear and legible for faster processing.'
    },
    {
      category: 'getting-started',
      question: 'How long does verification take?',
      answer: 'Most accounts are verified within 24 hours. Some applications may require additional review and could take up to 3 business days.'
    },
    {
      category: 'payments',
      question: 'What payment methods do you support?',
      answer: 'We primarily support M-Pesa payments in Kenya, with plans to expand to other payment methods and regions soon.'
    },
    {
      category: 'payments',
      question: 'How quickly are payments settled?',
      answer: 'Payments are typically settled daily. You can view your settlement schedule in the dashboard under Settings > Payment Setup.'
    },
    {
      category: 'payments',
      question: 'What are your transaction fees?',
      answer: 'Our fees are competitive and transparent. Standard transaction fee is 1.5% per transaction. View detailed pricing on our pricing page.'
    },
    {
      category: 'tills',
      question: 'What is a virtual till?',
      answer: 'A virtual till is a unique payment point in FluxPay. You can create unlimited tills for different locations, products, or business units.'
    },
    {
      category: 'tills',
      question: 'How many virtual tills can I create?',
      answer: 'You can create unlimited virtual tills on any plan. Each till can be customized with its own settings and branding.'
    },
    {
      category: 'tills',
      question: 'Can I share till codes with my customers?',
      answer: 'Yes! You can generate till codes and share them via SMS, email, or print. Customers can use the code to pay through the till.'
    },
    {
      category: 'support',
      question: 'How do I contact customer support?',
      answer: 'You can reach our support team via email at support@fluxpay.com, through the help center, or by scheduling a call with our team.'
    },
    {
      category: 'support',
      question: 'What are your support hours?',
      answer: 'We provide support Monday to Friday from 8 AM to 6 PM EAT. Critical issues outside these hours can be escalated through our emergency support line.'
    },
    {
      category: 'support',
      question: 'Is there documentation available?',
      answer: 'Yes! We have comprehensive documentation, API guides, and integration examples available in our help center.'
    }
  ]

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'payments', label: 'Payments' },
    { id: 'tills', label: 'Virtual Tills' },
    { id: 'support', label: 'Support' }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" userMenuOpen={userMenuOpen} onUserMenuToggle={() => setUserMenuOpen(!userMenuOpen)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="primary" className="mb-4 inline-block">Help & Support</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions about FluxPay, our services, and how to get started
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <Input
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-12 border-b border-neutral-200">
        <div className="container-max">
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs List */}
      <section className="py-20 md:py-32">
        <div className="container-max max-w-3xl">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, idx) => (
                <Card
                  key={idx}
                  hover
                  className="cursor-pointer"
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-neutral-900">{faq.question}</h3>
                      <Badge variant={
                        faq.category === 'getting-started' ? 'info' :
                          faq.category === 'payments' ? 'success' :
                            faq.category === 'tills' ? 'secondary' :
                              'warning'
                      } className="mt-2 inline-block">
                        {categories.find(c => c.id === faq.category)?.label}
                      </Badge>
                    </div>
                    <span className="text-2xl text-neutral-500 ml-4">
                      {expandedFAQ === idx ? '−' : '+'}
                    </span>
                  </div>

                  {expandedFAQ === idx && (
                    <div className="mt-6 pt-6 border-t border-neutral-200">
                      <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-2xl mb-4">🔍</p>
              <p className="text-lg text-neutral-600">No FAQs found matching your search</p>
              <p className="text-neutral-500 mt-2">Try adjusting your search terms or category filters</p>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">Quick Access</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '📚', title: 'Documentation', desc: 'Read our comprehensive guides', link: '/help-center' },
              { icon: '🎓', title: 'Tutorials', desc: 'Step-by-step video guides', link: '#' },
              { icon: '👥', title: 'Community', desc: 'Connect with other users', link: '#' },
              { icon: '💬', title: 'Contact Support', desc: 'Get help from our team', link: '/contact' }
            ].map((link, idx) => (
              <Link key={idx} href={link.link}>
                <Card hover className="text-center h-full">
                  <p className="text-5xl mb-4">{link.icon}</p>
                  <h3 className="font-bold text-neutral-900 mb-2">{link.title}</h3>
                  <p className="text-sm text-neutral-600">{link.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 py-20 md:py-32">
        <div className="container-max text-center max-w-2xl mx-auto text-white">
          <h2 className="text-4xl font-bold mb-6">Didn't find your answer?</h2>
          <p className="text-lg mb-8 text-secondary-100">
            Our support team is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <Link href="/contact">
            <Button variant="primary">Contact Us</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="dark" />
    </div>
  )
}
