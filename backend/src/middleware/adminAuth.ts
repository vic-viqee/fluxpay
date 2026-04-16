import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking admin status' });
  }
};