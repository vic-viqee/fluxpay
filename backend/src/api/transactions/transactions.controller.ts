import { Response, NextFunction } from 'express';
import Transaction from '../../models/Transaction';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import logger from '../../utils/logger';

export const getTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    const transactions = await Transaction.find({ ownerId: req.user._id }).sort({ transactionDate: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    next(error);
  }
};
