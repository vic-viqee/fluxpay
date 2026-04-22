import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, QrCode } from 'lucide-react';

const DynamicTill: React.FC = () => {
  const steps = [
    { title: 'Enter Amount', description: 'Type the payment amount in KES' },
    { title: 'Customer Phone', description: 'Enter customer phone number for STK push' },
    { title: 'Reference', description: 'Add a reference (invoice number, description)' },
    { title: 'Send Request', description: 'Click to send M-Pesa STK push to customer' },
    { title: 'Payment Complete', description: 'Customer enters PIN on phone, payment received' },
  ];

  const benefits = [
    'No internet required for customer',
    'Works with any M-Pesa phone',
    'Instant payment confirmation',
    'No fees for in-person payments',
  ];

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Dynamic Till</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dynamic Till</h1>
        <p className="text-xl text-gray-600">
          Accept M-Pesa payments in-person with a QR code. Perfect for shops, restaurants, and any retail business.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <QrCode size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">How It Works</h2>
            <p className="text-blue-100">
              Enter the amount, show the QR code to your customer, and they pay via M-Pesa. 
              The payment arrives instantly to your M-Pesa account.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">5 Steps to Accept Payment</h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                {index + 1}
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
        <Link
          to="/gateway/till"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Try Dynamic Till
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/getting-started" className="text-gray-600 hover:text-gray-900">← Getting Started</Link>
        <Link to="/docs/payment-links" className="inline-flex items-center gap-2 text-blue-600">
          Payment Links <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default DynamicTill;