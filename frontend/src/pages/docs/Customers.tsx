import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';

const Customers: React.FC = () => {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Customers</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Customers</h1>
        <p className="text-xl text-gray-600">
          Manage your customer database. Track who pays, their contact info, and payment history.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Customer Management</h2>
            <p className="text-blue-100">
              Automatically track customers who pay you. Add notes, tags, and view their complete payment history.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Manage Customers?</h2>
        <Link
          to="/gateway/customers"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Manage Customers
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/transactions" className="text-gray-600 hover:text-gray-900">← Transactions</Link>
        <Link to="/docs/receipts" className="inline-flex items-center gap-2 text-blue-600">
          Receipts <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Customers;