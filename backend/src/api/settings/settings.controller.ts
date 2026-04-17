import { Request, Response, NextFunction } from 'express';
import { IUser } from '../../models/User';
import User from '../../models/User';
import config from '../../config';
import { isCloudinaryConfigured } from '../../utils/uploads';

const getBackendBaseUrl = (req: Request) => {
  const configuredBackendUrl = (process.env.BACKEND_URL || '').trim();
  if (configuredBackendUrl) {
    return configuredBackendUrl.replace(/\/+$/, '');
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string' && forwardedProto.length > 0
      ? forwardedProto.split(',')[0].trim()
      : req.protocol;
  const host = req.get('host');
  if (host) {
    return `${protocol}://${host}`;
  }

  return (config.backendUrl || 'http://localhost:3000').replace(/\/+$/, '');
};

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    if (!user?._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    return res.status(200).json({
      businessName: user.businessName || '',
      businessType: user.businessType || '',
      kraPin: user.kraPin || '',
      businessTillOrPaybill: user.businessTillOrPaybill || '',
      businessPhoneNumber: user.businessPhoneNumber || '',
      preferredPaymentMethod: user.preferredPaymentMethod || 'M-Pesa STK Push',
      businessDescription: user.businessDescription || '',
      logoUrl: user.logoUrl || '',
      plan: user.plan || '',
      email: user.email,
      username: user.username || '',
      serviceType: user.serviceType || 'both',
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as IUser;
    if (!user?._id) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const allowedFields = [
      'username',
      'businessName',
      'businessType',
      'kraPin',
      'businessTillOrPaybill',
      'businessPhoneNumber',
      'preferredPaymentMethod',
      'businessDescription',
      'logoUrl',
      'serviceType',
    ] as const;

    const updatePayload: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updatePayload[field] = req.body[field];
      }
    }

    if (req.file) {
      if (isCloudinaryConfigured()) {
        updatePayload.logoUrl = req.file.path;
      } else {
        updatePayload.logoUrl = `${getBackendBaseUrl(req)}/uploads/${req.file.filename}`;
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: 'No valid settings fields provided.' });
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User settings updated successfully',
      settings: {
        businessName: updatedUser.businessName || '',
        businessType: updatedUser.businessType || '',
        kraPin: updatedUser.kraPin || '',
        businessTillOrPaybill: updatedUser.businessTillOrPaybill || '',
        businessPhoneNumber: updatedUser.businessPhoneNumber || '',
        preferredPaymentMethod: updatedUser.preferredPaymentMethod || 'M-Pesa STK Push',
        businessDescription: updatedUser.businessDescription || '',
        logoUrl: updatedUser.logoUrl || '',
        plan: updatedUser.plan || '',
        email: updatedUser.email,
        username: updatedUser.username || '',
        serviceType: updatedUser.serviceType || 'both',
      },
    });
  } catch (error) {
    next(error);
  }
};
