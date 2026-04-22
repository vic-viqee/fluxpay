import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User, { IUser } from '../models/User';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const cookieToken = req.cookies?.accessToken;
  const bearerToken = authHeader?.replace('Bearer ', '');
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token is invalid' });
    }
    res.status(401).json({ message: 'Token verification failed' });
  }
};