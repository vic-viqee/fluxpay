import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SubscriptionCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No plan selected</h1>
          <button onClick={() => navigate('/pricing')} className="mt-4 btn btn-primary">
            Go to Pricing
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = () => {
    // Mock M-Pesa STK Push
    alert(`Initiating M-Pesa payment for ${plan} plan. Check your phone.`);
    // In a real app, you would poll your backend to check for payment confirmation
    // and then redirect to the dashboard.
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">You are subscribing to the <strong>{plan}</strong> plan.</p>
        </div>

        <div className="p-6 border rounded-lg">
            <p className="text-lg font-semibold">Summary:</p>
            <div className="flex justify-between mt-4">
                <span>{plan} Plan (Monthly)</span>
                <span>{plan === 'Starter' ? 'KES 999' : 'KES 2,499'}</span>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>Transaction Fee</span>
                <span>1.5%</span>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex justify-between font-bold text-lg">
                <span>Total Due Today</span>
                <span>{plan === 'Starter' ? 'KES 999' : 'KES 2,499'}</span>
            </div>
        </div>

        <button 
          onClick={handlePayment} 
          className="w-full btn btn-primary"
        >
          Pay with M-Pesa
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
