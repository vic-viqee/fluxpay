import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Key, AlertCircle } from 'lucide-react';

const ApiKeys: React.FC = () => {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">API Keys</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Keys</h1>
        <p className="text-xl text-gray-600">
          Create API keys to integrate FluxPay with your website or application.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Key size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">What Are API Keys?</h2>
            <p className="text-blue-100">
              API keys let your website or application connect to FluxPay programmatically. 
              Each key has two parts: an API Key (public) and an API Secret (private).
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Creating API Keys</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Go to <Link to="/gateway/api-keys" className="text-blue-600">API Keys</Link> in your dashboard</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Click "Create Key" and give it a name</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Copy both the API Key and API Secret</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle size={24} className="text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-2">Keep Your Secrets Safe</h3>
            <p className="text-yellow-700">
              Never share your API Secret publicly or commit it to version control. 
              Store it securely in environment variables on your server.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Get API Keys?</h2>
        <Link
          to="/gateway/api-keys"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Go to API Keys
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/quick-start" className="text-gray-600 hover:text-gray-900">← Quick Start</Link>
        <Link to="/docs/webhooks" className="inline-flex items-center gap-2 text-blue-600">
          Webhooks <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default ApiKeys;