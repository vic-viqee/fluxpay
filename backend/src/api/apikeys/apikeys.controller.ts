import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import ApiKey from '../../models/ApiKey';
import logger from '../../utils/logger';
import { IUser } from '../../models/User';

const generateKeyPair = (): { key: string; secret: string } => {
  const key = `fpk_${crypto.randomBytes(16).toString('hex')}`;
  const secret = crypto.randomBytes(32).toString('hex');
  return { key, secret };
};

export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const user = req.user as IUser;
    const ownerId = user._id;

    if (!name) {
      return res.status(400).json({ message: 'API key name is required' });
    }

    const { key, secret } = generateKeyPair();
    const hashedSecret = await bcrypt.hash(secret, 10);

    const apiKey = await ApiKey.create({
      key,
      secret: hashedSecret,
      name,
      ownerId,
    });

    logger.info(`API key created: ${key} for user: ${user.email}`);

    res.status(201).json({
      message: 'API key created successfully. Save the secret now - it cannot be retrieved later.',
      data: {
        id: apiKey._id,
        key: apiKey.key,
        secret: secret,
        name: apiKey.name,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    logger.error('Create API key error:', error);
    next(error);
  }
};

export const listApiKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    const ownerId = user._id;

    const apiKeys = await ApiKey.find({ ownerId })
      .select('-secret')
      .sort({ createdAt: -1 });

    res.status(200).json({ data: apiKeys });
  } catch (error) {
    logger.error('List API keys error:', error);
    next(error);
  }
};

export const revokeApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user as IUser;
    const ownerId = user._id;

    const apiKey = await ApiKey.findOne({ _id: id, ownerId });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    apiKey.isActive = false;
    await apiKey.save();

    logger.info(`API key revoked: ${apiKey.key} for user: ${user.email}`);

    res.status(200).json({ message: 'API key revoked successfully' });
  } catch (error) {
    logger.error('Revoke API key error:', error);
    next(error);
  }
};

export const deleteApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user as IUser;
    const ownerId = user._id;

    const apiKey = await ApiKey.findOneAndDelete({ _id: id, ownerId });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    logger.info(`API key deleted: ${apiKey.key} for user: ${user.email}`);

    res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error) {
    logger.error('Delete API key error:', error);
    next(error);
  }
};