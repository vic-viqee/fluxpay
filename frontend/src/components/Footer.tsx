import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-bg text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="#features" className="hover:text-main">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-main">Pricing</Link></li>
              <li><Link to="/documentation" className="hover:text-main">API</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-main">About</a></li>
              <li><a href="#" className="hover:text-main">Blog</a></li>
              <li><a href="#" className="hover:text-main">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/documentation" className="hover:text-main">Documentation</Link></li>
              <li><a href="#" className="hover:text-main">Guides</a></li>
              <li><Link to="/documentation" className="hover:text-main">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-main">Privacy</a></li>
              <li><a href="#" className="hover:text-main">Terms</a></li>
              <li><a href="#" className="hover:text-main">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-surface-bg pt-8 flex flex-col md:flex-row items-center justify-between">
          <Link to="/" className="flex items-center mb-4 md:mb-0">
            <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="h-8" />
          </Link>
          <p className="text-gray-400">© 2026 FluxPay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
