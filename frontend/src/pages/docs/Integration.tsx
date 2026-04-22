import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Globe } from 'lucide-react';

const Integration: React.FC = () => {
  const platforms = [
    { 
      name: 'WordPress', 
      icon: <Globe size={24} />,
      description: 'WooCommerce, Elementor, WPForms, Contact Form 7',
      status: 'Coming Soon'
    },
    { 
      name: 'Shopify', 
      icon: <Globe size={24} />,
      description: 'Connect your Shopify store',
      status: 'Coming Soon'
    },
    { 
      name: 'Custom Website', 
      icon: <Code size={24} />,
      description: 'Any website using HTML, JavaScript, PHP, Python',
      status: 'Available'
    },
  ];

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Integration</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Integration</h1>
        <p className="text-xl text-gray-600">
          Integrate FluxPay with your website, online store, or application.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Code size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Universal API</h2>
            <p className="text-blue-100">
              FluxPay works with any website or application that can make HTTP requests. 
              Use our REST API with any programming language.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platforms</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div key={platform.name} className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                {platform.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{platform.description}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                platform.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {platform.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Integration Steps</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Create a FluxPay account and get API keys</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Set up your webhook URL to receive payment notifications</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Add a payment form to your checkout page</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">4</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Redirect customer to FluxPay for payment, then back to your site</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">5</div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex-1">
              <p className="text-gray-700">Receive webhook notification and fulfill the order</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/docs/quick-start"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Quick Start Guide
          <ArrowRight size={18} />
        </Link>
        <Link
          to="/docs/api"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
        >
          API Reference
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/webhooks" className="text-gray-600 hover:text-gray-900">← Webhooks</Link>
        <Link to="/docs" className="inline-flex items-center gap-2 text-blue-600">
          Docs Home <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Integration;