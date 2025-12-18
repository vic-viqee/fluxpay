import React, { useState, useEffect } from 'react';
import api, { getServicePlans, createClient } from '../services/api';

// Re-define ISubscription locally based on the new backend model
export interface ISubscription {
  _id: string;
  clientId: string; // Reference to Client ID
  planId: string;   // Reference to ServicePlan ID
  ownerId: string;  // Reference to User ID
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  nextBillingDate: string;
  notes?: string;
  // Potentially add populated client and plan data for display
  client?: { name: string; phoneNumber: string; email?: string };
  plan?: { name: string; amountKes: number; frequency: string };
}

interface ServicePlan {
  _id: string;
  name: string;
  amountKes: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
  billingDay: number;
}

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSubscription: ISubscription) => void;
}

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [clientName, setClientName] = useState('');
  const [clientPhoneNumber, setClientPhoneNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPlans = async () => {
        setPlansLoading(true);
        try {
          const fetchedPlans = await getServicePlans();
          setServicePlans(fetchedPlans);
          if (fetchedPlans.length > 0) {
            setSelectedPlanId(fetchedPlans[0]._id); // Select first plan by default
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch service plans.');
          console.error('Error fetching plans:', err);
        } finally {
          setPlansLoading(false);
        }
      };
      fetchPlans();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!clientName || !clientPhoneNumber || !selectedPlanId) {
      setError('Client Name, Phone Number, and Service Plan are required.');
      setLoading(false);
      return;
    }

    if (!/^2547\d{8}$/.test(clientPhoneNumber)) {
      setError('Invalid Kenyan M-Pesa phone number (e.g., 2547XXXXXXXX).');
      setLoading(false);
      return;
    }

    try {
      // 1. Create or get Client
      let clientId = '';
      try {
        const clientResponse = await createClient({
          name: clientName,
          phoneNumber: clientPhoneNumber,
          email: clientEmail,
        });
        clientId = clientResponse._id; // Assuming createClient returns the created client object with _id
      } catch (clientErr: any) {
        // If client already exists (e.g., 409 Conflict), try to find them
        if (clientErr.response && clientErr.response.status === 409) {
          // In a real app, you'd fetch the existing client by phone number or email
          // For simplicity, we'll just re-throw if it's not a clear 'already exists' scenario
          setError(clientErr.response?.data?.message || 'Error creating client.');
          setLoading(false);
          return;
        } else {
          setError(clientErr.response?.data?.message || 'Error creating client.');
          setLoading(false);
          return;
        }
      }

      // 2. Create Subscription
      const response = await api.post('/subscriptions', {
        clientId,
        planId: selectedPlanId,
        notes,
      });

      onSuccess(response.data); // Pass the new subscription back to the dashboard
      // Reset form
      setClientName('');
      setClientPhoneNumber('');
      setClientEmail('');
      setSelectedPlanId(servicePlans.length > 0 ? servicePlans[0]._id : '');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add subscription.');
      console.error('Add Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Subscription</h2>
          <button onClick={onClose} className="btn btn-secondary">&times;</button>
        </div>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Client Details</h3>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client Name</label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="clientPhoneNumber" className="block text-sm font-medium text-gray-700">Client Phone Number (e.g., 2547XXXXXXXX)</label>
            <input
              type="tel"
              id="clientPhoneNumber"
              value={clientPhoneNumber}
              onChange={(e) => setClientPhoneNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 2547XXXXXXXX"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">Client Email (Optional)</label>
            <input
              type="email"
              id="clientEmail"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 mt-6">Plan Details</h3>
          <div>
            <label htmlFor="selectedPlanId" className="block text-sm font-medium text-gray-700">Service Plan</label>
            {plansLoading ? (
              <p className="mt-1 text-gray-600">Loading plans...</p>
            ) : (
              <select
                id="selectedPlanId"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={loading || servicePlans.length === 0}
              >
                {servicePlans.length === 0 && <option value="">No plans available</option>}
                {servicePlans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} (KES {plan.amountKes} / {plan.frequency})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || plansLoading}>
              {loading ? 'Adding...' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};