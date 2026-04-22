import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-bg border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="h-8" />
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Empowering Kenyan businesses with smart, automated M-Pesa collections. 
              No Paybill stress, just growth.
            </p>
            <div className="flex space-x-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 bg-surface-bg rounded-lg flex items-center justify-center text-gray-500 hover:text-main transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-1.015-2.178-1.648-3.597-1.648-2.722 0-4.928 2.208-4.928 4.927 0 .387.044.762.127 1.124-4.096-.205-7.728-2.168-10.161-5.152-.425.73-.668 1.58-.668 2.486 0 1.71.87 3.219 2.193 4.099-.807-.026-1.566-.247-2.229-.616v.062c0 2.387 1.698 4.378 3.95 4.858-.413.113-.849.173-1.299.173-.317 0-.626-.03-.927-.086.626 1.956 2.444 3.379 4.599 3.419-1.686 1.322-3.81 2.109-6.115 2.109-.397 0-.79-.023-1.175-.07 2.179 1.397 4.768 2.212 7.548 2.212 9.057 0 14.01-7.503 14.01-14.01 0-.213-.005-.426-.014-.637 1.017-.734 1.898-1.65 2.597-2.695z"/></svg>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/#features" className="hover:text-main">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-main">Pricing</Link></li>
              <li><Link to="/docs" className="hover:text-main">Documentation</Link></li>
              <li><Link to="/docs/getting-started" className="hover:text-main">Getting Started</Link></li>
              <li><Link to="/signup" className="hover:text-main">Get Started</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/docs" className="hover:text-main">Docs</Link></li>
              <li><Link to="/docs/quick-start" className="hover:text-main">Developer API</Link></li>
              <li><a href="#" className="hover:text-main">Contact Sales</a></li>
              <li><a href="#" className="hover:text-main">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-main">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs text-center md:text-left">
            &copy; {new Date().getFullYear()} FluxPay. All rights reserved. Registered in Kenya.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Systems Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
