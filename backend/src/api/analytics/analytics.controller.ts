import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { IUser } from '../../models/User';
import Transaction from '../../models/Transaction';
import Subscription from '../../models/Subscription';
import Client from '../../models/Client';
import ServicePlan from '../../models/ServicePlan';

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    const ownerId = user?._id;

    if (!ownerId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const ownerObjectId = new mongoose.Types.ObjectId(String(ownerId));

    const [totals, statusBreakdown, monthlyRevenue, subscriptionsByStatus, counts] = await Promise.all([
      Transaction.aggregate([
        { $match: { ownerId: ownerObjectId } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'SUCCESS'] }, '$amountKes', 0],
              },
            },
            successfulTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] },
            },
            pendingTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
            },
            failedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] },
            },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { ownerId: ownerObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            ownerId: ownerObjectId,
            status: 'SUCCESS',
            transactionDate: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$transactionDate' },
              month: { $month: '$transactionDate' },
            },
            revenue: { $sum: '$amountKes' },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Subscription.aggregate([
        { $match: { ownerId: ownerObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Promise.all([
        Client.countDocuments({ ownerId: ownerObjectId }),
        ServicePlan.countDocuments({ ownerId: ownerObjectId }),
        Subscription.countDocuments({ ownerId: ownerObjectId }),
      ]),
    ]);

    const totalBlock = totals[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      successfulTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
    };

    const successRate = totalBlock.totalTransactions
      ? (totalBlock.successfulTransactions / totalBlock.totalTransactions) * 100
      : 0;

    const [totalCustomers, totalPlans, totalSubscriptions] = counts;

    return res.status(200).json({
      totals: {
        ...totalBlock,
        successRate,
        totalCustomers,
        totalPlans,
        totalSubscriptions,
      },
      transactionStatusBreakdown: statusBreakdown,
      subscriptionStatusBreakdown: subscriptionsByStatus,
      monthlyRevenue,
    });
  } catch (error) {
    next(error);
  }
};
