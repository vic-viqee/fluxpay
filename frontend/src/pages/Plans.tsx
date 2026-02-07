import React, { useState } from 'react';
import { createServicePlan } from '../services/api';

const Plans: React.FC = () => {
  const [name, setName] = useState('');
  const [amountKes, setAmountKes] = useState<number | string>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'annually'>('monthly');
  const [billingDay, setBillingDay] = useState<number | string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!name || !amountKes || !frequency || !billingDay) {
      setMessage({ text: 'All fields are required.', type: 'error' });
      return;
    }

    if (Number(amountKes) <= 0) {
      setMessage({ text: 'Amount must be greater than 0.', type: 'error' });
      return;
    }

    if (Number(billingDay) < 1 || Number(billingDay) > 31) {
      setMessage({ text: 'Billing day must be between 1 and 31.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await createServicePlan({
        name,
        amountKes: Number(amountKes),
        frequency,
        billingDay: Number(billingDay),
      });
      setMessage({ text: 'Service plan created successfully!', type: 'success' });
      // Clear form
      setName('');
      setAmountKes('');
      setFrequency('monthly');
      setBillingDay('');
    } catch (error: any) {
      console.error('Error creating service plan:', error);
      setMessage({ text: error.response?.data?.message || 'Failed to create service plan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg p-6">
      <div className="max-w-md mx-auto bg-surface-bg rounded-lg shadow-md p-8 border border-surface-bg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create New Service Plan</h1>

        {message.text && (
          <div className={`p-3 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-900 text-red-400 border border-red-400' : 'bg-secondary bg-opacity-20 text-secondary border border-secondary'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Service Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="amountKes" className="block text-sm font-medium text-gray-300">Amount (KES)</label>
            <input
              type="number"
              id="amountKes"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={amountKes}
              onChange={(e) => setAmountKes(e.target.value)}
              min="1"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-300">Frequency</label>
            <select
              id="frequency"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'annually')}
              required
              disabled={loading}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <div>
            <label htmlFor="billingDay" className="block text-sm font-medium text-gray-300">Billing Day (1-31)</label>
            <input
              type="number"
              id="billingDay"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-main focus:border-main sm:text-sm bg-primary-bg text-white"
              value={billingDay}
              onChange={(e) => setBillingDay(e.target.value)}
              min="1"
              max="31"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main"
            disabled={loading}
          >
            {loading ? 'Creating Plan...' : 'Create Plan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Plans;
