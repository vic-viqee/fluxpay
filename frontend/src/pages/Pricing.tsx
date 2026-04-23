import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaqItem from '../components/FaqItem';
import ContactSalesModal from '../components/ContactSalesModal';
import { Check, Globe, Repeat } from 'lucide-react';

const Pricing: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>('subscription');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const subscriptionPlans = [
    {
      name: 'Free',
      price: 'KES 0',
      features: ['Up to 10 Customers', 'Manual Invoices', 'Basic Analytics'],
      cta: 'Get Started',
      description: 'For freelancers'
    },
    {
      name: 'Starter',
      price: 'KES 999',
      features: ['Up to 100 Customers', 'Auto-Invoices', 'Email Reminders', 'Standard Analytics'],
      cta: 'Start Free Trial',
      popular: false,
      description: 'For small businesses'
    },
    {
      name: 'Growth',
      price: 'KES 2,499',
      features: ['Up to 1,000 Customers', 'Auto-billing', 'WhatsApp Reminders', 'Advanced Analytics'],
      cta: 'Start Free Trial',
      popular: true,
      description: 'For growing businesses'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited Customers', 'Custom Integrations', 'Dedicated Support', 'Priority Processing'],
      cta: 'Contact Sales',
      description: 'For large organizations'
    }
  ];

  const gatewayPlans = [
    {
      name: 'Free',
      price: 'KES 0',
      features: ['50 Transactions/mo', 'API Access', 'Webhooks', '1 Business', 'Basic Dashboard', 'Email Support'],
      cta: 'Start Testing',
      description: 'For developers',
      greyedOutFeatures: ['B2C Disbursements', 'Priority Support', 'Custom Branding', 'Multi-business', 'Advanced Analytics']
    },
    {
      name: 'Starter',
      price: 'KES 1,499',
      features: ['Up to 100 Transactions/mo', 'API Access', 'Webhooks', '1 Business', 'Full Dashboard', 'Email Support'],
      cta: 'Start Integrating',
      description: 'For small apps',
      greyedOutFeatures: ['B2C Disbursements', 'Priority Support', 'Custom Branding', 'Multi-business', 'Advanced Analytics']
    },
    {
      name: 'Growth',
      price: 'KES 4,999',
      features: ['Up to 1,000 Transactions/mo', 'Full API + SDK', 'B2C Payouts', 'Priority Support'],
      cta: 'Start Integrating',
      popular: true,
      description: 'For marketplaces & platforms'
    },
    {
      name: 'Enterprise',
      price: 'KES 14,999',
      features: ['Unlimited Transactions', 'Custom Integrations', 'Dedicated Account Manager', 'Priority Support'],
      cta: 'Start Integrating',
      description: 'For high-volume businesses'
    },
    {
      name: 'Partner',
      price: 'Custom',
      features: ['Multi-business Management', 'White-label Options', 'Reseller Pricing', 'Dedicated Shortcode'],
      cta: 'Contact Sales',
      description: 'For payment aggregators'
    }
  ];

  const currentPlans = selectedService === 'subscription' ? subscriptionPlans : gatewayPlans;

  const handleProceed = () => {
    if (!selectedPlan) return;

    if (selectedPlan === 'Enterprise' || selectedPlan === 'Partner') {
      setIsModalOpen(true);
    } else if (selectedPlan === 'Free') {
      navigate('/signup');
    } else {
      navigate('/signup', { state: { plan: selectedPlan, service: selectedService } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Navbar />
      <ContactSalesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <main className="flex-grow">
        {/* Service Toggle */}
        <section className="bg-surface-bg py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-8">
                Choose Your FluxPay Service
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => { setSelectedService('subscription'); setSelectedPlan(null); }}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedService === 'subscription'
                      ? 'border-main bg-main/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${selectedService === 'subscription' ? 'bg-main' : 'bg-gray-700'}`}>
                      <Repeat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Subscription Billing</h3>
                      <p className="text-sm text-gray-400">Collect recurring payments</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Perfect for gyms, schools, SaaS businesses. Automate your customer subscriptions and send auto-reminders.
                  </p>
                </button>

                <button
                  onClick={() => { setSelectedService('gateway'); setSelectedPlan(null); }}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedService === 'gateway'
                      ? 'border-main bg-main/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${selectedService === 'gateway' ? 'bg-main' : 'bg-gray-700'}`}>
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Payment Gateway</h3>
                      <p className="text-sm text-gray-400">Accept M-Pesa in your app</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    The Stripe for Kenya. Integrate M-Pesa payments into any marketplace, app, or platform via API.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section className="py-16 md:py-24 bg-primary-bg">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                {selectedService === 'subscription' ? 'Subscription Billing Plans' : 'Payment Gateway Plans'}
              </h2>
              <p className="text-lg text-gray-400 mt-4">
                {selectedService === 'subscription' 
                  ? 'Simple pricing for automating your customer subscriptions'
                  : 'Simple API integration - only pay for what you use'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {currentPlans.map((plan) => {
                const isSelected = selectedPlan === plan.name;
                return (
                  <div
                    key={plan.name}
                    className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-main bg-surface-bg'
                        : 'border-gray-800 bg-surface-bg/50 hover:border-gray-700'
                    }`}
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-main rounded-full text-sm font-bold text-white">
                        Popular
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-400">{plan.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                      {plan.price !== 'Custom' && plan.price !== 'KES 0' && (
                        <span className="text-gray-400">/month</span>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      disabled={!isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(plan.name);
                      }}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-main text-white'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={handleProceed}
                disabled={!selectedPlan}
                className="px-8 py-4 text-lg font-bold text-white bg-main rounded-xl shadow-lg hover:bg-blue-500 transition-colors disabled:bg-surface-bg disabled:cursor-not-allowed disabled:text-gray-500"
              >
                {selectedPlan === 'Enterprise' || selectedPlan === 'Partner' 
                  ? 'Contact Sales' 
                  : selectedPlan === 'Free'
                  ? 'Get Started Free'
                  : `Start with ${selectedPlan}`
                }
              </button>
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-16 md:py-24 bg-surface-bg">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white text-center mb-12">
                What's included in each plans
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-gray-400">Features</th>
                      <th className="text-center py-4 px-4 text-white">Free</th>
                      <th className="text-center py-4 px-4 text-white">Starter</th>
                      <th className="text-center py-4 px-4 text-white">Growth</th>
                      <th className="text-center py-4 px-4 text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4 text-gray-300">Customers</td>
                      <td className="py-4 px-4 text-center text-gray-300">Up to 10</td>
                      <td className="py-4 px-4 text-center text-gray-300">Up to 100</td>
                      <td className="py-4 px-4 text-center text-gray-300">Up to 1,000</td>
                      <td className="py-4 px-4 text-center text-gray-300">Unlimited</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4 text-gray-300">Auto-billing</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4 text-gray-300">Email Reminders</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4 text-gray-300">Payment Gateway API</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4 text-gray-300">Webhooks</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4 text-gray-300">B2C Disbursements</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                    </tr>
                    <tr className="border-b border-gray-800">
                      <td className="py-4 px-4 text-gray-300">Priority Support</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-gray-500">-</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                      <td className="py-4 px-4 text-center text-green-500">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-primary-bg">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-white">Trusted by Kenyan businesses</h2>
              <div className="mt-12 flex justify-center items-center space-x-8 md:space-x-12">
                <img 
                  src="/anything_logo.png" 
                  alt="Anything" 
                  className="h-12 md:h-16 object-contain filter brightness-0 invert opacity-70"
                />
                <div className="text-gray-400 font-bold text-xl">Your Business Here</div>
                <div className="text-gray-400 font-bold text-xl">Your Business Here</div>
              </div>
              <div className="mt-12">
                <blockquote className="text-xl italic text-gray-300">
                  <p>"Anything runs on FluxPay for all our Kenyan marketplace transactions. The API integration was seamless and our sellers get paid instantly via M-Pesa."</p>
                </blockquote>
                <cite className="mt-4 block font-semibold text-white">
                  - Anything Marketplace
                </cite>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-surface-bg">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-extrabold text-white text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="divide-y divide-gray-700">
                <FaqItem 
                  question="What's the difference between Subscription Billing and Payment Gateway?"
                  answer="Subscription Billing helps you collect recurring payments from your own customers (like a gym membership). Payment Gateway helps you accept payments in your app or marketplace (like Stripe)."
                />
                <FaqItem 
                  question="Do I need a Paybill or Till number?"
                  answer="Not necessarily! You can start with our shared shortcode immediately. For higher volumes on the Gateway, you can upgrade to your own dedicated M-Pesa shortcode."
                />
                <FaqItem 
                  question="How does the Payment Gateway API work?"
                  answer="Just sign up, get your API keys, and make a simple POST request to our payment endpoint. We'll send an STK push to your customer's phone and notify you via webhook when payment is complete."
                />
                <FaqItem 
                  question="Can I use both services?"
                  answer="Yes! Many businesses use both. For example, you can use Subscription Billing for your own service fees and Payment Gateway to pay your vendors or sellers."
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;