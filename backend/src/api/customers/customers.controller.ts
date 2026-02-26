import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { IUser } from '../../models/User';
import Client from '../../models/Client';
import Subscription from '../../models/Subscription';
import Transaction from '../../models/Transaction';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    const ownerId = user?._id;

    if (!ownerId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const ownerObjectId = new mongoose.Types.ObjectId(String(ownerId));
    const customers = await Client.aggregate([
      { $match: { ownerId: ownerObjectId } },
      {
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'clientId',
          as: 'subscriptions',
        },
      },
      {
        $addFields: {
          subscriptionIds: '$subscriptions._id',
          activeSubscriptions: {
            $size: {
              $filter: {
                input: '$subscriptions',
                as: 'sub',
                cond: { $eq: ['$$sub.status', 'ACTIVE'] },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'transactions',
          let: { subIds: '$subscriptionIds', owner: '$ownerId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$ownerId', '$$owner'] },
                    { $in: ['$subscriptionId', '$$subIds'] },
                  ],
                },
              },
            },
          ],
          as: 'transactions',
        },
      },
      {
        $addFields: {
          totalTransactions: { $size: '$transactions' },
          successfulTransactions: {
            $size: {
              $filter: {
                input: '$transactions',
                as: 'tx',
                cond: { $eq: ['$$tx.status', 'SUCCESS'] },
              },
            },
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$transactions',
                    as: 'tx',
                    cond: { $eq: ['$$tx.status', 'SUCCESS'] },
                  },
                },
                as: 's',
                in: '$$s.amountKes',
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          phoneNumber: 1,
          email: 1,
          createdAt: 1,
          updatedAt: 1,
          activeSubscriptions: 1,
          totalSubscriptions: { $size: '$subscriptions' },
          totalTransactions: 1,
          successfulTransactions: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const summary = customers.reduce(
      (acc, customer) => {
        acc.totalCustomers += 1;
        acc.totalRevenue += customer.totalRevenue || 0;
        acc.activeSubscriptions += customer.activeSubscriptions || 0;
        return acc;
      },
      { totalCustomers: 0, totalRevenue: 0, activeSubscriptions: 0 }
    );

    return res.status(200).json({ customers, summary });
  } catch (error) {
    next(error);
  }
};
