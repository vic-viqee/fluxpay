import { Request, Response, NextFunction } from 'express';
// Removed `import { AuthenticatedRequest } from '../../middleware/auth.middleware';`
import logger from '../../utils/logger';
import Transaction from '../../models/Transaction'; // Import Transaction model
import { IUser } from '../../models/User';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Cast req.user to IUser
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
      role: user.role,
      businessName: user.businessName,
      businessType: user.businessType,
      kraPin: user.kraPin,
      businessTillOrPaybill: user.businessTillOrPaybill,
      businessPhoneNumber: user.businessPhoneNumber,
      preferredPaymentMethod: user.preferredPaymentMethod,
      businessDescription: user.businessDescription,
      logoUrl: user.logoUrl,
      plan: user.plan,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      has_received_payment: !!successfulTransaction,
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    next(error);
  }
};
