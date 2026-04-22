import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Key, 
  Webhook, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const QuickStart: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Get Your API Keys',
      description: 'Sign up and get your API key and secret from the dashboard.',
    },
    {
      number: 2,
      title: 'Set Up Webhooks',
      description: 'Configure your webhook URL to receive payment notifications.',
    },
    {
      number: 3,
      title: 'Integrate',
      description: 'Add the payment form to your website.',
    },
    {
      number: 4,
      title: 'Test',
      description: 'Test with your M-Pesa number, then go live.',
    },
  ];

  const codeExample = `// Example: Initiate a payment
const response = await fetch('https://api.fluxpay.com/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key',
    'X-API-Secret': 'your_api_secret'
  },
  body: JSON.stringify({
    phoneNumber: '254700000000',
    amount: 1000,
    accountReference: 'Invoice #123',
    transactionDesc: 'Payment for order'
  })
});

const data = await response.json();
console.log(data.checkoutRequestId);`;

  const webhookExample = `// Example: Webhook handler (Node.js)
app.post('/webhook/fluxpay', (req, res) => {
  const event = req.body.event;
  
  if (event === 'payment.success') {
    const { transactionId, amount, phoneNumber } = req.body;
    // Update your database
    updateOrderStatus(transactionId, 'paid');
  }
  
  res.status(200).send('OK');
});`;

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Quick Start</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Quick Start for Developers
        </h1>
        <p className="text-xl text-gray-600">
          Integrate FluxPay into your website or app in 10 minutes.
        </p>
      </section>

      {/* Overview */}
      <section>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Code size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">REST API</h2>
              <p className="text-blue-100 mb-4">
                FluxPay provides a REST API that you can integrate into any 
                website or application. Accept M-Pesa payments directly on your site.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/docs/api"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  View Full API Reference
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">4 Steps to Integrate</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mb-4">
                {step.number}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prerequisites */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What You Need</h2>
        <ul className="space-y-3">
          {[
            'FluxPay account (free)',
            'API Keys from the dashboard',
            'Server endpoint for webhooks',
            'M-Pesa number for testing'
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Code Examples */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Initiate a Payment</h3>
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{codeExample}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Handle Webhooks</h3>
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm text-gray-300">
                <code>{webhookExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* More Info */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Learn More</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/docs/api-keys"
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Key size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">API Keys</h3>
            <p className="text-gray-600 text-sm">Learn how to create and manage API keys.</p>
          </Link>
          <Link
            to="/docs/webhooks"
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Webhook size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Webhooks</h3>
            <p className="text-gray-600 text-sm">Set up real-time payment notifications.</p>
          </Link>
          <Link
            to="/docs/api"
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <Code size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">API Reference</h3>
            <p className="text-gray-600 text-sm">View all endpoints and parameters.</p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
        <p className="text-gray-600 mb-6">
          Create a free account and get your API keys to start integrating.
        </p>
        <Link
          to="/gateway/signup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Get API Keys
          <ArrowRight size={18} />
        </Link>
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
          to="/docs/api"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next: API Reference
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default QuickStart;