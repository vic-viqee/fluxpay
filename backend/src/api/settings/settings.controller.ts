import { Request, Response, NextFunction } from 'express';
// Removed `import { AuthenticatedRequest } from '../../middleware/auth.middleware';`
import { IUser } from '../../models/User';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Cast req.user to IUser
    // In a real implementation, you would fetch user settings
    // For now, we will just return a placeholder
    res.status(200).json({ message: 'User settings will be here', userId: user._id });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser; // Cast req.user to IUser
    // In a real implementation, you would update user settings
    // For now, we will just return a placeholder
    res.status(200).json({ message: 'User settings updated successfully', userId: user._id });
  } catch (error) {
    next(error);
  }
};
