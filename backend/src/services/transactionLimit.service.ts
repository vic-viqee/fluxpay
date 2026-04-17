import User from '../models/User';
import logger from '../utils/logger';
import moment from 'moment';

export const PLAN_LIMITS: Record<string, number> = {
  free: 50,
  starter: 100,
  growth: 500,
  pro: 2000,
  enterprise: Infinity,
};

export const checkAndUpdateTransactionLimit = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  const now = moment();
  const resetDate = moment(user.transactionCountResetAt);

  if (now.isSameOrAfter(resetDate)) {
    user.currentMonthTransactions = 0;
    user.transactionCountResetAt = moment().add(1, 'month').startOf('month').toDate();
    user.transactionLimit = PLAN_LIMITS[user.plan || 'free'] || PLAN_LIMITS.free;
    await user.save();
    logger.info(`Transaction counter reset for user ${userId}`);
  }

  const limit = user.transactionLimit;
  const used = user.currentMonthTransactions;
  const percentage = limit === Infinity ? 0 : (used / limit) * 100;

  if (used >= limit) {
    return {
      allowed: false,
      reason: 'TRANSACTION_LIMIT_REACHED',
      limit,
      used,
      percentage: 100,
      upgradePlan: getNextPlan(user.plan || 'free'),
    };
  }

  if (percentage >= 80) {
    return {
      allowed: true,
      warning: 'APPROACHING_LIMIT',
      limit,
      used,
      percentage: Math.round(percentage),
      remaining: limit - used,
    };
  }

  return {
    allowed: true,
    limit,
    used,
    percentage: Math.round(percentage),
    remaining: limit - used,
  };
};

export const incrementTransactionCount = async (userId: string) => {
  await User.findByIdAndUpdate(userId, {
    $inc: { currentMonthTransactions: 1 },
  });
};

export const getNextPlan = (currentPlan: string): string | null => {
  const planOrder = ['free', 'starter', 'growth', 'pro', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan.toLowerCase());
  if (currentIndex === -1 || currentIndex >= planOrder.length - 1) {
    return null;
  }
  return planOrder[currentIndex + 1];
};

export const getPlanInfo = (plan: string) => {
  const normalizedPlan = (plan || 'free').toLowerCase();
  return {
    plan: normalizedPlan,
    limit: PLAN_LIMITS[normalizedPlan] || PLAN_LIMITS.free,
    limitDisplay: PLAN_LIMITS[normalizedPlan] === Infinity ? 'Unlimited' : PLAN_LIMITS[normalizedPlan],
  };
};
