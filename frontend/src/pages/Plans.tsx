import React, { useEffect, useMemo, useState } from 'react';
import {
  createServicePlan,
  deleteServicePlan,
  getServicePlans,
  updateServicePlan,
} from '../services/api';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'annually';

interface ServicePlan {
  _id: string;
  name: string;
  amountKes: number;
  frequency: Frequency;
  billingDay: number;
}

const emptyForm = {
  name: '',
  amountKes: '',
  frequency: 'monthly' as Frequency,
  billingDay: '',
};

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({
    text: '',
    type: '',
  });

  const isEditing = useMemo(() => !!editingPlanId, [editingPlanId]);

  const fetchPlans = async () => {
    setFetching(true);
    try {
      const fetchedPlans = await getServicePlans();
      setPlans(fetchedPlans.data || []);
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Failed to fetch service plans.', type: 'error' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPlanId(null);
  };

  const validate = () => {
    if (!form.name || !form.amountKes || !form.frequency || !form.billingDay) {
      return 'All fields are required.';
    }

    if (Number(form.amountKes) <= 0) {
      return 'Amount must be greater than 0.';
    }

    if (Number(form.billingDay) < 1 || Number(form.billingDay) > 31) {
      return 'Billing day must be between 1 and 31.';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const validationError = validate();
    if (validationError) {
      setMessage({ text: validationError, type: 'error' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      amountKes: Number(form.amountKes),
      frequency: form.frequency,
      billingDay: Number(form.billingDay),
    };

    setLoading(true);
    try {
      if (editingPlanId) {
        await updateServicePlan(editingPlanId, payload);
        setMessage({ text: 'Service plan updated successfully.', type: 'success' });
      } else {
        await createServicePlan(payload);
        setMessage({ text: 'Service plan created successfully.', type: 'success' });
      }
      resetForm();
      await fetchPlans();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Failed to save service plan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (plan: ServicePlan) => {
    setEditingPlanId(plan._id);
    setForm({
      name: plan.name,
      amountKes: String(plan.amountKes),
      frequency: plan.frequency,
      billingDay: String(plan.billingDay),
    });
    setMessage({ text: '', type: '' });
  };

  const handleDelete = async (planId: string) => {
    const confirmed = window.confirm('Delete this service plan?');
    if (!confirmed) return;

    setMessage({ text: '', type: '' });
    try {
      await deleteServicePlan(planId);
      setMessage({ text: 'Service plan deleted.', type: 'success' });
      if (editingPlanId === planId) {
        resetForm();
      }
      await fetchPlans();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.message || 'Failed to delete service plan.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg p-6 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-surface-bg bg-surface-bg p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">
            {isEditing ? 'Edit Service Plan' : 'Create Service Plan'}
          </h1>

          {message.text && (
            <div
              className={`mb-4 rounded-md p-3 text-sm ${
                message.type === 'error'
                  ? 'border border-red-400 bg-red-900 text-red-300'
                  : 'border border-secondary bg-secondary/20 text-secondary'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Service Name
              </label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white focus:border-main focus:outline-none focus:ring-main"
                required
              />
            </div>

            <div>
              <label htmlFor="amountKes" className="block text-sm font-medium text-gray-300">
                Amount (KES)
              </label>
              <input
                type="number"
                id="amountKes"
                min="1"
                value={form.amountKes}
                onChange={(e) => setField('amountKes', e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white focus:border-main focus:outline-none focus:ring-main"
                required
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-300">
                Frequency
              </label>
              <select
                id="frequency"
                value={form.frequency}
                onChange={(e) => setField('frequency', e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white focus:border-main focus:outline-none focus:ring-main"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div>
              <label htmlFor="billingDay" className="block text-sm font-medium text-gray-300">
                Billing Day (1-31)
              </label>
              <input
                type="number"
                id="billingDay"
                min="1"
                max="31"
                value={form.billingDay}
                onChange={(e) => setField('billingDay', e.target.value)}
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-600 bg-primary-bg px-3 py-2 text-white focus:border-main focus:outline-none focus:ring-main"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-main px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Plan' : 'Create Plan'}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-md border border-gray-500 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-surface-bg bg-surface-bg p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold">Your Service Plans</h2>
          {fetching ? (
            <p className="text-gray-400">Loading plans...</p>
          ) : plans.length === 0 ? (
            <p className="text-gray-400">No plans yet. Create your first plan.</p>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="flex items-center justify-between rounded-md border border-gray-700 bg-primary-bg p-4"
                >
                  <div>
                    <p className="font-semibold text-white">{plan.name}</p>
                    <p className="text-sm text-gray-300">
                      KES {plan.amountKes.toLocaleString()} / {plan.frequency} - Billing day {plan.billingDay}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(plan)}
                      className="rounded border border-main px-3 py-1 text-xs font-medium text-main hover:bg-main hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan._id)}
                      className="rounded border border-red-400 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Plans;

