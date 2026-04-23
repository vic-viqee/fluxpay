import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MousePointer } from 'lucide-react';

const PaymentButtons: React.FC = () => {
  const features = [
    { title: 'Embed on Any Website', description: 'Copy-paste a button onto WordPress, Wix, Shopify, or any custom site' },
    { title: 'Custom Colors', description: 'Match your brand with custom button colors' },
    { title: 'Click Tracking', description: 'See how many times your button was clicked' },
    { title: 'Payment Analytics', description: 'Track successful payments vs clicks' },
  ];

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Payment Buttons</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Buttons</h1>
        <p className="text-xl text-gray-600">
          Add a "Pay with M-Pesa" button to any website. No coding required.
        </p>
      </section>

      <section className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <MousePointer size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">What Are Payment Buttons?</h2>
            <p className="text-green-100">
              Payment buttons are embeddable HTML code that you paste onto any website. When customers click the button, 
              they enter their phone number and pay via M-Pesa. Perfect for small businesses without developers.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-gray-900">Create a Button</h3>
              <p className="text-gray-600 text-sm">Go to Payment Buttons in your dashboard and create a new button with your preferred text and color.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-gray-900">Copy the Embed Code</h3>
              <p className="text-gray-600 text-sm">Click "Copy Embed Code" to copy the HTML code for your button.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-gray-900">Paste on Your Website</h3>
              <p className="text-gray-600 text-sm">Paste the code into your website's HTML (in the footer, sidebar, or checkout page).</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
            <div>
              <h3 className="font-semibold text-gray-900">Start Getting Paid</h3>
              <p className="text-gray-600 text-sm">Customers can now click your button and pay you via M-Pesa!</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
        <Link
          to="/gateway/payment-buttons"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
        >
          Create Payment Button
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/payment-links" className="text-gray-600 hover:text-gray-900">← Payment Links</Link>
        <Link to="/docs/transactions" className="inline-flex items-center gap-2 text-blue-600">
          Transactions <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default PaymentButtons;