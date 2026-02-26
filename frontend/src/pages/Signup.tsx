import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const Signup: React.FC = () => {
  const [step, setStep] = useState(1); // New state for multi-step form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [businessTillOrPaybill, setBusinessTillOrPaybill] = useState(''); // New field
  const [businessPhoneNumber, setBusinessPhoneNumber] = useState(''); // New field
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState('M-Pesa STK Push'); // New field
  const [businessDescription, setBusinessDescription] = useState(''); // New field
  const [logoFile, setLogoFile] = useState<File | null>(null); // New field for file upload
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Final validation before submission
    if (!businessName || !businessType || !businessPhoneNumber) {
        setError('Please fill in all required business details.');
        return;
    }
    setError(''); // Clear previous errors

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (plan) formData.append('plan', plan);
      formData.append('businessName', businessName);
      formData.append('businessType', businessType);
      if (kraPin) formData.append('kraPin', kraPin);
      if (businessTillOrPaybill) formData.append('businessTillOrPaybill', businessTillOrPaybill);
      formData.append('businessPhoneNumber', businessPhoneNumber);
      formData.append('preferredPaymentMethod', preferredPaymentMethod);
      if (businessDescription) formData.append('businessDescription', businessDescription);
      if (logoFile) formData.append('logo', logoFile); // 'logo' is the field name for the file

      await api.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during signup.');
    }
  };

  const handleNext = () => {
    // Basic validation for current step before proceeding
    if (step === 1) {
      if (!username || !email || !password) {
        setError('Please fill in all required user details.');
        return;
      }
      // Password strength/email format validation could go here
    } else if (step === 2) {
      if (!businessName || !businessType || !businessPhoneNumber) {
        setError('Please fill in all required business details.');
        return;
      }
      // Business phone number format validation could go here
    }
    setError(''); // Clear previous errors
    setStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setStep(prevStep => prevStep - 1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-bg rounded-lg shadow-md border border-surface-bg">
        <div className="text-center">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="w-32 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400">Start accepting payments today</p>
        </div>

        {error && <div className="p-4 text-sm text-red-400 bg-red-900 bg-opacity-50 rounded-lg border border-red-400">{error}</div>}
        
        {plan && (
          <div className="p-4 text-sm text-secondary bg-teal-900 bg-opacity-50 rounded-lg text-center border border-secondary">
            You've selected the <strong>{plan}</strong> plan.
          </div>
        )}

        <div>
          <a
            href={`https://fluxpay-backend.onrender.com/api/auth/google`}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </a>
        </div>

        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="px-2 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="plan" value={plan || ''} />

          {step === 1 && (
            <>
              {/* User Details Step */}
              <h2 className="text-xl font-bold text-white">Your Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input type="checkbox" className="w-4 h-4 text-main bg-gray-700 border-gray-600 rounded focus:ring-main" required />
                </div>
                <div className="ml-3 text-sm">
                  <label className="text-gray-400">I agree to the <a href="#" className="font-medium text-main hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-main hover:underline">Privacy Policy</a></label>
                </div>
              </div>
              <button type="button" onClick={handleNext} className="w-full px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
                Next: Business Details
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Business Details Step */}
              <h2 className="text-xl font-bold text-white">Business Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-300">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="Your Business Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  required
                >
                  <option value="">Select Business Type</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Limited Company">Limited Company</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Business Phone Number (for STK Push)</label>
                <input
                  type="tel"
                  value={businessPhoneNumber}
                  onChange={(e) => setBusinessPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="+2547XXXXXXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">KRA PIN (Optional)</label>
                <input
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="A123456789B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Business Till / Paybill Number (Optional)</label>
                <input
                  type="text"
                  value={businessTillOrPaybill}
                  onChange={(e) => setBusinessTillOrPaybill(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="e.g., 123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Preferred Payment Method</label>
                <select
                  value={preferredPaymentMethod}
                  onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  required
                >
                  <option value="M-Pesa STK Push">M-Pesa STK Push</option>
                  {/* Add other payment methods if needed */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Short Business Description (Optional)</label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 mt-1 bg-primary-bg border border-gray-600 rounded-md shadow-sm text-white focus:ring-main focus:border-main"
                  placeholder="Describe your business..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Business Logo (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-main file:text-white hover:file:bg-blue-500"
                />
                {logoFile && <p className="text-sm text-gray-400 mt-2">Selected: {logoFile.name}</p>}
                <p className="text-xs text-gray-500 mt-1">Note: Actual logo upload functionality requires backend setup.</p>
              </div>
              <div className="flex justify-between space-x-4">
                <button type="button" onClick={handleBack} className="w-1/2 px-4 py-2 text-sm font-medium text-main bg-transparent border border-main rounded-md shadow-sm hover:bg-main hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
                  Back
                </button>
                <button type="submit" className="w-1/2 px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">
                  Create Account
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-sm text-center text-gray-400">
          Already have an account? <a href="/login" className="font-medium text-main hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
