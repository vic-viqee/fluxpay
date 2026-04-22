import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../../config';
import logger from '../../utils/logger';
import User from '../../models/User';
import { sendResetPasswordEmail } from '../../services/email.service';

const generateAccessToken = (user: any) =>
  jwt.sign(
    { id: user._id, email: user.email, gateway: true },
    config.jwtSecret,
    { expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] }
  );

const generateRefreshToken = (user: any) =>
  jwt.sign(
    { id: user._id, email: user.email, gateway: true },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000,
    path: '/',
    domain: isProduction ? '.onrender.com' : undefined,
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: isProduction ? '.onrender.com' : undefined,
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, businessName, businessPhoneNumber, businessTillOrPaybill, businessType } = req.body;

    if (!email || !password || !businessName || !businessPhoneNumber) {
      return res.status(400).json({ 
        message: 'Email, password, businessName, and businessPhoneNumber are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      businessName,
      businessPhoneNumber,
      businessTillOrPaybill,
      businessType: businessType || 'retail',
      serviceType: 'gateway',
      role: 'user'
    });

    await newUser.save();

    logger.info(`New gateway user signed up: ${email}`);

    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    setAuthCookies(res, token, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      token,
      refreshToken,
      user: {
        _id: newUser._id,
        email: newUser.email,
        businessName: newUser.businessName,
        businessPhoneNumber: newUser.businessPhoneNumber,
        serviceType: newUser.serviceType
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, serviceType: 'gateway' }).select('+password');
    
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.info(`Gateway user logged in: ${email}`);

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    setAuthCookies(res, token, refreshToken);

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        businessName: user.businessName,
        businessPhoneNumber: user.businessPhoneNumber,
        serviceType: user.serviceType
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, serviceType: 'gateway' });

    if (!user) {
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      serviceType: 'gateway'
    }).select('+password');

    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired.' 
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
};