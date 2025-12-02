'use client'

import Link from 'next/link'
import { Navbar, Card, Button, Badge, Input } from '@/app/components'
import { useState } from 'react'

export default function Contact() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" userMenuOpen={userMenuOpen} onUserMenuToggle={() => setUserMenuOpen(!userMenuOpen)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="primary" className="mb-4 inline-block">Get in Touch</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Have questions about FluxPay? We'd love to hear from you. Our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 md:py-32">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">Reach Out to Us</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: '📧',
                title: 'Email Support',
                desc: 'For general inquiries and support',
                contact: 'support@fluxpay.com',
                time: 'Response within 24 hours'
              },
              {
                icon: '💼',
                title: 'Sales Team',
                desc: 'For pricing and partnership inquiries',
                contact: 'sales@fluxpay.com',
                time: 'Available Mon-Fri, 9 AM - 5 PM'
              },
              {
                icon: '📞',
                title: 'Phone Support',
                desc: 'For urgent support and issues',
                contact: '+254 (0)712 345 678',
                time: 'Mon-Fri, 8 AM - 6 PM EAT'
              }
            ].map((method, idx) => (
              <Card key={idx} hover padding="lg" className="text-center">
                <p className="text-5xl mb-4">{method.icon}</p>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{method.title}</h3>
                <p className="text-neutral-600 mb-4">{method.desc}</p>
                <p className="font-semibold text-primary-600 mb-2">{method.contact}</p>
                <p className="text-sm text-neutral-500">{method.time}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Location */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-8">Send us a Message</h2>

              {submitted ? (
                <Card className="bg-success-50 border border-success-200 p-8 text-center">
                  <p className="text-4xl mb-4">✓</p>
                  <h3 className="text-lg font-bold text-success-900 mb-2">Message Sent!</h3>
                  <p className="text-success-700">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Subject"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                  <div>
                    <label className="label">Message</label>
                    <textarea
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                  <Button variant="primary" className="w-full">Send Message</Button>
                </form>
              )}
            </div>

            {/* Company Info & Offices */}
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-8">About FluxPay</h2>

              <Card className="mb-6 bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200">
                <h3 className="font-bold text-neutral-900 mb-2">Headquarters</h3>
                <p className="text-neutral-700">
                  FluxPay Ltd.<br/>
                  Nairobi, Kenya<br/>
                  East Africa
                </p>
              </Card>

              <Card className="mb-6">
                <h3 className="font-bold text-neutral-900 mb-4">Why Choose FluxPay?</h3>
                <ul className="space-y-3">
                  {[
                    'Fastest payment processing in Africa',
                    'Transparent and competitive pricing',
                    '24/7 customer support',
                    'Bank-grade security',
                    'Multi-language support',
                    'Easy integration'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-neutral-700">
                      <span className="text-primary-500 font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <h3 className="font-bold text-neutral-900 mb-4">Company Info</h3>
                <div className="space-y-3 text-neutral-700">
                  <div>
                    <p className="text-sm text-neutral-600">Founded</p>
                    <p className="font-medium">2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Employees</p>
                    <p className="font-medium">50+</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Customers</p>
                    <p className="font-medium">2,000+</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Transactions Processed</p>
                    <p className="font-medium">$50M+</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 md:py-32">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">Quick Answers</h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'How quickly can I get started?',
                a: 'Account setup takes 5 minutes, and verification typically completes within 24 hours.'
              },
              {
                q: 'What are your fees?',
                a: 'Our fees are transparent and competitive. See our pricing page for detailed breakdown.'
              },
              {
                q: 'Do you offer API access?',
                a: 'Yes, we provide comprehensive APIs for custom integrations. Check our documentation.'
              },
              {
                q: 'What payment methods are supported?',
                a: 'We support M-Pesa payments in Kenya, with plans to expand to other methods soon.'
              }
            ].map((item, idx) => (
              <Card key={idx} className="border-l-4 border-primary-500">
                <p className="font-bold text-neutral-900 mb-2">{item.q}</p>
                <p className="text-neutral-600 text-sm">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social & Newsletter */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 py-20 md:py-32">
        <div className="container-max text-center max-w-2xl mx-auto text-white">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-lg mb-8 text-secondary-100">
            Subscribe to our newsletter for product updates, tips, and special offers.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button variant="primary">Subscribe</Button>
          </div>
          <div className="flex justify-center gap-6 mt-12">
            {['Twitter', 'LinkedIn', 'Facebook'].map((social) => (
              <a key={social} href="#" className="text-white hover:text-secondary-200 font-medium">
                {social}
              </a>
            ))}
          </div>
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
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
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
