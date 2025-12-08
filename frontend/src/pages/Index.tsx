import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-indigo-900 opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500 bg-opacity-30 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Now with instant STK Push</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">M-Pesa</span> Payments<br />
            for Kenyan Businesses
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Automate recurring billing, instant checkouts, and payment tracking. 
            No Paybill needed. Built for freelancers, gyms, SaaS, and subscription businesses.
          </p>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link to="/signup" className="btn btn-primary btn-lg flex items-center space-x-2">
              <span>Start Free Today</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <Link to="/documentation" className="btn btn-outline btn-lg">View Documentation</Link>
          </div>
          
          <div className="flex justify-center space-x-8 md:space-x-16 text-left">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">10K+</div>
              <div className="text-gray-400 text-sm">Active Businesses</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">KES 500M+</div>
              <div className="text-gray-400 text-sm">Processed Monthly</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">collect payments</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for Kenyan businesses that need predictable, professional, automated M-Pesa collections.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recurring Billing</h3>
              <p className="text-gray-600">Automatically charge customers weekly, monthly, or on custom schedules using M-Pesa STK Push.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant STK Checkout</h3>
              <p className="text-gray-600">Fast, clean checkout flow for one-time payments with branded confirmation and receipts.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Virtual Till</h3>
              <p className="text-gray-600">No Paybill? No problem. Get a shared virtual Till with auto-reconciliation and branded receipts.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Dashboard</h3>
              <p className="text-gray-600">Track revenue, active subscriptions, overdue payments, customer history, and churn—all in one place.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Reminders</h3>
              <p className="text-gray-600">Friendly, automated payment reminders that feel human. Failed payments retry automatically.</p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Developer API</h3>
              <p className="text-gray-600">Full-featured API with webhooks for SaaS integrations and custom workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Why businesses <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">choose FluxPay</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for Kenyan businesses that need reliable, automated M-Pesa payment collection.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">No Paybill Required</h4>
                    <p className="text-gray-600">Get started immediately with our shared virtual Till. Perfect for freelancers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Automatic Reconciliation</h4>
                    <p className="text-gray-600">Every payment is matched, logged, and categorized automatically.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Smart Retry Logic</h4>
                    <p className="text-gray-600">Failed payments retry automatically with friendly reminders.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">WhatsApp Integration</h4>
                    <p className="text-gray-600">Send receipts and reminders via WhatsApp automatically.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Professional Reports</h4>
                    <p className="text-gray-600">Generate PDF receipts and export reports without accounting knowledge.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-center text-sm text-gray-500 mb-4">Your Business Metrics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">KES 847K</div>
                  <div className="text-gray-600">This Month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">234</div>
                  <div className="text-gray-600">Active Subscriptions</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">98.5%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">12</div>
                  <div className="text-gray-600">Pending Payments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to get started?</h2>
            <p className="text-lg text-indigo-200 mb-8">
              Join thousands of Kenyan businesses already using FluxPay to automate their M-Pesa payments.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/signup" className="btn btn-primary btn-lg flex items-center space-x-2">
                <span>Create Free Account</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/pricing" className="btn btn-outline-white btn-lg">Talk to Sales</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
