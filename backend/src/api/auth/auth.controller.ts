import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../../config';
import logger from '../../utils/logger';
import User, {IUser} from '../../models/User';
import { sendResetPasswordEmail } from '../../services/email.service';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      username, 
      email, 
      password, 
      businessName, 
      businessType, 
      kraPin,
      businessTillOrPaybill,
      businessPhoneNumber,
      preferredPaymentMethod,
      businessDescription,
      logoUrl, // Assuming logo upload handled separately or logoUrl passed directly
      plan
    } = req.body;

    // Email, password, businessName, and businessPhoneNumber are now required.
    if (!email || !password || !businessName || !businessPhoneNumber) {
      return res.status(400).json({ message: 'Email, password, business name, and business phone number are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword,
      businessName,
      businessType,
      kraPin,
      businessTillOrPaybill,
      businessPhoneNumber,
      preferredPaymentMethod,
      businessDescription,
      logoUrl,
      plan
    });
    await newUser.save();

    logger.info(`New user signed up: ${email}, Business: ${businessName}, Plan: ${plan || 'N/A'}`);
    res.status(201).json({ message: 'User registered successfully' });
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

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, { expiresIn: '1h' });

    logger.info(`User logged in: ${email}`);
    res.status(200).json({ message: 'Logged in successfully', token, user });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as IUser; // Cast req.user to IUser
  if (!user) {
    return res.redirect(`${config.frontendUrl}/login`);
  }
  const token = jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, { expiresIn: '1h' });
  res.redirect(`${config.frontendUrl}/auth/google/callback?token=${token}`);
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  let user; // Declare user outside try-catch for catch block access
  try {
    const { email } = req.body;
    user = await User.findOne({ email });

    if (!user) {
      // Send a success message even if user not found to prevent email enumeration
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await user.save();

    // Send the email
    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    // Check if user was found before trying to clear fields
    if (user) { 
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
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
