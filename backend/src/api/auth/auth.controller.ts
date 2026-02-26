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

  return config.backendUrl.replace(/\/+$/, '');
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
      // logoUrl is now handled by req.file
      plan
    } = req.body;

    let logoUrl = '';
    if (req.file) {
      logoUrl = `${getBackendBaseUrl(req)}/uploads/${req.file.filename}`;
    }

    // Email, password, businessName, and businessPhoneNumber are now required.
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
      logoUrl, // Assign the constructed logoUrl
      plan
    });
    await newUser.save();

    logger.info(`New user signed up: ${email}, Business: ${businessName}, Plan: ${plan || 'N/A'}`);
    res.status(201).json({ message: 'User registered successfully' });
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
    const code = generateGoogleAuthCode(token, refreshToken);
    return res.redirect(`${config.frontendUrl}/auth/google/callback?code=${code}`);
  }

  if (authInfo && authInfo.message === 'Registration required' && authInfo.profile) {
    try {
      const ticket = generateGoogleRegistrationTicket(authInfo.profile);
      return res.redirect(`${config.frontendUrl}/google-register-complete?ticket=${encodeURIComponent(ticket)}`);
    } catch (error) {
      logger.error('Failed to generate Google registration ticket:', error);
      return res.redirect(`${config.frontendUrl}/login`);
    }
  }
  
  // Default to login page if something unexpected happened
  return res.redirect(`${config.frontendUrl}/login`);
}; // CLOSING BRACE HERE

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
      kraPin, // Optional
      businessTillOrPaybill, // Optional
      preferredPaymentMethod, // Optional
      businessDescription, // Optional
      plan // Optional
    } = req.body;

    let logoUrl = '';
    if (req.file) {
      logoUrl = `${getBackendBaseUrl(req)}/uploads/${req.file.filename}`;
    }

    if (!ticket || typeof ticket !== 'string') {
      await safeUnlink(req.file?.path);
      return res.status(400).json({ message: 'Registration ticket is required.' });
    }

    // Validate required business fields
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
    if (consumedTicketJti) {
      usedGoogleRegistrationTickets.delete(consumedTicketJti);
    }
    await safeUnlink(req.file?.path);
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
