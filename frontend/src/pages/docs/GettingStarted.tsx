import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  CreditCard, 
  Link as LinkIcon, 
  Users,
  ArrowRight,
  Zap,
  Smartphone
} from 'lucide-react';

const GettingStarted: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up for a free FluxPay account. You only need your email and phone number.',
      icon: <Zap size={24} />,
      time: '2 minutes'
    },
    {
      number: 2,
      title: 'Start Accepting Payments',
      description: 'Use Dynamic Till to enter amounts and let customers pay via M-Pesa.',
      icon: <CreditCard size={24} />,
      time: 'Immediate'
    },
    {
      number: 3,
      title: 'Grow Your Business',
      description: 'Create payment links, manage customers, and track transactions.',
      icon: <Users size={24} />,
      time: 'Ongoing'
    },
  ];

  const requirements = [
    'Kenyan M-Pesa account (Safaricom line)',
    'Business name and phone number',
    'Email address',
    'Smartphone or computer',
  ];

  const paymentMethods = [
    {
      title: 'Dynamic Till',
      description: 'Best for in-person payments. Enter amount, show QR code, customer pays.',
      icon: <CreditCard size={24} />,
      link: '/docs/dynamic-till',
      badge: 'Most Popular'
    },
    {
      title: 'Payment Links',
      description: 'Best for remote payments. Create a link, share via WhatsApp, customer pays.',
      icon: <LinkIcon size={24} />,
      link: '/docs/payment-links',
      badge: 'Remote Payments'
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Getting Started</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Getting Started with FluxPay
        </h1>
        <p className="text-xl text-gray-600">
          Learn how to accept M-Pesa payments for your business in minutes. 
          No coding required.
        </p>
      </section>

      {/* Prerequisites */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What You Need</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <ul className="space-y-3">
            {requirements.map((req) => (
              <li key={req} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">3 Steps to Start</h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {step.number}
              </div>
              <div className="flex-1 p-6 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-gray-400">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{step.time}</span>
                </div>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Accept Payments</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {paymentMethods.map((method) => (
            <Link
              key={method.title}
              to={method.link}
              className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  {method.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{method.title}</h3>
                  {method.badge && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{method.badge}</span>
                  )}
                </div>
              </div>
              <p className="text-gray-600">{method.description}</p>
              <div className="mt-4 text-blue-600 font-medium flex items-center gap-1">
                Learn more <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-50 border border-green-200 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={32} className="text-green-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Start?</h3>
            <p className="text-gray-600 mb-4">
              Create your free account and start accepting M-Pesa payments today.
            </p>
          </div>
          <Link
            to="/gateway/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Navigation */}
      <section className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
        <Link
          to="/docs"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back to Docs
        </Link>
        <Link
          to="/docs/dynamic-till"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next: Dynamic Till
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default GettingStarted;