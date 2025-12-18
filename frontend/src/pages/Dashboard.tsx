import React, { useEffect, useState } from 'react';
import { SubscriptionsTable } from '../components/SubscriptionsTable';
import { TransactionsTable } from '../components/TransactionsTable';
import api from '../services/api';

// Re-define interfaces locally to match expected data structure
interface ISubscription {
  _id: string;
  clientId: string;
  planId: {
    _id: string;
    name: string;
    amountKes: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'annually';
  };
  ownerId: string;
  status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  nextBillingDate: string;
  notes?: string;
}

interface ITransaction {
  _id: string;
  subscriptionId: string;
  ownerId: string;
  amountKes: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  mpesaReceiptNo?: string;
  darajaRequestId: string;
  retryCount: number;
  transactionDate: string;
}

const Dashboard: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use Promise.all to fetch in parallel
        const [subResponse, txnResponse] = await Promise.all([
          api.get('/subscriptions'),
          api.get('/transactions'), // Assuming this endpoint exists for fetching transactions
        ]);

        // Assuming your backend returns data in a 'data' property or directly
        setSubscriptions(subResponse.data || []);
        setTransactions(txnResponse.data || []);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your account.</p>
      </div>

      {/* TODO: Add StatCard components for summary stats if needed */}

      <SubscriptionsTable subscriptions={subscriptions} />
      <TransactionsTable transactions={transactions} />
    </div>
  );
};

export default Dashboard;
