import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Receipt,
  CheckCircle2,
  ArrowRight,
  Repeat,
  Globe
} from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-primary-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="relative text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-main/20 to-secondary/20 opacity-30"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-main/10 border border-main/20 text-main text-xs font-bold uppercase tracking-wider mb-8">
            <Zap size={14} /> Kenya's Payment Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Two Ways to <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-main">Use FluxPay</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            Whether you need to collect subscriptions from customers or accept payments in your app — FluxPay has you covered.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-main rounded-xl shadow-xl shadow-main/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95">
              Get Started Free
              <ArrowRight size={20} />
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-gray-300 bg-surface-bg border border-gray-800 rounded-xl hover:text-white hover:border-gray-700 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-20 bg-primary-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Subscription Billing */}
            <Link to="/pricing" className="group p-8 rounded-2xl bg-surface-bg border border-gray-800 hover:border-main transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-main/20 rounded-xl">
                  <Repeat className="w-8 h-8 text-main" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Subscription Billing</h3>
                  <p className="text-gray-400">Collect recurring payments</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Automate your customer subscriptions. Perfect for gyms, schools, SaaS businesses, and service providers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Auto-billing
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Payment reminders
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Auto-retry failed payments
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
                <span className="text-gray-400">Starting at</span>
                <span className="text-2xl font-bold text-white">KES 0<span className="text-gray-400 font-normal">/mo</span></span>
              </div>
            </Link>

            {/* Payment Gateway */}
            <Link to="/gateway/signup" className="group p-8 rounded-2xl bg-surface-bg border border-gray-800 hover:border-secondary transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-secondary/20 rounded-xl">
                  <Globe className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Payment Gateway</h3>
                  <p className="text-gray-400">Accept M-Pesa in your app</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                The Stripe for Kenya. Integrate M-Pesa into any marketplace, platform, or application via powerful API.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Simple REST API
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> Webhooks for notifications
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> B2C Disbursements
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
                <span className="text-gray-400">Starting at</span>
                <span className="text-2xl font-bold text-white">KES 0<span className="text-gray-400 font-normal">/mo</span></span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-bg/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-400">
              Everything you need to manage payments in Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<Clock className="text-main" />}
              title="Auto-Billing"
              desc="Set up subscriptions and let FluxPay handle the billing automatically."
            />
            <FeatureCard 
              icon={<Smartphone className="text-secondary" />}
              title="STK Push"
              desc="Instant M-Pesa payments with one tap. No Paybill required."
            />
            <FeatureCard 
              icon={<Receipt className="text-accent" />}
              title="Digital Receipts"
              desc="Professional branded receipts sent to customers automatically."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-main" />}
              title="Revenue Dashboard"
              desc="Track your earnings, subscriptions, and transactions in real-time."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-secondary" />}
              title="Verified Payments"
              desc="Every transaction verified directly with M-Pesa. No fake payments."
            />
            <FeatureCard 
              icon={<Globe className="text-accent" />}
              title="API First"
              desc=" мощный REST API for developers. Integrate in minutes, not days."
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-surface-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white mb-8">Trusted by Kenyan Businesses</h2>
            <div className="flex justify-center items-center gap-8 mb-12">
              <img 
                src="/anything_logo.png" 
                alt="Anything" 
                className="h-16 object-contain filter brightness-0 invert opacity-70"
              />
              <div className="text-gray-400 font-bold text-xl">Your Business Here</div>
              <div className="text-gray-400 font-bold text-xl">Your Business Here</div>
            </div>
            <blockquote className="text-xl italic text-gray-300">
              <p>"Anything runs on FluxPay for all our Kenyan marketplace transactions. The API integration was seamless and our sellers get paid instantly."</p>
            </blockquote>
            <cite className="mt-4 block font-semibold text-white">
              - Anything Marketplace
            </cite>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-main">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Kenyan businesses using FluxPay to manage their payments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="px-10 py-4 text-lg font-bold text-main bg-white rounded-xl shadow-2xl hover:bg-gray-100 transition-all">
              Create Free Account
            </Link>
            <Link to="/pricing" className="px-10 py-4 text-lg font-bold text-white bg-transparent border-2 border-white rounded-xl hover:bg-white/10 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl bg-surface-bg border border-gray-800">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

export default Index;