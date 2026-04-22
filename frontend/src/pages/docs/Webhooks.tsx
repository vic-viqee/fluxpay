import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Webhook } from 'lucide-react';

const Webhooks: React.FC = () => {
  const events = [
    { event: 'payment.success', description: 'Payment completed successfully' },
    { event: 'payment.failed', description: 'Payment failed or was cancelled' },
    { event: 'payment.pending', description: 'Payment initiated, awaiting confirmation' },
  ];

  const example = `{
  "event": "payment.success",
  "transactionId": "txn_abc123",
  "amount": 1000,
  "phoneNumber": "254700000000",
  "status": "SUCCESS",
  "mpesaReceiptNo": "R5A7X2K1M9",
  "timestamp": "2026-04-22T10:30:00Z"
}`;

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Webhooks</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Webhooks</h1>
        <p className="text-xl text-gray-600">
          Get real-time notifications when payments occur. Integrate with your website or app.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Webhook size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">What Are Webhooks?</h2>
            <p className="text-blue-100">
              Webhooks send an HTTP POST request to your server when a payment event happens. 
              This allows you to update your database, send emails, or trigger any action automatically.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Events</h2>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.event} className="p-4 bg-white border border-gray-200 rounded-xl">
              <code className="text-blue-600">{event.event}</code>
              <p className="text-gray-600 text-sm mt-1">{event.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Example Webhook Payload</h2>
        <div className="bg-gray-900 rounded-xl p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{example}</code>
          </pre>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Set Up Webhooks?</h2>
        <Link
          to="/gateway/webhooks"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Configure Webhooks
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/api-keys" className="text-gray-600 hover:text-gray-900">← API Keys</Link>
        <Link to="/docs/integration" className="inline-flex items-center gap-2 text-blue-600">
          Integration <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Webhooks;