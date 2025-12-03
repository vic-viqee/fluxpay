'use client'

import Link from 'next/link'
import { Navbar, Button, Card, Badge, Footer } from '@/app/components'

export default function About() {
  const team = [
    { name: 'Jane Kipchoge', role: 'CEO & Founder', avatar: '👩‍💼' },
    { name: 'Samuel Okonkwo', role: 'CTO', avatar: '👨‍💻' },
    { name: 'Grace Mutua', role: 'Head of Operations', avatar: '👩‍🔬' },
    { name: 'David Kimani', role: 'Head of Customer Success', avatar: '👨‍💼' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="primary" className="mb-4 justify-center">
            Our Story
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Making Payments Simple for Africa
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            FluxPay is on a mission to democratize payment processing across Africa
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card hover className="bg-gradient-to-br from-primary-50 to-blue-50">
              <h3 className="text-3xl font-bold text-neutral-900 mb-4">🎯 Our Mission</h3>
              <p className="text-lg text-neutral-700">
                To empower African businesses with simple, affordable, and reliable payment solutions that help them accept payments from anywhere, at any time.
              </p>
            </Card>
            <Card hover className="bg-gradient-to-br from-secondary-50 to-blue-50">
              <h3 className="text-3xl font-bold text-neutral-900 mb-4">🚀 Our Vision</h3>
              <p className="text-lg text-neutral-700">
                To become the leading payment platform in Africa, enabling millions of businesses to thrive through digital payment innovation.
              </p>
            </Card>
          </div>

          {/* Story */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-8">Our Journey</h2>
            <div className="space-y-6">
              <p className="text-lg text-neutral-700 leading-relaxed">
                FluxPay was founded in 2023 by Jane Kipchoge, a passionate entrepreneur who witnessed the payment challenges faced by African businesses. After running her own e-commerce business, Jane realized there was a massive gap in payment solutions tailored specifically for African markets.
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed">
                With a small team of dedicated developers and payment experts, FluxPay launched its first version with M-Pesa integration. What started as a simple payment processor has evolved into a comprehensive platform handling over $100 million in transactions monthly.
              </p>
              <p className="text-lg text-neutral-700 leading-relaxed">
                Today, FluxPay powers payments for over 50,000 businesses across East Africa, from small retail shops to large enterprises. We remain committed to our founding mission: making payment processing simple, affordable, and accessible to every African business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container-max">
          <h2 className="text-4xl font-bold text-neutral-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <Card key={idx} hover className="text-center">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1">{member.name}</h3>
                <p className="text-neutral-600">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-max">
          <h2 className="text-4xl font-bold text-neutral-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '💡',
                title: 'Innovation',
                desc: 'We constantly innovate to provide cutting-edge payment solutions.',
              },
              {
                icon: '🤝',
                title: 'Trust',
                desc: 'We build trust through transparency, security, and reliability.',
              },
              {
                icon: '🌍',
                title: 'Impact',
                desc: 'We impact African business growth through payment empowerment.',
              },
            ].map((value, idx) => (
              <Card key={idx} hover>
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{value.title}</h3>
                <p className="text-neutral-700">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-primary-500 text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Us in Our Mission
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Be part of the payment revolution in Africa
          </p>
          <Link href="/signup">
            <Button variant="tertiary" size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  )
}
