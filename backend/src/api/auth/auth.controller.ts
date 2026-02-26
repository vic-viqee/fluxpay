import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../../config';
import logger from '../../utils/logger';
import User, {IUser} from '../../models/User';
import { sendResetPasswordEmail } from '../../services/email.service';
import { Profile } from 'passport-google-oauth20'; // Import Profile type
import fs from 'fs'; // NEW IMPORT
import path from 'path'; // NEW IMPORT

// Augment Request type to include authInfo from Passport.js
declare module 'express-serve-static-core' {
  interface Request {
    authInfo?: { message: string; profile: Profile };
    file?: Express.Multer.File; // Add Multer's file property to Request
  }
}

const generateAccessToken = (user: IUser) =>
  jwt.sign(
    { id: user._id, email: user.email },
    config.jwtSecret,
    {
      expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
    }
  );

const generateRefreshToken = (user: IUser) =>
  jwt.sign({ id: user._id, email: user.email }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

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
      // logoUrl is now handled by req.file
      plan
    } = req.body;

    let logoUrl = '';
    if (req.file) {
      logoUrl = `${config.backendUrl}/uploads/${req.file.filename}`; // Corrected to use backendUrl
    }

    // Email, password, businessName, and businessPhoneNumber are now required.
    if (!email || !password || !businessName || !businessPhoneNumber) {
      if (req.file) { fs.unlinkSync(req.file.path); } // Clean up uploaded file
      return res.status(400).json({ message: 'Email, password, business name, and business phone number are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (req.file) { fs.unlinkSync(req.file.path); } // Clean up uploaded file
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
      logoUrl, // Assign the constructed logoUrl
      plan
    });
    await newUser.save();

    logger.info(`New user signed up: ${email}, Business: ${businessName}, Plan: ${plan || 'N/A'}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (req.file) { fs.unlinkSync(req.file.path); } // Clean up uploaded file on any error
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

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`User logged in: ${email}`);
    res.status(200).json({ message: 'Logged in successfully', token, refreshToken, user });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providedToken =
      req.body?.refreshToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!providedToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(providedToken, config.jwtRefreshSecret) as { id: string; email: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token user.' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    return res.status(200).json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

export const googleCallback = (req: Request, res: Response) => {
  // logger.info("googleCallback function entered."); // Removed temporary log
  // logger.info(`googleCallback: Redirecting with config.frontendUrl: ${config.frontendUrl}`); // Removed temporary log
  const user = req.user as IUser; // Cast req.user to IUser
  // Passport.js places info object in req.authInfo on failure or special conditions
  const authInfo = req.authInfo;

  if (user) {
    // Existing user or successfully created user, proceed with login
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return res.redirect(`${config.frontendUrl}/auth/google/callback?token=${token}&refreshToken=${refreshToken}`);
  }

  if (authInfo && authInfo.message === 'Registration required' && authInfo.profile) {
    // New Google user, redirect to frontend to complete registration
    const { displayName, emails, id } = authInfo.profile; // Added id for googleId
    const email = emails?.[0]?.value;
    const username = displayName;
    const googleId = id; // Get googleId from profile

    const queryParams = new URLSearchParams();
    if (username) queryParams.append('username', username);
    if (email) queryParams.append('email', email);
    if (googleId) queryParams.append('googleId', googleId); // Add googleId

    return res.redirect(`${config.frontendUrl}/google-register-complete?${queryParams.toString()}`);
  }
  
  // Default to login page if something unexpected happened
  return res.redirect(`${config.frontendUrl}/login`);
}; // CLOSING BRACE HERE

export const googleCompleteRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      username, 
      email, 
      googleId,
      businessName, 
      businessType, 
      businessPhoneNumber,
      kraPin, // Optional
      businessTillOrPaybill, // Optional
      preferredPaymentMethod, // Optional
      businessDescription, // Optional
      plan // Optional
    } = req.body;

    let logoUrl = '';
    if (req.file) {
      logoUrl = `${config.backendUrl}/uploads/${req.file.filename}`; // Corrected to use backendUrl
    }

    // Validate required fields
    if (!username || !email || !googleId || !businessName || !businessType || !businessPhoneNumber) {
      if (req.file) { fs.unlinkSync(req.file.path); } // Clean up uploaded file
      return res.status(400).json({ message: 'Missing required registration details.' });
    }

    // Check if user already exists (e.g., by email or googleId)
    const existingUser = await User.findOne({ $or: [{ email }, { googleId }] });
    if (existingUser) {
      if (req.file) { fs.unlinkSync(req.file.path); } // Clean up uploaded file
      // If a user with that email already exists but doesn't have a googleId, link the googleId
      if (existingUser.email === email && !existingUser.googleId) {
        existingUser.googleId = googleId;
        await existingUser.save();
        const token = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser);
        logger.info(`Existing user linked with Google: ${email}`);
        return res.status(200).json({ message: 'Account linked successfully', token, refreshToken, user: existingUser });
      }
      return res.status(409).json({ message: 'User with that email or Google ID already exists' });
    }

    // Create new user with Google details and provided business info
    const newUser = new User({
      googleId,
      username,
      email,
      businessName,
      businessType,
      businessPhoneNumber,
      kraPin,
      businessTillOrPaybill,
      preferredPaymentMethod,
      businessDescription,
      logoUrl, // Assign the constructed logoUrl
      plan
    });
    await newUser.save();

    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    logger.info(`New Google user registered: ${email}, Business: ${businessName}`);
    res.status(201).json({ message: 'User registered successfully', token, refreshToken, user: newUser });

  } catch (error) {
    if (req.file) { fs.unlinkSync(req.file.path); } // Clean up uploaded file on any error
    logger.error('Google complete registration error:', error);
    next(error);
  }
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
