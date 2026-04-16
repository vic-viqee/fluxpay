import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const readEnv = (key: string, fallback?: string) => {
  const value = process.env[key] || fallback;
  if (!value && !isProduction) {
    console.warn(`Warning: Environment variable ${key} is not set. Using default/fallback.`);
  }
  return value;
};

const requireInProduction = (key: string, value: string | undefined) => {
  if (isProduction && !value) {
    throw new Error(`Missing required environment variable in production: ${key}`);
  }
};

const jwtSecret = readEnv('JWT_SECRET');
const jwtRefreshSecret = readEnv('JWT_REFRESH_SECRET');

requireInProduction('JWT_SECRET', jwtSecret);
requireInProduction('JWT_REFRESH_SECRET', jwtRefreshSecret);

const generateDevSecret = (purpose: string) => {
  if (!isProduction && !jwtSecret) {
    const devSecret = `dev_${purpose}_${Date.now()}_not_for_production`;
    console.warn(`Warning: Using temporary dev secret for ${purpose}. Set JWT_SECRET in .env for consistency.`);
    return devSecret;
  }
  return jwtSecret!;
};

const config = {
  port: readEnv('PORT', '3000'),
  jwtSecret: generateDevSecret('main'),
  jwtRefreshSecret: generateDevSecret('refresh'),
  jwtAccessExpiresIn: readEnv('JWT_ACCESS_EXPIRES_IN', '1h'),
  jwtRefreshExpiresIn: readEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  mongoUri: readEnv('MONGODB_URI', 'mongodb://localhost:27017/fluxpay') || 'mongodb://localhost:27017/fluxpay',
  frontendUrl: readEnv('FRONTEND_URL', 'http://localhost:5173'),
  backendUrl: readEnv('BACKEND_URL', 'http://localhost:3000'),

  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'no-reply@fluxpay.com',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
  },

  mpesa: {
    consumerKey: process.env.CONSUMER_KEY || '',
    consumerSecret: process.env.CONSUMER_SECRET || '',
    shortCode: process.env.SHORTCODE || '',
    passKey: process.env.PASSKEY || '',
    callbackUrl: process.env.CALLBACK_URL || '',
    initiatorName: process.env.INITIATOR_NAME || 'testapi',
  },

};

export default config;
