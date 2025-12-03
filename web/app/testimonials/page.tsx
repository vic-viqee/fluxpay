'use client'

import Link from 'next/link'
import { Navbar, Button, Card, Badge, Footer } from '@/app/components'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Kipchoge',
      role: 'Owner, Kipchoge Electronics',
      image: '👩‍💼',
      content:
        'FluxPay made it incredibly easy to accept payments from customers. My sales increased by 40% in just 3 months!',
      rating: 5,
    },
    {
      name: 'James Okonkwo',
      role: 'Manager, Okonkwo Salon & Spa',
      image: '👨‍💼',
      content:
        'The virtual tills feature is perfect for managing my multiple branches. I can track revenue for each location instantly.',
      rating: 5,
    },
    {
      name: 'Grace Mutua',
      role: 'Founder, Grace Online Learning',
      image: '👩‍🏫',
      content:
        'Setting up auto-subscriptions was a game-changer for my online courses. Now I get paid automatically every month.',
      rating: 5,
    },
    {
      name: 'David Kimani',
      role: 'CEO, Kimani Transport',
      image: '👨‍💻',
      content:
        'The real-time dashboard gives me complete visibility into my business. I love the detailed transaction reports.',
      rating: 5,
    },
    {
      name: 'Amara Hassan',
      role: 'Proprietor, Hassan Fashion',
      image: '👩‍🎨',
      content:
        'Customer support is exceptional. They helped me set up everything in just 2 hours. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Peter Njeri',
      role: 'Principal, Njeri Academy',
      image: '👨‍🎓',
      content:
        'FluxPay reduced my payment processing time significantly. My students and parents love the easy payment option.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="success" className="mb-4 justify-center">
            Success Stories
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            What Our Customers Say
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Thousands of businesses trust FluxPay to manage their payments and grow their revenue
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container-max">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} hover>
                <div className="flex gap-4 mb-4">
                  <div className="text-5xl">{testimonial.image}</div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{testimonial.name}</h3>
                    <p className="text-sm text-neutral-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating)
                    .fill(null)
                    .map((_, i) => (
                      <span key={i} className="text-warning-500">
                        ★
                      </span>
                    ))}
                </div>
                <p className="text-neutral-700 italic">"{testimonial.content}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-32 bg-primary-500 text-white">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-primary-100">Happy Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">$100M+</div>
              <div className="text-primary-100">Processed</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9/5</div>
              <div className="text-primary-100">Rating</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-max text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Join Thousands of Happy Customers
          </h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Start your journey with FluxPay today and see the difference
          </p>
          <Link href="/signup">
            <Button variant="primary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  )
}
