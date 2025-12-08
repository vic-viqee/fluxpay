import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard'; // This will be a new component
import { UserProfile } from '../components/UserProfile'; // This will be a new component
import { SubscriptionsTable } from '../components/SubscriptionsTable'; // This will be a new component
import { TransactionsTable } from '../components/TransactionsTable'; // This will be a new component
import { AddSubscriptionModal } from '../components/AddSubscriptionModal'; // Import the new modal component

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false); // New state for modal
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    successRate: 0,
    pendingPayments: 0,
  });

  const fetchData = async () => {
    try {
      const [userRes, subsRes, transRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/subscriptions'),
        api.get('/transactions'),
      ]);

      setUser(userRes.data);
      setSubscriptions(subsRes.data);
      setTransactions(transRes.data);

      // Calculate stats (simplified)
      const totalRevenue = transRes.data
        .filter((t: any) => t.status === 'completed')
        .reduce((acc: number, t: any) => acc + t.amount, 0);
      
      const activeSubscriptions = subsRes.data.filter((s: any) => s.status === 'active').length;
      
      const successRate = transRes.data.length > 0 
        ? (transRes.data.filter((t: any) => t.status === 'completed').length / transRes.data.length) * 100 
        : 0;

      const pendingPayments = transRes.data.filter((t: any) => t.status === 'pending').length;

      setStats({ totalRevenue, activeSubscriptions, successRate, pendingPayments });

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateStkPush = async () => {
    const phone = prompt('Enter M-Pesa Phone Number (e.g., 254712345678):');
    const amount = prompt('Enter Amount to push (KES):');
    if (phone && amount) {
      try {
        await api.post('/payments/stk-push', { phone, amount: parseInt(amount) });
        alert('STK Push initiated successfully!');
        // Ideally, you would refresh the transactions here after a short delay
      } catch (error) {
        alert('Failed to initiate STK Push.');
      }
    }
  };

  const handleAddSubscriptionSuccess = () => {
    setIsAddSubscriptionModalOpen(false); // Close modal
    fetchData(); // Re-fetch data to update subscriptions list
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.businessName || user?.username}!</h1>
        <div className="flex space-x-2">
          <button className="btn btn-outline">Export</button>
          <button onClick={handleSimulateStkPush} className="btn btn-primary">Simulate STK Push</button>
          <button onClick={() => setIsAddSubscriptionModalOpen(true)} className="btn btn-success">Add Subscription</button> {/* New button */}
        </div>
      </div>

      <AddSubscriptionModal 
        isOpen={isAddSubscriptionModalOpen} 
        onClose={() => setIsAddSubscriptionModalOpen(false)} 
        onSuccess={handleAddSubscriptionSuccess}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} change="+0.0%" />
        <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} change="+0 new" />
        <StatCard title="Success Rate" value={`${stats.successRate.toFixed(1)}%`} change="+0.0%" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} change={`KES 0 pending`} />
      </div>

      <div className="space-y-6">
        <UserProfile user={user} />
        <SubscriptionsTable subscriptions={subscriptions} />
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
};

export default Dashboard;
