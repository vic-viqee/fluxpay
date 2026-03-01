import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  CheckCircle2, 
  Smartphone, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Zap 
} from 'lucide-react';

const BusinessGuide: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-primary-bg">
      <Navbar />

      <main className="flex-grow py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-main to-secondary">Success Center</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about automating your M-Pesa collections and growing your Kenyan business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Getting Started */}
            <div className="bg-surface-bg p-8 rounded-2xl border border-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-main/10 rounded-xl flex items-center justify-center text-main mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">1. Setting Up</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-secondary mt-1 flex-shrink-0" />
                  <span>Create your Business Profile in Settings.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-secondary mt-1 flex-shrink-0" />
                  <span>Define your Service Plans (Daily, Weekly, or Monthly).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-secondary mt-1 flex-shrink-0" />
                  <span>Add your first Customer with their M-Pesa number.</span>
                </li>
              </ul>
            </div>

            {/* How Payments Work */}
            <div className="bg-surface-bg p-8 rounded-2xl border border-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">2. Collecting Payments</h3>
              <p className="text-gray-400 mb-4">
                FluxPay uses **STK Push** technology. This means your customers don't have to remember Paybill numbers or account names.
              </p>
              <div className="bg-primary-bg p-4 rounded-xl border border-gray-800 text-sm italic text-gray-500">
                "They simply get a popup on their phone, enter their M-Pesa PIN, and you get paid instantly."
              </div>
            </div>

            {/* Automation */}
            <div className="bg-surface-bg p-8 rounded-2xl border border-gray-800 shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">3. Scaling Up</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-secondary mt-1 flex-shrink-0" />
                  <span>Automated Recurring Billing for long-term clients.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-secondary mt-1 flex-shrink-0" />
                  <span>View revenue analytics to track your growth.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-secondary mt-1 flex-shrink-0" />
                  <span>Automatic PDF receipts sent to every customer.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Practical Tips Section */}
          <div className="bg-gradient-to-br from-surface-bg to-primary-bg rounded-3xl border border-gray-800 p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <ShieldCheck className="text-main" /> Practical Tips for Kenyan Businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <MessageSquare size={18} className="text-secondary" />
                  Clear Communication
                </h4>
                <p className="text-gray-400">
                  Always inform your customers before triggering an STK push. A quick WhatsApp message like 
                  <span className="text-gray-300 font-medium italic"> "Sending your monthly subscription prompt now" </span> 
                  increases success rates by 40%.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp size={18} className="text-accent" />
                  Subscription Retention
                </h4>
                <p className="text-gray-400">
                  Use our **Analytics** to see which customers are falling behind. FluxPay automatically retries failed payments, but a personal follow-up goes a long way.
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

export default BusinessGuide;
