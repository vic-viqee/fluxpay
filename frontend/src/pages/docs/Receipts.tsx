import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';

const Receipts: React.FC = () => {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Receipts</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Receipts</h1>
        <p className="text-xl text-gray-600">
          Generate and print payment receipts for your customers.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Receipt size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Payment Receipts</h2>
            <p className="text-blue-100">
              Every successful payment generates a receipt with the M-Pesa receipt number. 
              Print or share receipts with your customers.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to View Receipts?</h2>
        <Link
          to="/gateway/receipts"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          View Receipts
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/customers" className="text-gray-600 hover:text-gray-900">← Customers</Link>
        <Link to="/docs/api-keys" className="inline-flex items-center gap-2 text-blue-600">
          API Keys <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Receipts;