import { Request, Response, NextFunction } from 'express';
// Removed `import { AuthenticatedRequest } from '../../middleware/auth.middleware';`
import { IUser } from '../../models/User';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Cast req.user to IUser
    // In a real implementation, you would fetch customer data associated with the user
    // For now, we will just return a placeholder
    res.status(200).json({ message: 'Customer data will be here', userId: user._id });
  } catch (error) {
    next(error);
  }
};
