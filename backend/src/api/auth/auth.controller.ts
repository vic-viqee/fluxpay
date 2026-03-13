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

// Augment Request type to include authInfo from Passport.js
declare module 'express-serve-static-core' {
  interface Request {
    authInfo?: { message: string; profile: Profile };
    file?: Express.Multer.File; // Add Multer's file property to Request
  }
}

interface GoogleRegistrationTicketClaims extends jwt.JwtPayload {
  purpose: 'google_registration';
  googleId: string;
  email: string;
  username: string;
  jti: string;
}

const googleAuthCodeStore = new Map<string, { token: string; refreshToken: string; expiresAt: number }>();
const usedGoogleRegistrationTickets = new Map<string, number>();

const CLEANUP_INTERVAL = 60_000;

const pruneExpiredStores = () => {
  const now = Date.now();

  for (const [code, entry] of googleAuthCodeStore.entries()) {
    if (entry.expiresAt <= now) {
      googleAuthCodeStore.delete(code);
    }
  }

  for (const [jti, expiresAt] of usedGoogleRegistrationTickets.entries()) {
    if (expiresAt <= now) {
      usedGoogleRegistrationTickets.delete(jti);
    }
  }
};

setInterval(pruneExpiredStores, CLEANUP_INTERVAL).unref();

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

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearAuthCookies = (res: Response) => {
  res.cookie('accessToken', '', { httpOnly: true, maxAge: 0 });
  res.cookie('refreshToken', '', { httpOnly: true, maxAge: 0 });
};

const generateGoogleAuthCode = (token: string, refreshToken: string) => {
  const code = crypto.randomBytes(24).toString('hex');
  googleAuthCodeStore.set(code, {
    token,
    refreshToken,
    expiresAt: Date.now() + 2 * 60 * 1000,
  });
  return code;
};

const generateGoogleRegistrationTicket = (profile: Profile) => {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error('Google profile email is required.');
  }

  return jwt.sign(
    {
      purpose: 'google_registration',
      googleId: profile.id,
      email,
      username: profile.displayName || email.split('@')[0],
      jti: crypto.randomBytes(16).toString('hex'),
    },
    config.jwtSecret,
    { expiresIn: '10m' }
  );
};

const verifyGoogleRegistrationTicket = (ticket: string) => {
  const decoded = jwt.verify(ticket, config.jwtSecret) as GoogleRegistrationTicketClaims;
  if (
    decoded.purpose !== 'google_registration' ||
    !decoded.googleId ||
    !decoded.email ||
    !decoded.username ||
    !decoded.jti
  ) {
    throw new Error('Invalid registration ticket.');
  }

  const expiresAt =
    typeof decoded.exp === 'number' ? decoded.exp * 1000 : Date.now() + 10 * 60 * 1000;

  return {
    googleId: decoded.googleId,
    email: decoded.email,
    username: decoded.username,
    jti: decoded.jti,
    expiresAt,
  };
};

const safeUnlink = async (filePath?: string) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // Best-effort cleanup only.
  }
};

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

const isStrongPassword = (password: string) => {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
};

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
      plan
    } = req.body;

    let logoUrl = '';
    if (req.file) {
      logoUrl = `${getBackendBaseUrl(req)}/uploads/${req.file.filename}`;
    }

    if (!email || !password || !businessName || !businessPhoneNumber) {
      await safeUnlink(req.file?.path);
      return res.status(400).json({ message: 'Email, password, business name, and business phone number are required' });
    }

    if (!isStrongPassword(password)) {
      await safeUnlink(req.file?.path);
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await safeUnlink(req.file?.path);
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

    logger.info(`New user signed up: ${email}, Business: ${businessName}`);
    
    // AUTO-LOGIN: Generate tokens immediately after signup
    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    setAuthCookies(res, token, refreshToken);

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        businessName: newUser.businessName
      } 
    });
  } catch (error) {
    await safeUnlink(req.file?.path);
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

    setAuthCookies(res, token, refreshToken);

    logger.info(`User logged in: ${email}`);
    res.status(200).json({ message: 'Logged in successfully', user });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providedToken =
      req.cookies?.refreshToken ||
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
    
    setAuthCookies(res, newAccessToken, newRefreshToken);
    
    return res.status(200).json({ token: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as IUser; 
  const authInfo = req.authInfo;

  if (user) {
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const code = generateGoogleAuthCode(token, refreshToken);
    return res.redirect(`${config.frontendUrl}/auth/google/callback?code=${code}`);
  }

  if (authInfo && authInfo.message === 'Registration required' && authInfo.profile) {
    try {
      const ticket = generateGoogleRegistrationTicket(authInfo.profile);
      return res.redirect(`${config.frontendUrl}/auth/google/callback?ticket=${encodeURIComponent(ticket)}`);
    } catch (error) {
      logger.error('Failed to generate Google registration ticket:', error);
      return res.redirect(`${config.frontendUrl}/login`);
    }
  }
  
  return res.redirect(`${config.frontendUrl}/login`);
};

export const exchangeGoogleAuthCode = async (req: Request, res: Response) => {
  pruneExpiredStores();
  const { code } = req.body || {};

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Authorization code is required.' });
  }

  const entry = googleAuthCodeStore.get(code);
  if (!entry) {
    return res.status(400).json({ message: 'Invalid authorization code.' });
  }

  if (entry.expiresAt < Date.now()) {
    googleAuthCodeStore.delete(code);
    return res.status(400).json({ message: 'Authorization code has expired.' });
  }
  googleAuthCodeStore.delete(code);
  return res.status(200).json({ token: entry.token, refreshToken: entry.refreshToken });
};

export const googleRegistrationContext = async (req: Request, res: Response) => {
  pruneExpiredStores();
  const { ticket } = req.body || {};

  if (!ticket || typeof ticket !== 'string') {
    return res.status(400).json({ message: 'Registration ticket is required.' });
  }

  try {
    const { username, email, jti } = verifyGoogleRegistrationTicket(ticket);
    if (usedGoogleRegistrationTickets.has(jti)) {
      return res.status(409).json({ message: 'Registration ticket has already been used.' });
    }
    return res.status(200).json({ username, email });
  } catch {
    return res.status(400).json({ message: 'Invalid or expired registration ticket.' });
  }
};

export const googleCompleteRegistration = async (req: Request, res: Response, next: NextFunction) => {
  let consumedTicketJti: string | null = null;
  try {
    pruneExpiredStores();
    const {
      ticket,
      businessName, 
      businessType, 
      businessPhoneNumber,
      kraPin,
      businessTillOrPaybill,
      preferredPaymentMethod,
      businessDescription,
      plan
    } = req.body;

    let logoUrl = '';
    if (req.file) {
      logoUrl = `${getBackendBaseUrl(req)}/uploads/${req.file.filename}`;
    }

    if (!ticket || typeof ticket !== 'string') {
      await safeUnlink(req.file?.path);
      return res.status(400).json({ message: 'Registration ticket is required.' });
    }

    if (!businessName || !businessType || !businessPhoneNumber) {
      await safeUnlink(req.file?.path);
      return res.status(400).json({ message: 'Missing required registration details.' });
    }

    const { username, email, googleId, jti, expiresAt } = verifyGoogleRegistrationTicket(ticket);

    if (usedGoogleRegistrationTickets.has(jti)) {
      await safeUnlink(req.file?.path);
      return res.status(409).json({ message: 'Registration ticket has already been used.' });
    }

    usedGoogleRegistrationTickets.set(jti, expiresAt);
    consumedTicketJti = jti;

    const existingByGoogleId = await User.findOne({ googleId });
    if (existingByGoogleId) {
      const token = generateAccessToken(existingByGoogleId);
      const refreshToken = generateRefreshToken(existingByGoogleId);
      logger.info(`Existing Google user completed registration flow: ${email}`);
      return res.status(200).json({ message: 'Logged in successfully', token, refreshToken, user: existingByGoogleId });
    }

    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      if (!existingByEmail.googleId) {
        existingByEmail.googleId = googleId;
        await existingByEmail.save();
        const token = generateAccessToken(existingByEmail);
        const refreshToken = generateRefreshToken(existingByEmail);
        logger.info(`Existing user linked with Google: ${email}`);
        return res.status(200).json({ message: 'Account linked successfully', token, refreshToken, user: existingByEmail });
      }

      return res.status(409).json({ message: 'User with that email already exists and is linked to another Google account.' });
    }

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
      logoUrl,
      plan
    });
    await newUser.save();

    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    logger.info(`New Google user registered: ${email}, Business: ${businessName}`);
    res.status(201).json({ message: 'User registered successfully', token, refreshToken, user: newUser });

  } catch (error) {
    if (consumedTicketJti) {
      usedGoogleRegistrationTickets.delete(consumedTicketJti);
    }
    await safeUnlink(req.file?.path);
    logger.error('Google complete registration error:', error);
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  let user; 
  try {
    const { email } = req.body;
    user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // HASH TOKEN before saving to DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); 

    await user.save();

    // Send UNHASHED token in email
    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
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

    // Hash the incoming token to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

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

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'New password does not meet security requirements.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    logger.info(`User changed password: ${user.email}`);
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
