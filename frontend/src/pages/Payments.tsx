import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TransactionsTable } from '../components/TransactionsTable';

const Payments: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/transactions');
        setTransactions(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return <div className="text-center">Loading payments...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Payments / Transactions</h1>
      <TransactionsTable transactions={transactions} />
    </div>
  );
};

export default Payments;
