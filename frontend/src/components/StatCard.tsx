import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {/* You can add an icon here */}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-gray-500">{change}</div>
    </div>
  );
};
