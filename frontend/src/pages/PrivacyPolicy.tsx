import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-main mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-gray-300">
          <p className="text-lg">
            At FluxPay, your privacy is a top priority. This Privacy Policy describes how we collect, use, and protect your personal information.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide to us directly when you create an account, such as your name, email address, business details, and payment information. We also collect transaction data when you use our Service to process payments.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>To provide, maintain, and improve our Service.</li>
              <li>To process payments and subscriptions.</li>
              <li>To communicate with you about your account and the Service.</li>
              <li>To comply with legal obligations and prevent fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share your data with service providers (e.g., payment processors like Safaricom) and legal authorities if required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Choices</h2>
            <p>
              You can access and update your account information through the Settings page. You may also request the deletion of your account, subject to legal and contractual obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at privacy@fluxpay.com.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
