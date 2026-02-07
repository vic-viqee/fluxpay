import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await api.get('/analytics');
        setAnalyticsData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <div className="text-center">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-400 bg-red-900 bg-opacity-50 rounded-lg border border-red-400">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 text-white text-center bg-primary-bg">
      <h1 className="text-3xl font-bold mb-4">Analytics Page</h1>
      <p className="text-lg text-accent mb-6">This feature is coming soon.</p>
      {analyticsData && (
        <div className="bg-surface-bg rounded-lg shadow-md p-6 mt-4 border border-surface-bg">
          <h2 className="text-xl font-semibold mb-2">Backend Response:</h2>
          <pre className="text-left bg-primary-bg p-4 rounded-md overflow-x-auto text-gray-300">
            {JSON.stringify(analyticsData, null, 2)}
          </pre>
        </div>
      )}
      <a href="/dashboard" className="mt-6 inline-block px-6 py-3 text-sm font-medium text-white bg-main border border-transparent rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main">Back to Dashboard</a>
    </div>
  );
};

export default Analytics;
