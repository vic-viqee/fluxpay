import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('nodejs');

  const codeBlocks: { [key: string]: string } = {
    nodejs: `// Install: npm install @fluxpay/sdk
import { FluxPay } from '@fluxpay/sdk';

const fluxpay = new FluxPay({
  apiKey: process.env.FLUXPAY_SECRET_KEY,
  environment: 'production' // or 'sandbox'
});

// Initiate STK push payment
const stkResponse = await fluxpay.transactions.initiateStkPush({
  phone: '+254712345678',
  amount: 1000,
  accountReference: 'ORDER-001',
  transactionDesc: 'Payment for order #001'
});

console.log('STK push initiated:', stkResponse.transactionId);

// Or create a payment link
const paymentLink = await fluxpay.paymentLinks.create({
  title: 'Order #001',
  amount: 1000,
  currency: 'KES'
});

console.log('Payment link:', paymentLink.url);`,
    python: `# Install: pip install fluxpay-sdk
from fluxpay import FluxPay

fluxpay = FluxPay(
    api_key=os.environ.get('FLUXPAY_SECRET_KEY'),
    environment='production'  # or 'sandbox'
)

# Initiate STK push payment
stk_response = fluxpay.transactions.initiate_stk_push(
    phone='+254712345678',
    amount=1000,
    account_reference='ORDER-001',
    transaction_desc='Payment for order #001'
)

print(f'STK push initiated: {stk_response.transaction_id}')

# Or create a payment link
payment_link = fluxpay.payment_links.create(
    title='Order #001',
    amount=1000,
    currency='KES'
)

print(f'Payment link: {payment_link.url}')`,
    php: `<?php
// Install: composer require fluxpay/sdk
require_once('vendor/autoload.php');

use FluxPay\\FluxPay;

$fluxpay = new FluxPay([
    'apiKey' => getenv('FLUXPAY_SECRET_KEY'),
    'environment' => 'production' // or 'sandbox'
]);

// Initiate STK push payment
$stkResponse = $fluxpay->transactions->initiateStkPush([
    'phone' => '+254712345678',
    'amount' => 1000,
    'accountReference' => 'ORDER-001',
    'transactionDesc' => 'Payment for order #001'
]);

echo 'STK push initiated: ' . $stkResponse->transactionId;

// Or create a payment link
$paymentLink = $fluxpay->paymentLinks->create([
    'title' => 'Order #001',
    'amount' => 1000,
    'currency' => 'KES'
]);

echo 'Payment link: ' . $paymentLink->url;`,
    react: `// Install: npm install @fluxpay/react
import { FluxPayButton, useFluxPay } from '@fluxpay/react';

function CheckoutPage() {
  const { initiateStkPush } = useFluxPay({
    apiKey: process.env.REACT_APP_FLUXPAY_PUBLIC_KEY
  });

  const handlePayment = async () => {
    const result = await initiateStkPush({
      phone: '+254712345678',
      amount: 1000,
      accountReference: 'ORDER-001'
    });
    
    console.log('Payment initiated:', result);
  };

  return (
    <FluxPayButton
      amount={1000}
      onSuccess={(data) => console.log('Success:', data)}
      onError={(error) => console.error('Error:', error)}
    >
      Pay with M-Pesa
    </FluxPayButton>
  );
}`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-20 bg-primary-bg">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Developer <span className="text-transparent bg-clip-text bg-gradient-to-r from-main to-secondary">Documentation</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to integrate FluxPay into your application
            </p>
          </div>

          {/* Quick Start */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Quick Start</h2>
            
            <div className="flex border-b border-surface-bg mb-8">
              {['nodejs', 'python', 'php', 'react'].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-4 -mb-px border-b-2 text-lg font-medium focus:outline-none ${
                    activeTab === tab
                      ? 'border-main text-main'
                      : 'border-transparent text-gray-400 hover:text-secondary hover:border-secondary'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-surface-bg rounded-lg overflow-hidden border border-surface-bg">
              <pre className="p-4 text-gray-300 text-sm overflow-x-auto">
                <code>{codeBlocks[activeTab]}</code>
              </pre>
            </div>
          </div>

          {/* API Reference */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">API Reference</h2>
            
            <div className="space-y-8">
              <div className="bg-surface-bg p-8 rounded-lg shadow-md border border-surface-bg">
                <h3 className="text-xl font-semibold text-white mb-4">Authentication</h3>
                <p className="text-gray-400 mb-4">
                  All API requests require authentication using your secret API key in the Authorization header:
                </p>
                <div className="bg-primary-bg p-4 rounded-md overflow-x-auto text-gray-300">
                  <code>Authorization: Bearer YOUR_SECRET_KEY</code>
                </div>
              </div>

              <div className="bg-surface-bg p-8 rounded-lg shadow-md border border-surface-bg">
                <h3 className="text-xl font-semibold text-white mb-4">Webhooks</h3>
                <p className="text-gray-400 mb-4">
                  FluxPay sends webhook notifications for payment events. Configure your webhook URL in the dashboard.
                </p>
                <div className="bg-primary-bg p-4 rounded-md overflow-x-auto">
                  <pre><code className="text-gray-300">{`{
  "event": "payment.success",
  "transactionId": "TXN123456789",
  "amount": 1000,
  "phone": "+254712345678",
  "accountReference": "ORDER-001",
  "timestamp": "2025-01-15T10:30:00Z"
}`}</code></pre>
                </div>
              </div>

              <div className="bg-surface-bg p-8 rounded-lg shadow-md border border-surface-bg">
                <h3 className="text-xl font-semibold text-white mb-4">Sandbox Testing</h3>
                <p className="text-gray-400">
                  Use our sandbox environment for testing. Test phone number: <code className="bg-primary-bg p-1 rounded-md text-sm text-gray-300">+254700000000</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;
