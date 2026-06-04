import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, Download, Search, Filter, Phone, FileText } from 'lucide-react';

const Transactions: React.FC = () => {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/docs" className="hover:text-gray-700">Docs</Link>
          <span>/</span>
          <span className="text-gray-900">Transactions</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Transactions</h1>
        <p className="text-xl text-gray-600">
          View, filter, and export all your payment transactions.
        </p>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Transaction History</h2>
            <p className="text-blue-100">
              Every payment you receive is recorded in your transaction history.
              Filter by date, status, or customer, and export to CSV for accounting.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <Search size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Search</h3>
            <p className="text-gray-600 text-sm">Find by phone number, M-Pesa receipt, account reference, or customer name</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <Filter size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Filter</h3>
            <p className="text-gray-600 text-sm">Filter by date range, status (success/pending/failed), or amount</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <Download size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Export</h3>
            <p className="text-gray-600 text-sm">Download transactions as CSV for accounting or reports</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <Phone size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
            <p className="text-gray-600 text-sm">Each transaction records the payer's phone number automatically</p>
          </div>
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <FileText size={24} className="text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Account Reference</h3>
            <p className="text-gray-600 text-sm">Attach an invoice or order number for easy reconciliation</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Transaction Fields</h2>
        <p className="text-gray-600 mb-4">Each transaction includes these key fields:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">Field</th>
                <th className="text-left p-3 font-semibold text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="p-3 font-mono">phoneNumber</td><td className="p-3 text-gray-600">Payer's M-Pesa phone number</td></tr>
              <tr><td className="p-3 font-mono">accountReference</td><td className="p-3 text-gray-600">Invoice/order reference (optional)</td></tr>
              <tr><td className="p-3 font-mono">checkoutRequestId</td><td className="p-3 text-gray-600">M-Pesa CheckoutRequestID for tracing</td></tr>
              <tr><td className="p-3 font-mono">amountKes</td><td className="p-3 text-gray-600">Transaction amount in KES</td></tr>
              <tr><td className="p-3 font-mono">mpesaReceiptNo</td><td className="p-3 text-gray-600">M-Pesa confirmation receipt number</td></tr>
              <tr><td className="p-3 font-mono">status</td><td className="p-3 text-gray-600">SUCCESS, PENDING, or FAILED</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to View Transactions?</h2>
        <Link
          to="/gateway/transactions"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          View Transactions
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="flex justify-between pt-8 border-t border-gray-200">
        <Link to="/docs/payment-links" className="text-gray-600 hover:text-gray-900">← Payment Links</Link>
        <Link to="/docs/customers" className="inline-flex items-center gap-2 text-blue-600">
          Customers <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Transactions;