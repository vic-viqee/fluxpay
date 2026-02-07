import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import logger from '../../utils/logger';
import Transaction from '../../models/Transaction'; // Import Transaction model

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const successfulTransaction = await Transaction.findOne({
      ownerId: user._id,
      status: 'SUCCESS'
    });

    // Return user data, excluding sensitive information like password
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      has_received_payment: !!successfulTransaction,
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    next(error);
  }
};
