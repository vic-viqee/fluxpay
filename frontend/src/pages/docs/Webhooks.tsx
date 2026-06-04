import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Webhook, Shield, Bell } from 'lucide-react';

const Webhooks: React.FC = () => {
  const events = [
    { event: 'payment.success', description: 'Payment completed successfully' },
    { event: 'payment.failed', description: 'Payment failed or was cancelled' },
    { event: 'payment.pending', description: 'Payment initiated, awaiting confirmation' },
    { event: 'payment.cancelled', description: 'Payment was cancelled by user or timeout' },
  ];

  const signatureCode = `// Verify webhook signature (Node.js)
import crypto from 'crypto';

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

app.post('/webhook/fluxpay', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  if (!verifySignature(req.body, signature, 'whsec_...')) {
    return res.status(401).send('Invalid signature');
  }
  // Process webhook...
  res.status(200).send('OK');
});`;

  const payloadExample = `{
  "event": "payment.success",
  "transactionId": "txn_abc123",
  "amount": 1000,
  "currency": "KES",
  "phoneNumber": "254700000000",
  "accountReference": "Invoice #123",
  "mpesaReceiptNo": "R5A7X2K1M9",
  "checkoutRequestId": "ws_CO_22042026_123456789",
  "status": "SUCCESS",
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
          Receive real-time payment notifications. Webhooks fire for every transaction — 
          not just subscriptions.
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
              Every M-Pesa callback fires a webhook — whether it's a one-time payment or a subscription renewal.
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
            <code>{payloadExample}</code>
          </pre>
        </div>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p><strong>Headers included:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code>X-Webhook-Signature</code> — HMAC-SHA256 signature of the payload</li>
            <li><code>X-Webhook-Event</code> — The event type (e.g. <code>payment.success</code>)</li>
            <li><code>Content-Type</code> — <code>application/json</code></li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Signature Verification</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Shield size={24} className="text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Always Verify Signatures</h3>
              <p className="text-yellow-700">
                Every webhook includes an HMAC-SHA256 signature. Verify it before processing 
                to ensure the payload came from FluxPay and wasn't tampered with.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{signatureCode}</code>
          </pre>
        </div>
      </section>

      <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Bell size={24} className="text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Manage Webhooks in Dashboard</h3>
            <p className="text-blue-700">
              Configure webhooks directly from your dashboard — create, enable/disable, 
              test with a ping, or rotate secrets. Each merchant gets a unique signing secret 
              per webhook.
            </p>
          </div>
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