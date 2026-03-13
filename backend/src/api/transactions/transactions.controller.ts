import { Request, Response, NextFunction } from 'express';
import Transaction from '../../models/Transaction';
import logger from '../../utils/logger';
import { IUser } from '../../models/User';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination';

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    
    const { page, limit, skip } = getPaginationParams(req);
    const query = { ownerId: user._id };
    
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query)
    ]);
    
    res.status(200).json(createPaginatedResponse(transactions, total, { page, limit, skip }));
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    next(error);
  }
};
