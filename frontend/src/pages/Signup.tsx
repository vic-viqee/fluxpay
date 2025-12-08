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
      // For file upload, you would typically use FormData
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

      // Note: Backend /auth/signup needs to be updated to handle formData (multipart/form-data)
      // or receive JSON if logo upload is handled separately. For now, sending as JSON without file.
      // If actual file upload is desired, backend API needs to change to accept `multipart/form-data`.
      await api.post('/auth/signup', { 
        username, 
        email, 
        password, 
        plan,
        businessName,
        businessType,
        kraPin,
        businessTillOrPaybill,
        businessPhoneNumber,
        preferredPaymentMethod,
        businessDescription,
        // logoFile // Cannot send File object directly in JSON
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img src="/img/fluxpay logo.png" alt="FluxPay Logo" className="w-32 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Start accepting payments today</p>
        </div>

        {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        
        {plan && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg text-center">
            You've selected the <strong>{plan}</strong> plan.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="plan" value={plan || ''} />

          {step === 1 && (
            <>
              {/* User Details Step */}
              <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" required />
                </div>
                <div className="ml-3 text-sm">
                  <label className="text-gray-500">I agree to the <a href="#" className="font-medium text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-indigo-600 hover:underline">Privacy Policy</a></label>
                </div>
              </div>
              <button type="button" onClick={handleNext} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Next: Business Details
              </button>
            </>
          )}

          {step === 2 && (
            <>
              {/* Business Details Step */}
              <h2 className="text-xl font-bold text-gray-900">Business Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your Business Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700">Business Phone Number (for STK Push)</label>
                <input
                  type="tel"
                  value={businessPhoneNumber}
                  onChange={(e) => setBusinessPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+2547XXXXXXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">KRA PIN (Optional)</label>
                <input
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="A123456789B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Till / Paybill Number (Optional)</label>
                <input
                  type="text"
                  value={businessTillOrPaybill}
                  onChange={(e) => setBusinessTillOrPaybill(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Payment Method</label>
                <select
                  value={preferredPaymentMethod}
                  onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="M-Pesa STK Push">M-Pesa STK Push</option>
                  {/* Add other payment methods if needed */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Business Description (Optional)</label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your business..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Logo (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {logoFile && <p className="text-sm text-gray-500 mt-2">Selected: {logoFile.name}</p>}
                <p className="text-xs text-gray-500 mt-1">Note: Actual logo upload functionality requires backend setup.</p>
              </div>
              <div className="flex justify-between space-x-4">
                <button type="button" onClick={handleBack} className="w-1/2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md shadow-sm hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Back
                </button>
                <button type="submit" className="w-1/2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Create Account
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account? <a href="/login" className="font-medium text-indigo-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
