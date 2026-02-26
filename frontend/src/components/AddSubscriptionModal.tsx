import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, {
  createClient,
  createServicePlan,
  getClients,
  getServicePlans,
} from '../services/api';

export interface ISubscription {
  _id: string;
  clientId: string;
  planId: string;
  ownerId: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  nextBillingDate: string;
  notes?: string;
}

type PlanFrequency = 'daily' | 'weekly' | 'monthly' | 'annually';

interface ServicePlan {
  _id: string;
  name: string;
  amountKes: number;
  frequency: PlanFrequency;
  billingDay: number;
}

interface ClientOption {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
}

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSubscription: ISubscription) => void;
}

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [clientPhoneNumber, setClientPhoneNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientMode, setClientMode] = useState<'new' | 'existing'>('new');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);

  const [quickPlanName, setQuickPlanName] = useState('');
  const [quickPlanAmount, setQuickPlanAmount] = useState('');
  const [quickPlanFrequency, setQuickPlanFrequency] = useState<PlanFrequency>('monthly');
  const [quickPlanBillingDay, setQuickPlanBillingDay] = useState('1');
  const [quickPlanMessage, setQuickPlanMessage] = useState('');

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const fetchedPlans = await getServicePlans();
      setServicePlans(fetchedPlans);
      if (!selectedPlanId && fetchedPlans.length > 0) {
        setSelectedPlanId(fetchedPlans[0]._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch service plans.');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchClientsList = async () => {
    try {
      const fetchedClients = await getClients();
      setClients(fetchedClients || []);
      if (fetchedClients?.length > 0 && !selectedClientId) {
        setSelectedClientId(fetchedClients[0]._id);
      }
      if (!fetchedClients?.length) {
        setClientMode('new');
        setSelectedClientId('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch clients.');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError('');
    setQuickPlanMessage('');
    fetchPlans();
    fetchClientsList();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleCreateQuickPlan = async () => {
    setError('');
    setQuickPlanMessage('');
    const amount = Number(quickPlanAmount);
    const billingDay = Number(quickPlanBillingDay);

    if (!quickPlanName.trim() || !amount || !billingDay) {
      setError('Plan name, amount, frequency, and billing day are required.');
      return;
    }

    if (amount <= 0) {
      setError('Plan amount must be greater than 0.');
      return;
    }

    if (billingDay < 1 || billingDay > 31) {
      setError('Billing day must be between 1 and 31.');
      return;
    }

    setCreatingPlan(true);
    try {
      const result = await createServicePlan({
        name: quickPlanName.trim(),
        amountKes: amount,
        frequency: quickPlanFrequency,
        billingDay,
      });

      const createdPlan = result?.plan;
      if (createdPlan?._id) {
        setServicePlans((prev) => [...prev, createdPlan]);
        setSelectedPlanId(createdPlan._id);
      } else {
        await fetchPlans();
      }

      setQuickPlanName('');
      setQuickPlanAmount('');
      setQuickPlanFrequency('monthly');
      setQuickPlanBillingDay('1');
      setQuickPlanMessage('Plan created. Continue with subscription details below.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create service plan.');
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPlanId) {
      setError('Service plan is required.');
      return;
    }

    if (clientMode === 'existing' && !selectedClientId) {
      setError('Please select an existing client.');
      return;
    }

    if (clientMode === 'new') {
      if (!clientName.trim() || !clientPhoneNumber.trim()) {
        setError('Client name and phone number are required for a new client.');
        return;
      }
      if (!/^(2541|2547)\d{8}$/.test(clientPhoneNumber.trim())) {
        setError('Invalid phone number. Use 2541XXXXXXXX or 2547XXXXXXXX.');
        return;
      }
    }

    setLoading(true);
    try {
      let clientId = '';

      if (clientMode === 'existing') {
        clientId = selectedClientId;
      } else {
        try {
          const clientResponse = await createClient({
            name: clientName.trim(),
            phoneNumber: clientPhoneNumber.trim(),
            email: clientEmail.trim() || undefined,
          });
          clientId = clientResponse._id;
        } catch (clientErr: any) {
          if (clientErr.response?.status === 409) {
            const allClients = await getClients();
            const existingClient = allClients.find(
              (client: any) => client.phoneNumber === clientPhoneNumber.trim()
            );
            if (existingClient?._id) {
              clientId = existingClient._id;
            } else {
              throw clientErr;
            }
          } else {
            throw clientErr;
          }
        }
      }

      const response = await api.post('/subscriptions', {
        clientId,
        planId: selectedPlanId,
        notes: notes.trim() || undefined,
      });

      onSuccess(response.data);
      setClientName('');
      setClientPhoneNumber('');
      setClientEmail('');
      setClientMode('new');
      setSelectedClientId(clients[0]?._id || '');
      setSelectedPlanId(servicePlans[0]?._id || '');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Subscription</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">Client Details</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700">
              <input
                type="radio"
                name="clientMode"
                value="new"
                checked={clientMode === 'new'}
                onChange={() => setClientMode('new')}
                disabled={loading}
                className="mr-2"
              />
              New Client
            </label>
            <label className="text-sm text-gray-700">
              <input
                type="radio"
                name="clientMode"
                value="existing"
                checked={clientMode === 'existing'}
                onChange={() => setClientMode('existing')}
                disabled={loading || clients.length === 0}
                className="mr-2"
              />
              Existing Client
            </label>
          </div>
          {clients.length === 0 ? (
            <p className="text-xs text-gray-500">
              No existing clients yet. Create one in this form.
            </p>
          ) : null}
          {clientMode === 'existing' ? (
            <div>
              <label htmlFor="selectedClientId" className="block text-sm font-medium text-gray-700">
                Select Client
              </label>
              <select
                id="selectedClientId"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={loading || clients.length === 0}
              >
                {clients.length === 0 ? <option value="">No clients available</option> : null}
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} ({client.phoneNumber})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>
            </>
          )}
          {clientMode === 'new' ? (
            <>
              <div>
                <label htmlFor="clientPhoneNumber" className="block text-sm font-medium text-gray-700">
                  Client Phone Number
                </label>
                <input
                  type="tel"
                  id="clientPhoneNumber"
                  value={clientPhoneNumber}
                  onChange={(e) => setClientPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="2547XXXXXXXX or 2541XXXXXXXX"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">
                  Client Email (Optional)
                </label>
                <input
                  type="email"
                  id="clientEmail"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={loading}
                />
              </div>
            </>
          ) : null}

          <h3 className="mb-4 mt-6 border-b pb-2 text-lg font-semibold text-gray-800">Plan Details</h3>
          <div>
            <label htmlFor="selectedPlanId" className="block text-sm font-medium text-gray-700">
              Service Plan
            </label>
            {plansLoading ? (
              <p className="mt-1 text-gray-600">Loading plans...</p>
            ) : (
              <select
                id="selectedPlanId"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={loading || creatingPlan || servicePlans.length === 0}
              >
                {servicePlans.length === 0 ? <option value="">No plans available</option> : null}
                {servicePlans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} (KES {plan.amountKes} / {plan.frequency})
                  </option>
                ))}
              </select>
            )}
          </div>

          {servicePlans.length === 0 && !plansLoading ? (
            <div className="space-y-3 rounded-md border border-yellow-300 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                No service plans found. Create one here and continue.
              </p>
              <input
                type="text"
                value={quickPlanName}
                onChange={(e) => setQuickPlanName(e.target.value)}
                placeholder="Plan name"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={creatingPlan || loading}
              />
              <input
                type="number"
                min="1"
                value={quickPlanAmount}
                onChange={(e) => setQuickPlanAmount(e.target.value)}
                placeholder="Amount (KES)"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={creatingPlan || loading}
              />
              <select
                value={quickPlanFrequency}
                onChange={(e) => setQuickPlanFrequency(e.target.value as PlanFrequency)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={creatingPlan || loading}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
              <input
                type="number"
                min="1"
                max="31"
                value={quickPlanBillingDay}
                onChange={(e) => setQuickPlanBillingDay(e.target.value)}
                placeholder="Billing day (1-31)"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                disabled={creatingPlan || loading}
              />
              <button
                type="button"
                onClick={handleCreateQuickPlan}
                className="rounded bg-main px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                disabled={creatingPlan || loading}
              >
                {creatingPlan ? 'Creating Plan...' : 'Create Plan'}
              </button>
              {quickPlanMessage ? (
                <p className="text-sm text-green-700">{quickPlanMessage}</p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/plans');
                }}
                className="rounded border border-gray-400 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                disabled={creatingPlan || loading}
              >
                Go to Plans
              </button>
            </div>
          ) : null}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              disabled={loading || creatingPlan}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-secondary px-4 py-2 font-medium text-white hover:bg-teal-500 disabled:opacity-60"
              disabled={loading || plansLoading || !selectedPlanId}
            >
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
