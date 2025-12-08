import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaqItem from '../components/FaqItem';
import PricingCard from '../components/PricingCard';
import ContactSalesModal from '../components/ContactSalesModal';

const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>('Growth');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: 'KES 0',
      features: ['Up to 10 Customers', 'Instant STK Checkout', 'Basic Analytics'],
      cta: 'Select Plan',
      ariaLabel: 'Select the Free plan'
    },
    {
      name: 'Starter',
      price: 'KES 999',
      features: ['Up to 100 Customers', 'Recurring Subscriptions', 'Automated Reminders', 'Standard Analytics'],
      cta: 'Select Plan',
      ariaLabel: 'Select the Starter plan'
    },
    {
      name: 'Growth',
      price: 'KES 2,499',
      features: ['Up to 1,000 Customers', 'All Starter Features', 'Advanced Analytics', 'WhatsApp Integration'],
      cta: 'Select Plan',
      ariaLabel: 'Select the Growth plan',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited Customers', 'Dedicated Support', 'Custom Integrations', 'Volume-based pricing'],
      cta: 'Contact Sales',
      ariaLabel: 'Contact sales for the Enterprise plan'
    }
  ];

  const handleProceed = () => {
    if (!selectedPlan) return;

    if (selectedPlan === 'Enterprise') {
      setIsModalOpen(true);
    } else if (selectedPlan === 'Free') {
      navigate('/signup', { state: { plan: 'Free' } });
    } else {
      navigate('/subscribe', { state: { plan: selectedPlan } });
    }
  };
  
  const getButtonText = () => {
    if (!selectedPlan) return 'Select a Plan';
    if (selectedPlan === 'Enterprise') return 'Contact Sales';
    if (selectedPlan === 'Free') return 'Start For Free';
    return `Proceed with ${selectedPlan}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ContactSalesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Pricing Header Section */}
      <main className="flex-grow">
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Automate <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">M-Pesa Payments</span> & Subscriptions in Minutes
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              No Paybill. No Till. No Code. Start collecting recurring payments effortlessly.
            </p>
          </div>
        </section>
        
        {/* Pricing Tiers Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Choose the right plan for your business
              </h2>
              <p className="text-lg text-gray-600 mt-4">
                All plans include a 1.5% transaction fee.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {plans.map(plan => (
                <PricingCard 
                  key={plan.name}
                  plan={plan}
                  isSelected={selectedPlan === plan.name}
                  onSelect={setSelectedPlan}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={handleProceed}
                disabled={!selectedPlan}
                className="btn btn-primary btn-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {getButtonText()}
              </button>
            </div>

          </div>
        </section>


        {/* Value Justification Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                More than just payments. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">A full financial toolkit.</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                We handle the complexity so you can focus on growing your business.
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16h5m4 0h.01M4 12a8 8 0 018-8h.01M4 12a8 8 0 008 8h.01M12 20a8 8 0 008-8h-.01M12 20a8 8 0 01-8-8h.01M12 4a8 8 0 018 8h-.01M12 4a8 8 0 00-8 8h.01"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Automated Reconciliation</h3>
                  <p className="text-gray-600 mt-1">Every transaction is automatically tracked and matched. No more manual spreadsheet work.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Instant Branded Receipts</h3>
                  <p className="text-gray-600 mt-1">Send beautiful, professional receipts to your customers instantly via SMS or WhatsApp.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Growth-Friendly</h3>
                  <p className="text-gray-600 mt-1">Our hybrid model means we only make money when you do. Perfect for scaling businesses.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Bank-Grade Security</h3>
                  <p className="text-gray-600 mt-1">All data is encrypted and stored securely. We are fully PCI-DSS compliant.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Trusted by leading Kenyan businesses</h2>
              <div className="mt-12 flex justify-center items-center space-x-8 md:space-x-12">
                <p className="text-gray-400 font-semibold text-lg">LOGO</p>
                <p className="text-gray-400 font-semibold text-lg">LOGO</p>
                <p className="text-gray-400 font-semibold text-lg">LOGO</p>
                <p className="text-gray-400 font-semibold text-lg">LOGO</p>
              </div>
              <div className="mt-12">
                <blockquote className="text-xl italic text-gray-800">
                  <p>"FluxPay has been a game-changer for our gym. We've automated over 90% of our membership collections and drastically reduced churn. The dashboard is a lifesaver."</p>
                </blockquote>
                <cite className="mt-4 block font-semibold text-gray-900">
                  - Jane Doe, Founder of FlexFit Gym
                </cite>
              </div>
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="divide-y divide-gray-200">
                <FaqItem
                  question="Do I need a Paybill or Till number to use FluxPay?"
                  answer="No, you don't! You can get started immediately using our shared virtual till number. This is perfect for freelancers, small businesses, and anyone who wants to start collecting payments without the hassle and cost of applying for their own Paybill."
                />
                <FaqItem
                  question="How is the 1.5% transaction fee applied?"
                  answer="The 1.5% fee is charged on each successful transaction processed through your account. For example, if a customer pays you KES 1,000, the fee would be KES 15, and you would receive KES 985. There are no hidden fees or charges."
                />
                <FaqItem
                  question="Can I switch between plans?"
                  answer="Yes, you can upgrade or downgrade your plan at any time from your account settings. When you upgrade, the changes are applied immediately. When you downgrade, the changes will take effect at the end of your current billing cycle."
                />
                 <FaqItem
                  question="What happens if a subscription payment fails?"
                  answer="FluxPay's Smart Retry system automatically retries failed payments at intelligent intervals. We also send automated, friendly reminders to your customers, helping you recover revenue that might otherwise be lost."
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