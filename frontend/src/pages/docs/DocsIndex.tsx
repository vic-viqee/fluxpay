import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  CreditCard, 
  Link as LinkIcon, 
  Code, 
  Users,
  Receipt,
  ArrowRight,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const DocsIndex: React.FC = () => {
  const features = [
    {
      icon: <Zap size={24} />,
      title: 'Getting Started',
      description: 'Learn how to sign up and start accepting payments in minutes.',
      link: '/docs/getting-started',
      badge: 'Start Here'
    },
    {
      icon: <CreditCard size={24} />,
      title: 'Dynamic Till',
      description: 'Accept payments in-person with a QR code or Till number.',
      link: '/docs/dynamic-till'
    },
    {
      icon: <LinkIcon size={24} />,
      title: 'Payment Links',
      description: 'Create shareable payment links for remote payments.',
      link: '/docs/payment-links'
    },
    {
      icon: <Users size={24} />,
      title: 'Customers',
      description: 'Manage your customer database and track payments.',
      link: '/docs/customers'
    },
    {
      icon: <Receipt size={24} />,
      title: 'Receipts',
      description: 'Generate and send payment receipts.',
      link: '/docs/receipts'
    },
    {
      icon: <Code size={24} />,
      title: 'API Keys & Webhooks',
      description: 'Integrate with your website using API keys and webhooks.',
      link: '/docs/api-keys'
    },
  ];

  const benefits = [
    'Accept M-Pesa payments in minutes',
    'No website required - works with just a phone',
    'Real-time payment notifications',
    'Export transactions to CSV',
    'Customer management included',
    'API for developers',
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          FluxPay Documentation
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Learn how to accept M-Pesa payments for your business. 
          No coding required for in-person payments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/docs/getting-started"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/docs/quick-start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Quick Start for Developers
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Feature</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                {feature.badge && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{feature.badge}</span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/gateway/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Start Using FluxPay Free
            <ExternalLink size={18} />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* API Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Code size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">For Developers</h2>
            <p className="text-blue-100 mb-6">
              Integrate FluxPay into your website or app using our REST API. 
              Get API keys, set up webhooks, and start accepting payments online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/docs/quick-start"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Quick Start
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/docs/api"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
        <p className="text-gray-600 mb-6">
          Can't find what you're looking for? Check our FAQ or contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/documentation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            FAQ
          </Link>
          <a
            href="mailto:support@fluxpay.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        <p>FluxPay Documentation v1.0</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};

export default DocsIndex;