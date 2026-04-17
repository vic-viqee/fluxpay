import { Request, Response, NextFunction } from 'express';
import User from '../../models/User';
import Transaction from '../../models/Transaction';
import Subscription from '../../models/Subscription';
import ApiKey from '../../models/ApiKey';
import Webhook from '../../models/Webhook';
import mongoose from 'mongoose';
import { PLAN_LIMITS } from '../../services/transactionLimit.service';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalBusinesses,
      activeBusinesses,
      totalRevenue,
      monthlyRevenue,
      transactionStats,
      subscriptionStats,
      apiKeyStats,
      webhookStats
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Transaction.distinct('ownerId', { status: 'SUCCESS', updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } ),
      Transaction.aggregate([
        { $match: { status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amountKes' } } }
      ]),
      Transaction.aggregate([
        { 
          $match: { 
            status: 'SUCCESS',
            transactionDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) }
          }
        },
        {
          $group: {
            _id: { year: { $year: '$transactionDate' }, month: { $month: '$transactionDate' } },
            revenue: { $sum: '$amountKes' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Transaction.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Subscription.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ApiKey.aggregate([
        { $group: { _id: '$isActive', count: { $sum: 1 } } }
      ]),
      Webhook.aggregate([
        { $group: { _id: '$isActive', count: { $sum: 1 } } }
      ])
    ]);

    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    
    const monthlyRevenueData = monthlyRevenue.map((m: any) => ({
      month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      revenue: m.revenue,
      transactions: m.transactions
    }));

    const getCountByStatus = (stats: any[], status: string | boolean) => {
      const found = stats.find((s: any) => String(s._id) === String(status));
      return found ? found.count : 0;
    };

    const activeBusinessesCount = activeBusinesses.length;

    res.status(200).json({
      totalBusinesses,
      activeBusinesses: activeBusinessesCount,
      totalRevenue: totalRevenueAmount,
      monthlyRevenue: monthlyRevenueData,
      transactions: {
        total: transactionStats.reduce((sum: number, s: any) => sum + s.count, 0),
        success: getCountByStatus(transactionStats, 'SUCCESS'),
        pending: getCountByStatus(transactionStats, 'PENDING'),
        failed: getCountByStatus(transactionStats, 'FAILED')
      },
      subscriptions: {
        total: subscriptionStats.reduce((sum: number, s: any) => sum + s.count, 0),
        active: getCountByStatus(subscriptionStats, 'ACTIVE'),
        failed: getCountByStatus(subscriptionStats, 'FAILED'),
        paused: getCountByStatus(subscriptionStats, 'PAUSED')
      },
      apiKeys: {
        total: apiKeyStats.reduce((sum: number, s: any) => sum + s.count, 0),
        active: getCountByStatus(apiKeyStats, true),
        inactive: getCountByStatus(apiKeyStats, false)
      },
      webhooks: {
        total: webhookStats.reduce((sum: number, s: any) => sum + s.count, 0),
        active: getCountByStatus(webhookStats, true),
        inactive: getCountByStatus(webhookStats, false)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinesses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search, plan, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { role: { $ne: 'admin' } };
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessPhoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (plan) {
      query.plan = plan;
    }

    const [businesses, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    const businessesWithStats = await Promise.all(
      businesses.map(async (business: any) => {
        const [transactionStats, subscriptionCount, apiKeyCount] = await Promise.all([
          Transaction.aggregate([
            { $match: { ownerId: business._id } },
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amountKes' } } }
          ]),
          Subscription.countDocuments({ ownerId: business._id, status: 'ACTIVE' }),
          ApiKey.countDocuments({ ownerId: business._id, isActive: true })
        ]);

        const totalRevenue = transactionStats
          .filter((s: any) => s._id === 'SUCCESS')
          .reduce((sum: number, s: any) => sum + (s.total || 0), 0);

        const successfulTransactions = transactionStats
          .filter((s: any) => s._id === 'SUCCESS')
          .reduce((sum: number, s: any) => sum + s.count, 0);

        return {
          _id: business._id,
          businessName: business.businessName,
          email: business.email,
          phone: business.businessPhoneNumber,
          plan: business.plan || 'Free',
          createdAt: business.createdAt,
          totalRevenue,
          successfulTransactions,
          activeSubscriptions: subscriptionCount,
          activeApiKeys: apiKeyCount
        };
      })
    );

    res.status(200).json({
      data: businessesWithStats,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinessDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const business = await User.findById(id).select('-password');
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const [transactionStats, subscriptions, apiKeys, webhooks] = await Promise.all([
      Transaction.aggregate([
        { $match: { ownerId: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amountKes' } } }
      ]),
      Subscription.find({ ownerId: new mongoose.Types.ObjectId(id) })
        .populate('clientId')
        .populate('planId')
        .limit(20),
      ApiKey.find({ ownerId: new mongoose.Types.ObjectId(id) }).select('-secret'),
      Webhook.find({ ownerId: new mongoose.Types.ObjectId(id) }).select('-secret')
    ]);

    const totalRevenue = transactionStats
      .filter((s: any) => s._id === 'SUCCESS')
      .reduce((sum: number, s: any) => sum + (s.total || 0), 0);

    res.status(200).json({
      business,
      stats: {
        totalRevenue,
        transactions: transactionStats,
        activeSubscriptions: subscriptions.filter((s: any) => s.status === 'ACTIVE').length,
        totalSubscriptions: subscriptions.length,
        apiKeysCount: apiKeys.length,
        webhooksCount: webhooks.length
      },
      recentSubscriptions: subscriptions,
      apiKeys,
      webhooks
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('ownerId', 'businessName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query)
    ]);

    res.status(200).json({
      data: transactions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate('ownerId', 'businessName email')
        .populate('clientId', 'name phoneNumber')
        .populate('planId', 'name amountKes')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Subscription.countDocuments(query)
    ]);

    res.status(200).json({
      data: subscriptions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApiKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [apiKeys, total] = await Promise.all([
      ApiKey.find(query)
        .populate('ownerId', 'businessName email')
        .select('-secret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ApiKey.countDocuments(query)
    ]);

    res.status(200).json({
      data: apiKeys,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

export const getAllWebhooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [webhooks, total] = await Promise.all([
      Webhook.find(query)
        .populate('ownerId', 'businessName email')
        .select('-secret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Webhook.countDocuments(query)
    ]);

    res.status(200).json({
      data: webhooks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, plan } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { role: { $ne: 'admin' } };
    if (plan) {
      query.plan = plan;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('businessName email plan transactionLimit currentMonthTransactions transactionCountResetAt createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    const planLimitsData = users.map((user: any) => {
      const limit = user.transactionLimit || PLAN_LIMITS[user.plan || 'free'] || PLAN_LIMITS.free;
      const used = user.currentMonthTransactions;
      const percentage = limit === Infinity ? 0 : Math.round((used / limit) * 100);
      
      return {
        _id: user._id,
        businessName: user.businessName,
        email: user.email,
        plan: user.plan || 'Free',
        limit: limit === Infinity ? 'Unlimited' : limit,
        used,
        percentage,
        remaining: limit === Infinity ? 'Unlimited' : Math.max(0, limit - used),
        resetAt: user.transactionCountResetAt,
        status: percentage >= 100 ? 'blocked' : percentage >= 80 ? 'warning' : 'ok',
        createdAt: user.createdAt
      };
    });

    const planStats = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: {
        _id: { $ifNull: ['$plan', 'Free'] },
        count: { $sum: 1 },
        totalTransactions: { $sum: '$currentMonthTransactions' }
      }}
    ]);

    res.status(200).json({
      data: planLimitsData,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      planStats: planStats.map((p: any) => ({
        plan: p._id,
        businesses: p.count,
        totalTransactions: p.totalTransactions
      })),
      availablePlans: PLAN_LIMITS
    });
  } catch (error) {
    next(error);
  }
};