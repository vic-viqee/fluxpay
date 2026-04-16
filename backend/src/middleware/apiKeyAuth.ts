import { Request, Response, NextFunction } from 'express';
import { findApiKey } from '../services/webhook.service';
import logger from '../utils/logger';

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers['x-api-key'] as string;
    const secret = req.headers['x-api-secret'] as string;

    if (!key || !secret) {
      return res.status(401).json({ message: 'API key and secret are required' });
    }

    const result = await findApiKey(key);
    if (!result) {
      logger.warn(`Invalid API key: ${key}`);
      return res.status(401).json({ message: 'Invalid API key or secret' });
    }

    if (result.apiKey.secret !== secret) {
      logger.warn(`Invalid API secret for key: ${key}`);
      return res.status(401).json({ message: 'Invalid API key or secret' });
    }

    req.apiKeyOwnerId = result.ownerId;
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