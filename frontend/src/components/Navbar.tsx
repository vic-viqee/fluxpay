import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="h-10" />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="#features" className="text-gray-600 hover:text-indigo-600">Features</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-indigo-600">Pricing</Link>
          <Link to="/documentation" className="text-gray-600 hover:text-indigo-600">API Docs</Link>
        </div>
        
        <div className="hidden md:flex space-x-4">
          <Link to="/login" className="btn btn-ghost">Sign In</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      <div className={"md:hidden " + (isMobileMenuOpen ? 'block' : 'hidden') + " transition-all duration-300 ease-in-out"}
           style={{ maxHeight: isMobileMenuOpen ? '200px' : '0', overflow: 'hidden' }}>
        <div className="flex flex-col space-y-2 px-4 pt-2 pb-4 border-t border-gray-200">
          <Link to="#features" className="block text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>Features</Link>
          <Link to="/pricing" className="block text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>Pricing</Link>
          <Link to="/documentation" className="block text-gray-600 hover:text-indigo-600" onClick={toggleMobileMenu}>API Docs</Link>
          <Link to="/login" className="block btn btn-ghost mt-2" onClick={toggleMobileMenu}>Sign In</Link>
          <Link to="/signup" className="block btn btn-primary mt-2" onClick={toggleMobileMenu}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
