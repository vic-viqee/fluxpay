'use client'

import Link from 'next/link'
import { Navbar, Button, Card, Badge, Input, Footer } from '@/app/components'

export default function Blog() {
  const articles = [
    {
      id: 1,
      title: 'How M-Pesa is Transforming African Payment Landscape',
      excerpt:
        'Discover how M-Pesa is revolutionizing payments across East Africa and why your business should embrace it.',
      date: 'Dec 1, 2025',
      category: 'Industry Insights',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: '10 Tips to Optimize Your Payment Collection Process',
      excerpt:
        'Learn proven strategies to streamline your payment collection and increase customer satisfaction.',
      date: 'Nov 28, 2025',
      category: 'Tips & Tricks',
      readTime: '8 min read',
    },
    {
      id: 3,
      title: 'Case Study: How Kipchoge Electronics Grew Revenue by 40%',
      excerpt:
        'Read about how Kipchoge Electronics used FluxPay to transform their payment process and business.',
      date: 'Nov 25, 2025',
      category: 'Case Studies',
      readTime: '6 min read',
    },
    {
      id: 4,
      title: 'The Future of Digital Payments in Africa',
      excerpt:
        'Explore trends shaping the future of digital payments and how to stay ahead of the curve.',
      date: 'Nov 22, 2025',
      category: 'Industry Insights',
      readTime: '7 min read',
    },
    {
      id: 5,
      title: 'Virtual Tills: Managing Multiple Business Locations Efficiently',
      excerpt:
        'Learn how virtual tills can help you manage payments across multiple branches seamlessly.',
      date: 'Nov 19, 2025',
      category: 'Features',
      readTime: '4 min read',
    },
    {
      id: 6,
      title: 'Subscription Models That Work: Best Practices Guide',
      excerpt:
        'Master the art of recurring payments and build sustainable revenue streams with subscriptions.',
      date: 'Nov 16, 2025',
      category: 'Tips & Tricks',
      readTime: '9 min read',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="public" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 md:py-32">
        <div className="container-max text-center">
          <Badge variant="secondary" className="mb-4 justify-center">
            Blog & Resources
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Payment Insights & Best Practices
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Learn from industry experts and discover how to grow your business with smart payment strategies
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 md:py-32 bg-neutral-50">
        <div className="container-max">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {articles.map((article) => (
              <Card key={article.id} hover className="flex flex-col">
                <Badge variant="primary" size="sm" className="mb-4 w-fit">
                  {article.category}
                </Badge>
                <h3 className="text-xl font-bold text-neutral-900 mb-3 flex-1">
                  {article.title}
                </h3>
                <p className="text-neutral-600 mb-4 flex-1">{article.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-neutral-500">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Featured Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-neutral-900 mb-8">Featured Resources</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Download Our Guide</h3>
                <p className="text-neutral-700 mb-6">
                  Get our comprehensive guide to payment processing best practices. Perfect for business owners and managers.
                </p>
                <Button variant="primary">Download PDF</Button>
              </Card>
              <Card className="bg-gradient-to-br from-success-50 to-tertiary-50">
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">Video Tutorials</h3>
                <p className="text-neutral-700 mb-6">
                  Watch our step-by-step video guides to set up FluxPay and start accepting payments in minutes.
                </p>
                <Button variant="secondary">Watch Videos</Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 md:py-32 bg-primary-500 text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Stay Updated</h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for payment tips, industry insights, and product updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input label="Email for newsletter" type="email" placeholder="Your email" className="flex-1 text-neutral-900" />
            <Button variant="tertiary">Subscribe</Button>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  )
}
