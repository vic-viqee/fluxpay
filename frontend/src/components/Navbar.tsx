import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-primary-bg border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="h-8 md:h-10" />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-300 hover:text-main transition-colors">Home</Link>
          <a href="/#features" className="text-gray-300 hover:text-main transition-colors">Features</a>
          <Link to="/pricing" className="text-gray-300 hover:text-main transition-colors">Pricing</Link>
          <Link to="/documentation" className="text-gray-300 hover:text-main transition-colors">How it Works</Link>
        </div>
        
        <div className="hidden md:flex space-x-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link to="/signup" className="px-5 py-2 text-sm font-bold text-white bg-main rounded-xl shadow-lg shadow-main/20 hover:bg-blue-600 transition-all active:scale-95">Get Started</Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-bg border-b border-gray-800 px-4 py-6 space-y-4">
          <Link to="/" className="block text-gray-300 hover:text-main" onClick={toggleMobileMenu}>Home</Link>
          <a href="/#features" className="block text-gray-300 hover:text-main" onClick={toggleMobileMenu}>Features</a>
          <Link to="/pricing" className="block text-gray-300 hover:text-main" onClick={toggleMobileMenu}>Pricing</Link>
          <Link to="/documentation" className="block text-gray-300 hover:text-main" onClick={toggleMobileMenu}>How it Works</Link>
          <div className="pt-4 border-t border-gray-800 flex flex-col space-y-4">
            <Link to="/login" className="text-gray-300 hover:text-white" onClick={toggleMobileMenu}>Login</Link>
            <Link to="/signup" className="px-5 py-2 bg-main text-white rounded-xl font-bold text-center" onClick={toggleMobileMenu}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
