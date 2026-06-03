import React from 'react';
import { X, AlertTriangle, RefreshCw } from 'lucide-react';

interface ISubscription {
  _id: string;
  status: string;
  planId?: { name: string; amountKes: number } | null;
  gracePeriodEndsAt?: string;
}

interface ReactivateSubscriptionModalProps {
  subscription: ISubscription | null;
  onConfirm: (subscriptionId: string) => void;
  onClose: () => void;
}

export const ReactivateSubscriptionModal: React.FC<ReactivateSubscriptionModalProps> = ({
  subscription,
  onConfirm,
  onClose,
}) => {
  if (!subscription) return null;

  const planName = subscription.planId?.name || 'this subscription';
  const graceEnd = subscription.gracePeriodEndsAt
    ? new Date(subscription.gracePeriodEndsAt).toLocaleDateString()
    : 'soon';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-surface-bg border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <AlertTriangle size={24} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Reactivate Subscription</h3>
              <p className="text-sm text-gray-400">{planName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-300 mb-4">
          This subscription is currently <span className="text-amber-500 font-semibold">suspended</span> due to
          failed payments. It will be cancelled on <strong>{graceEnd}</strong> if not reactivated.
        </p>

        <p className="text-gray-400 text-sm mb-6">
          Reactivating will reset the failure count, clear the grace period, and recalculate the next billing date.
          A new STK push will be attempted at the next billing cycle.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(subscription._id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-teal-500 transition-all shadow-lg active:scale-95"
          >
            <RefreshCw size={16} />
            Reactivate
          </button>
        </div>
      </div>
    </div>
  );
};