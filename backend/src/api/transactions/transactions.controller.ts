import { Request, Response, NextFunction } from 'express';
import Transaction from '../../models/Transaction';
// Removed `import { AuthenticatedRequest } from '../../middleware/auth.middleware';`
import logger from '../../utils/logger';
import { IUser } from '../../models/User';

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Cast req.user to IUser
    if (!user || !user._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    const transactions = await Transaction.find({ ownerId: user._id }).sort({ transactionDate: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    next(error);
  }
};
