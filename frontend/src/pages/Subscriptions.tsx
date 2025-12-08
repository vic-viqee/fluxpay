import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SubscriptionsTable } from '../components/SubscriptionsTable';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCreateSubscription = async () => {
    const plan = prompt('Enter Plan Name (e.g., Basic):');
    const amountStr = prompt('Enter Amount (KES):');
    if (plan && amountStr) {
      const amount = parseFloat(amountStr);
      try {
        await api.post('/subscriptions', { plan, amount, status: 'active', startDate: new Date().toISOString() });
        alert('Subscription created successfully!');
        fetchSubscriptions();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to create subscription.');
      }
    }
  };

  // You can implement edit and delete functions here as well, similar to handleCreateSubscription
  // For simplicity, they are omitted in this basic conversion.
  // The SubscriptionsTable component should be updated to pass these handlers as props.

  if (loading) {
    return <div className="text-center">Loading subscriptions...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Subscriptions</h1>
        <button onClick={handleCreateSubscription} className="btn btn-primary">New Subscription</button>
      </div>
      <SubscriptionsTable subscriptions={subscriptions} />
    </div>
  );
};

export default Subscriptions;
