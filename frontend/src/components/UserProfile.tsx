import React from 'react';

interface UserProfileProps {
  user: {
    username: string;
    email: string;
    createdAt: string;
    businessName?: string;
    businessType?: string;
    kraPin?: string;
    businessTillOrPaybill?: string;
    businessPhoneNumber?: string;
    preferredPaymentMethod?: string;
    businessDescription?: string;
    logoUrl?: string;
  };
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Your Profile</h2>
      {user ? (
        <div className="overflow-x-auto">
          {user.logoUrl && (
            <div className="mb-4 text-center">
              <img src={user.logoUrl} alt={`${user.businessName || user.username} Logo`} className="h-20 w-auto mx-auto rounded-full" />
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Full Name</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Email</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              </tr>
              {user.businessName && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Business Name</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.businessName}</td>
                </tr>
              )}
              {user.businessType && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Business Type</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.businessType}</td>
                </tr>
              )}
              {user.businessPhoneNumber && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Business Phone</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.businessPhoneNumber}</td>
                </tr>
              )}
              {user.kraPin && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">KRA PIN</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.kraPin}</td>
                </tr>
              )}
              {user.businessTillOrPaybill && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Till/Paybill No.</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.businessTillOrPaybill}</td>
                </tr>
              )}
              {user.preferredPaymentMethod && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Payment Method</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.preferredPaymentMethod}</td>
                </tr>
              )}
              {user.businessDescription && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Description</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.businessDescription}</td>
                </tr>
              )}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Joined</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading user profile...</p>
      )}
    </div>
  );
};
