import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

const ApiReference: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const baseUrl = 'https://api.fluxpay.com';

  const endpoints = [
    {
      category: 'Authentication',
      items: [
        {
          method: 'POST',
          endpoint: '/auth/login',
          description: 'Authenticate user and get JWT token',
          params: ['email', 'password'],
          response: '{ token, user }',
          auth: 'none',
        },
        {
          method: 'POST',
          endpoint: '/auth/signup',
          description: 'Create new gateway account',
          params: ['email', 'password', 'businessName', 'businessPhoneNumber'],
          response: '{ token, user }',
          auth: 'none',
        },
      ]
    },
    {
      category: 'Gateway Payments (JWT Auth)',
      items: [
        {
          method: 'POST',
          endpoint: '/payments/initiate',
          description: 'Initiate a new STK Push payment',
          params: ['phoneNumber', 'amount', 'accountReference', 'transactionDesc'],
          response: '{ checkoutRequestId, status }',
          auth: 'Bearer',
        },
        {
          method: 'GET',
          endpoint: '/payments/:checkoutRequestId',
          description: 'Check payment status',
          params: ['checkoutRequestId'],
          response: '{ status, amount, mpesaReceiptNo }',
          auth: 'Bearer',
        },
      ]
    },
    {
      category: 'Third-Party API Payments (API Key Auth)',
      items: [
        {
          method: 'POST',
          endpoint: '/v1/payments',
          description: 'Initiate payment via API key (for external clients)',
          params: ['phoneNumber', 'amount', 'accountReference', 'transactionDesc'],
          response: '{ transactionId, status }',
          auth: 'API Key',
        },
        {
          method: 'GET',
          endpoint: '/v1/transactions',
          description: 'List transactions via API key',
          params: ['page', 'limit', 'status'],
          response: '{ data, total }',
          auth: 'API Key',
        },
        {
          method: 'GET',
          endpoint: '/v1/transactions/:id',
          description: 'Get transaction details via API key',
          params: ['id'],
          response: '{ transaction object }',
          auth: 'API Key',
        },
        {
          method: 'GET',
          endpoint: '/v1/webhooks',
          description: 'List webhooks (API key auth)',
          params: [],
          response: '{ data }',
          auth: 'API Key',
        },
      ]
    },
    {
      category: 'Webhook Management (JWT Auth)',
      items: [
        {
          method: 'GET',
          endpoint: '/gateway/webhooks',
          description: 'List all webhooks',
          params: [],
          response: '{ data }',
          auth: 'Bearer',
        },
        {
          method: 'POST',
          endpoint: '/gateway/webhooks',
          description: 'Create a new webhook',
          params: ['url', 'name', 'events'],
          response: '{ secret, id }',
          auth: 'Bearer',
        },
        {
          method: 'PATCH',
          endpoint: '/gateway/webhooks/:id',
          description: 'Update webhook URL, events, or active status',
          params: ['url', 'events', 'isActive'],
          response: '{ success }',
          auth: 'Bearer',
        },
        {
          method: 'DELETE',
          endpoint: '/gateway/webhooks/:id',
          description: 'Delete a webhook',
          params: ['id'],
          response: '{ success }',
          auth: 'Bearer',
        },
        {
          method: 'POST',
          endpoint: '/gateway/webhooks/:id/test',
          description: 'Send a test ping to verify webhook endpoint',
          params: ['id'],
          response: '{ status, statusCode }',
          auth: 'Bearer',
        },
        {
          method: 'POST',
          endpoint: '/gateway/webhooks/:id/rotate-secret',
          description: 'Rotate webhook signing secret',
          params: ['id'],
          response: '{ newSecret }',
          auth: 'Bearer',
        },
      ]
    },
    {
      category: 'Payment Links',
      items: [
        {
          method: 'POST',
          endpoint: '/payment-links',
          description: 'Create a payment link',
          params: ['title', 'amount', 'expiresAt'],
          response: '{ paymentLink, id }',
          auth: 'Bearer',
        },
        {
          method: 'GET',
          endpoint: '/payment-links',
          description: 'List all payment links',
          params: ['page', 'limit'],
          response: '{ data, total }',
          auth: 'Bearer',
        },
        {
          method: 'DELETE',
          endpoint: '/payment-links/:id',
          description: 'Delete a payment link',
          params: ['id'],
          response: '{ success }',
          auth: 'Bearer',
        },
      ]
    },
    {
      category: 'Transactions',
      items: [
        {
          method: 'GET',
          endpoint: '/transactions',
          description: 'List all transactions',
          params: ['page', 'limit', 'status', 'startDate', 'endDate', 'search'],
          response: '{ data, page, total }',
          auth: 'Bearer',
        },
        {
          method: 'GET',
          endpoint: '/transactions/:id',
          description: 'Get transaction details',
          params: ['id'],
          response: '{ transaction object }',
          auth: 'Bearer',
        },
      ]
    },
    {
      category: 'Customers',
      items: [
        {
          method: 'GET',
          endpoint: '/customers',
          description: 'List all customers',
          params: ['page', 'limit', 'search'],
          response: '{ data, total }',
          auth: 'Bearer',
        },
        {
          method: 'POST',
          endpoint: '/customers',
          description: 'Create a customer',
          params: ['name', 'phoneNumber', 'email'],
          response: '{ customer object }',
          auth: 'Bearer',
        },
        {
          method: 'PUT',
          endpoint: '/customers/:id',
          description: 'Update a customer',
          params: ['id', 'name', 'email', 'notes'],
          response: '{ customer object }',
          auth: 'Bearer',
        },
      ]
    },
  ];

  const copyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(`${baseUrl}${endpoint}`);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-700';
      case 'POST': return 'bg-blue-100 text-blue-700';
      case 'PUT': return 'bg-yellow-100 text-yellow-700';
      case 'PATCH': return 'bg-purple-100 text-purple-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">API Reference</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          API Reference
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Complete reference for all FluxPay API endpoints.
        </p>
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Base URL:</strong> <code className="bg-white px-2 py-1 rounded">{baseUrl}</code>
          </p>
        </div>
      </section>

      {/* Authentication */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Authentication</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Required</span>
        </div>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">JWT Auth (Dashboard & Merchant API)</h3>
            <p className="text-sm text-blue-700 mb-2">
              Used by the dashboard and all gateway endpoints. Obtain a token via <code className="bg-white px-1 rounded">/auth/login</code>.
            </p>
            <div className="font-mono text-sm bg-white rounded p-2 text-gray-700">
              Authorization: Bearer &#123;jwt_token&#125;
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">API Key Auth (Third-Party API)</h3>
            <p className="text-sm text-yellow-700 mb-2">
              Used by external clients integrating via the <code className="bg-white px-1 rounded">/api/v1/*</code> endpoints.
              Generate keys from the dashboard.
            </p>
            <div className="font-mono text-sm bg-white rounded p-2 text-gray-700">
              X-API-Key: your_api_key<br />
              X-API-Secret: your_api_secret
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      {endpoints.map((category) => (
        <section key={category.category}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h2>
          <div className="space-y-4">
            {category.items.map((endpoint) => (
              <div key={endpoint.endpoint} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded font-mono text-sm font-bold ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-gray-900">{endpoint.endpoint}</code>
                    <button
                      onClick={() => copyEndpoint(endpoint.endpoint)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {copiedEndpoint === endpoint.endpoint ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-gray-400" />
                      )}
                    </button>
                    <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${
                      endpoint.auth === 'none' ? 'bg-gray-100 text-gray-500'
                      : endpoint.auth === 'Bearer' ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {endpoint.auth === 'none' ? 'No Auth' : endpoint.auth}
                    </span>
                  </div>
                  <p className="text-gray-600">{endpoint.description}</p>
                </div>
                <div className="p-4 bg-gray-50 grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-2">Parameters</p>
                    <div className="space-y-1">
                      {endpoint.params.map((param) => (
                        <div key={param} className="font-mono text-gray-700">{param}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-2">Response</p>
                    <code className="text-gray-700">{endpoint.response}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Error Codes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Error Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Code</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-4 font-mono text-gray-700">400</td>
                <td className="p-4 text-gray-600">Bad Request - Invalid parameters</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-gray-700">401</td>
                <td className="p-4 text-gray-600">Unauthorized - Invalid or expired token</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-gray-700">403</td>
                <td className="p-4 text-gray-600">Forbidden - Insufficient permissions</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-gray-700">404</td>
                <td className="p-4 text-gray-600">Not Found - Resource doesn't exist</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-gray-700">500</td>
                <td className="p-4 text-gray-600">Server Error - Try again later</td>
              </tr>
            </tbody>
          </table>
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
          to="/docs/api-keys"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Next: API Keys
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default ApiReference;