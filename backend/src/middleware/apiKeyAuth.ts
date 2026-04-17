import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import ApiKey from '../models/ApiKey';
import logger from '../utils/logger';

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-api-key'] as string;
    const secret = req.headers['x-api-secret'] as string;

    if (!key || !secret) {
      return res.status(401).json({ message: 'API key and secret are required' });
    }

    const apiKey = await ApiKey.findOne({ key, isActive: true });
    if (!apiKey) {
      logger.warn(`Invalid API key: ${key}`);
      return res.status(401).json({ message: 'Invalid API key or secret' });
    }

    const isValidSecret = await bcrypt.compare(secret, apiKey.secret);
    if (!isValidSecret) {
      logger.warn(`Invalid API secret for key: ${key}`);
      return res.status(401).json({ message: 'Invalid API key or secret' });
    }

    apiKey.lastUsedAt = new Date();
    await apiKey.save();

    req.apiKeyOwnerId = apiKey.ownerId;
    next();
  } catch (error) {
    logger.error('API Key auth error:', error);
    next(error);
  }
};

declare global {
  namespace Express {
    interface Request {
      apiKeyOwnerId?: import('mongoose').Types.ObjectId;
    }
  }
}