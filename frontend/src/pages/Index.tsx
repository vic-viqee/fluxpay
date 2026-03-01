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
  ArrowRight
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
            <Zap size={14} /> Built for Kenyan Entrepreneurs
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Stop Chasing <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-main">M-Pesa</span> Payments.<br />
            Start Automating Them.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            FluxPay helps you collect recurring payments, track business revenue, and send automated receipts. 
            No more Paybill stress. Perfect for gyms, property managers, and schools.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-main rounded-xl shadow-xl shadow-main/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95">
              Get Started for Free
              <ArrowRight size={20} />
            </Link>
            <Link to="/documentation" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-gray-300 bg-surface-bg border border-gray-800 rounded-xl hover:text-white hover:border-gray-700 transition-all">
              How it Works
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-left border-t border-gray-800 pt-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-gray-400 font-medium">99.9% Success Rate</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-main/10 rounded-lg text-main">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-gray-400 font-medium">No Paybill Needed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <CheckCircle2 size={20} />
              </div>
              <span className="text-gray-400 font-medium">Instant Settlements</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-primary-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-main to-secondary">cashflow</span> with ease
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Professional tools designed to make your business look good and run smoothly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="text-main" />}
              title="Automated Subscriptions"
              desc="Set it and forget it. We'll prompt your customers automatically when their payment is due."
            />
            <FeatureCard 
              icon={<Smartphone className="text-secondary" />}
              title="One-Tap STK Push"
              desc="No more manual Paybill typing. Customers pay by simply entering their PIN on a popup."
            />
            <FeatureCard 
              icon={<Receipt className="text-accent" />}
              title="Branded Receipts"
              desc="Every successful payment automatically generates a professional PDF receipt for your client."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-main" />}
              title="Revenue Tracking"
              desc="See exactly how much you've made today, this month, and this year at a single glance."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-secondary" />}
              title="Verified Transactions"
              desc="Every payment is verified directly with M-Pesa. No more 'fake' text messages."
            />
            <FeatureCard 
              icon={<Zap className="text-accent" />}
              title="Fast Setup"
              desc="Create your account, add your plans, and start collecting payments in less than 5 minutes."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-surface-bg/50 border-y border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Why Kenyan businesses <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-main">trust FluxPay</span>
              </h2>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">
                We've built FluxPay to solve the specific problems Kenyan entrepreneurs face every day.
              </p>
              
              <div className="space-y-8">
                <BenefitItem 
                  title="Professional Image"
                  desc="Give your customers a world-class checkout experience that rivals major tech companies."
                />
                <BenefitItem 
                  title="End-to-End Control"
                  desc="From client registration to final payment, manage everything from one simple dashboard."
                />
                <BenefitItem 
                  title="Smart Follow-ups"
                  desc="We help you track who hasn't paid yet so you can follow up without the awkwardness."
                />
              </div>
            </div>
            
            <div className="bg-primary-bg p-8 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-main opacity-10 blur-[100px]"></div>
              <div className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Business Insights Preview</div>
              <div className="grid grid-cols-2 gap-6">
                <StatPreview label="This Month" value="KES 45,200" color="text-secondary" />
                <StatPreview label="Active Clients" value="12" color="text-main" />
                <StatPreview label="Success Rate" value="98.5%" color="text-secondary" />
                <StatPreview label="Pending" value="2" color="text-accent" />
              </div>
              <div className="mt-10 pt-8 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">Recent Payment</span>
                  <span className="text-xs text-secondary font-bold">SUCCESS</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-bg rounded-lg flex items-center justify-center text-main">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">James Kamau</p>
                    <p className="text-[10px] text-gray-500">Premium Fitness Plan • 2 mins ago</p>
                  </div>
                  <div className="ml-auto font-bold text-white">KES 2,500</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-main relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to focus on your business?</h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join dozens of Kenyan entrepreneurs who have recovered 20+ hours every month by automating their payments.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="px-10 py-4 text-lg font-bold text-main bg-white rounded-xl shadow-2xl hover:bg-gray-100 transition-all active:scale-95">
                Create My Account
              </Link>
              <Link to="/pricing" className="px-10 py-4 text-lg font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all border border-blue-400">
                Check Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-surface-bg p-8 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group">
    <div className="w-12 h-12 bg-primary-bg rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const BenefitItem: React.FC<{ title: string, desc: string }> = ({ title, desc }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 p-1 bg-secondary/20 rounded-full text-secondary">
      <CheckCircle2 size={18} />
    </div>
    <div>
      <h4 className="text-xl font-bold text-white mb-1 tracking-tight">{title}</h4>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const StatPreview: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="text-center p-5 bg-surface-bg rounded-2xl border border-gray-800">
    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-xl font-extrabold ${color} tracking-tight`}>{value}</p>
  </div>
);

export default Index;
