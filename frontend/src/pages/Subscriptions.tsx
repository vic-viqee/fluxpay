import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SubscriptionsTable } from '../components/SubscriptionsTable';
import { AddSubscriptionModal } from '../components/AddSubscriptionModal';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setError(null);
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSubscriptionAdded = () => {
    setIsAddSubModalOpen(false);
    fetchSubscriptions();
  };

  if (loading) {
    return <div className="text-center">Loading subscriptions...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-400 bg-red-900 bg-opacity-50 rounded-lg border border-red-400">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-primary-bg text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Subscriptions</h1>
        <button
          onClick={() => setIsAddSubModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main"
        >
          New Subscription
        </button>
      </div>
      <SubscriptionsTable
        subscriptions={subscriptions}
        onCreateSubscription={() => setIsAddSubModalOpen(true)}
      />
      <AddSubscriptionModal
        isOpen={isAddSubModalOpen}
        onClose={() => setIsAddSubModalOpen(false)}
        onSuccess={handleSubscriptionAdded}
      />
    </div>
  );
};

export default Subscriptions;
