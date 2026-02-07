import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-primary-bg text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-main to-secondary opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">

          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-main">M-Pesa</span> Payments<br />
            for Kenyan Businesses
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Automate recurring billing, instant checkouts, and payment tracking. 
            No Paybill needed. Built for freelancers, gyms, SaaS, and subscription businesses.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link to="/signup" className="px-6 py-3 text-lg font-medium text-white bg-main border border-transparent rounded-md shadow-lg hover:bg-blue-500 transition-colors flex items-center space-x-2">
              <span>Start Free Today</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <Link to="/documentation" className="px-6 py-3 text-lg font-medium text-white bg-transparent border border-white rounded-md shadow-lg hover:bg-white hover:text-primary-bg transition-colors">View Documentation</Link>
          </div>
          
          <div className="flex justify-center space-x-8 md:space-x-16 text-left">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-main">0</div>
              <div className="text-gray-400 text-sm">Active Businesses</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-main">KES 0</div>
              <div className="text-gray-400 text-sm">Processed Monthly</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-main">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-primary-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-main to-accent">collect payments</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built for Kenyan businesses that need predictable, professional, automated M-Pesa collections.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-surface-bg p-8 rounded-lg shadow-md flex flex-col items-center text-center border border-surface-bg">
              <div className="p-3 bg-secondary text-white rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Recurring Billing</h3>
              <p className="text-gray-400">Automatically charge customers weekly, monthly, or on custom schedules using M-Pesa STK Push.</p>
            </div>
            
            <div className="bg-surface-bg p-8 rounded-lg shadow-md flex flex-col items-center text-center border border-surface-bg">
              <div className="p-3 bg-secondary text-white rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant STK Checkout</h3>
              <p className="text-gray-400">Fast, clean checkout flow for one-time payments with branded confirmation and receipts.</p>
            </div>
            
            <div className="bg-surface-bg p-8 rounded-lg shadow-md flex flex-col items-center text-center border border-surface-bg">
              <div className="p-3 bg-secondary text-white rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Virtual Till</h3>
              <p className="text-gray-400">No Paybill? No problem. Get a shared virtual Till with auto-reconciliation and branded receipts.</p>
            </div>
            
            <div className="bg-surface-bg p-8 rounded-lg shadow-md flex flex-col items-center text-center border border-surface-bg">
              <div className="p-3 bg-secondary text-white rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Dashboard</h3>
              <p className="text-gray-400">Track revenue, active subscriptions, overdue payments, customer history, and churn—all in one place.</p>
            </div>
            
            <div className="bg-surface-bg p-8 rounded-lg shadow-md flex flex-col items-center text-center border border-surface-bg">
              <div className="p-3 bg-secondary text-white rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Reminders</h3>
              <p className="text-gray-400">Friendly, automated payment reminders that feel human. Failed payments retry automatically.</p>
            </div>
            
            <div className="bg-surface-bg p-8 rounded-lg shadow-md flex flex-col items-center text-center border border-surface-bg">
              <div className="p-3 bg-secondary text-white rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Developer API</h3>
              <p className="text-gray-400">Full-featured API with webhooks for SaaS integrations and custom workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-surface-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Why businesses <span className="text-transparent bg-clip-text bg-gradient-to-r from-main to-accent">choose FluxPay</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Built specifically for Kenyan businesses that need reliable, automated M-Pesa payment collection.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-secondary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-white">No Paybill Required</h4>
                    <p className="text-gray-400">Get started immediately with our shared virtual Till. Perfect for freelancers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-secondary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Automatic Reconciliation</h4>
                    <p className="text-gray-400">Every payment is matched, logged, and categorized automatically.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-secondary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Smart Retry Logic</h4>
                    <p className="text-gray-400">Failed payments retry automatically with friendly reminders.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-secondary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-white">WhatsApp Integration</h4>
                    <p className="text-gray-400">Send receipts and reminders via WhatsApp automatically.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-secondary flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-white">Professional Reports</h4>
                    <p className="text-gray-400">Generate PDF receipts and export reports without accounting knowledge.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-bg p-8 rounded-lg shadow-md border border-surface-bg">
              <div className="text-center text-sm text-gray-400 mb-4">Your Business Metrics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-main to-secondary">KES 0</div>
                  <div className="text-gray-400">This Month</div>
                </div>
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <div className="text-2xl font-bold text-main">0</div>
                  <div className="text-gray-400">Active Subscriptions</div>
                </div>
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-main to-secondary">98.5%</div>
                  <div className="text-gray-400">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-primary-bg rounded-lg">
                  <div className="text-2xl font-bold text-accent">0</div>
                  <div className="text-gray-400">Pending Payments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-main text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to get started?</h2>
            <p className="text-white opacity-80 mb-8">
              Join thousands of Kenyan businesses already using FluxPay to automate their M-Pesa payments.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/signup" className="px-6 py-3 text-lg font-medium text-white bg-secondary border border-transparent rounded-md shadow-lg hover:bg-teal-500 transition-colors flex items-center space-x-2">
                <span>Create Free Account</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/pricing" className="px-6 py-3 text-lg font-medium text-white bg-transparent border border-white rounded-md shadow-lg hover:bg-white hover:text-main transition-colors">Talk to Sales</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
