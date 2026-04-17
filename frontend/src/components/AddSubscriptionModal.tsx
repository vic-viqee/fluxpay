import React, { useEffect, useState } from 'react';
import { X, User, CreditCard, Calendar, Plus, AlertCircle } from 'lucide-react';
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
  const [quickPlanFrequency] = useState<PlanFrequency>('monthly');
  const [quickPlanBillingDay] = useState('1');
  const [quickPlanMessage, setQuickPlanMessage] = useState('');

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const fetchedPlans = await getServicePlans();
      const plansData = fetchedPlans.data || [];
      setServicePlans(plansData);
      if (!selectedPlanId && plansData.length > 0) {
        setSelectedPlanId(plansData[0]._id);
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
      const clientsData = fetchedClients.data || [];
      setClients(clientsData);
      if (clientsData.length > 0 && !selectedClientId) {
        setSelectedClientId(clientsData[0]._id);
      }
      if (!clientsData.length) {
        setClientMode('new');
        setSelectedClientId('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch clients.');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setQuickPlanMessage('');
    fetchPlans();
    fetchClientsList();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateQuickPlan = async () => {
    setError('');
    setQuickPlanMessage('');
    const amount = Number(quickPlanAmount);
    const billingDay = Number(quickPlanBillingDay);

    if (!quickPlanName.trim() || !amount || !billingDay) {
      setError('Plan name and amount are required.');
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
      setQuickPlanMessage('Service plan created successfully!');
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
          clientId = clientResponse.client._id;
      } catch (clientErr: any) {
        if (clientErr.response?.status === 409) {
          const allClientsResponse = await getClients();
          const allClients = allClientsResponse.data || [];
          const existingClient = allClients.find(
            (client: any) => client.phoneNumber === clientPhoneNumber.trim()
          );
          if (existingClient?._id) {
            clientId = existingClient._id;
          } else throw clientErr;
        } else throw clientErr;
      }
      }

      const response = await api.post('/subscriptions', {
        clientId,
        planId: selectedPlanId,
        notes: notes.trim() || undefined,
      });

      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface-bg border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-primary-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-main/10 rounded-lg text-main">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">New Subscription</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar text-white">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Client Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Client Information
              </h3>
              
              <div className="flex bg-primary-bg p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${clientMode === 'new' ? 'bg-surface-bg text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  New Client
                </button>
                <button
                  type="button"
                  disabled={clients.length === 0}
                  onClick={() => setClientMode('existing')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${clientMode === 'existing' ? 'bg-surface-bg text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'} disabled:opacity-30`}
                >
                  Existing Client
                </button>
              </div>

              {clientMode === 'existing' ? (
                <div>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all"
                  >
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phoneNumber})</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all placeholder:text-gray-600"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="M-Pesa Number (2547...)"
                    value={clientPhoneNumber}
                    onChange={(e) => setClientPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all placeholder:text-gray-600"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Plan Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} /> Subscription Plan
              </h3>
              
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                disabled={servicePlans.length === 0}
                className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all disabled:opacity-50"
              >
                {servicePlans.length === 0 && <option value="">No plans available</option>}
                {servicePlans.map(p => <option key={p._id} value={p._id}>{p.name} — KES {p.amountKes.toLocaleString()} / {p.frequency}</option>)}
              </select>

              {servicePlans.length === 0 && !plansLoading && (
                <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl space-y-4">
                  <p className="text-xs font-bold text-yellow-500 flex items-center gap-2">
                    <AlertCircle size={14} /> NO PLANS FOUND. CREATE ONE QUICKLY:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Plan Name"
                      value={quickPlanName}
                      onChange={(e) => setQuickPlanName(e.target.value)}
                      className="bg-primary-bg border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Amount (KES)"
                      value={quickPlanAmount}
                      onChange={(e) => setQuickPlanAmount(e.target.value)}
                      className="bg-primary-bg border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateQuickPlan}
                    disabled={creatingPlan}
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {creatingPlan ? 'Creating...' : 'Create Quick Plan'}
                  </button>
                  {quickPlanMessage && <p className="text-[10px] text-green-500 font-bold text-center">{quickPlanMessage}</p>}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Internal Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes about this subscriber..."
                rows={2}
                className="w-full bg-primary-bg border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-main/50 outline-none transition-all placeholder:text-gray-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-primary-bg border border-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedPlanId}
                className="flex-1 px-4 py-3 bg-secondary hover:bg-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Processing...' : 'Create Subscription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
