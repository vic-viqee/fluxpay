import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon } from 'lucide-react';

const PaymentLinks: React.FC = () => {
  const features = [
    { title: 'Share via WhatsApp', description: 'Send link directly to customer' },
    { title: 'Custom Expiry', description: 'Set when the link expires' },
    { title: 'One-Time Use', description: 'Link works only once' },
    { title: 'Redirect URL', description: 'Send customer to thank you page after payment' },
  ];

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Payment Links</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Links</h1>
        <p className="text-xl text-gray-600">
          Create shareable payment links for remote payments. Perfect for quotes, deposits, and one-time payments.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <LinkIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">What Are Payment Links?</h2>
            <p className="text-blue-100">
              Payment links are URLs that you share with customers. When they open the link and enter their phone number, 
              they can pay you directly via M-Pesa.
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

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
        <Link
          to="/gateway/payment-links"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Create Payment Link
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/dynamic-till" className="text-gray-600 hover:text-gray-900">← Dynamic Till</Link>
        <Link to="/docs/transactions" className="inline-flex items-center gap-2 text-blue-600">
          Transactions <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default PaymentLinks;