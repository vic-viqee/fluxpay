import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-main mb-8">Terms of Service</h1>
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using FluxPay ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              FluxPay provides M-Pesa payment integration and subscription management tools for businesses in Kenya. We facilitate payment processing but are not a bank or a money transmitter.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Obligations</h2>
            <p>
              You agree to provide accurate information during registration and to maintain the security of your account credentials. You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Activities</h2>
            <p>
              You may not use FluxPay for any illegal activities, including but not limited to fraud, money laundering, or the sale of prohibited goods or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Fees and Payments</h2>
            <p>
              Fees for the use of FluxPay are outlined in our pricing plans. By using the Service, you agree to pay all applicable fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              FluxPay shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the Service after changes are posted constitutes your acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
