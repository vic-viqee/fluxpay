import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const readEnv = (key: string, fallback = '') => process.env[key] || fallback;

const requireInProduction = (key: string, value: string) => {
  if (isProduction && !value) {
    throw new Error(`Missing required environment variable in production: ${key}`);
  }
};

const jwtSecret = readEnv('JWT_SECRET', isProduction ? '' : 'supersecretjwtkey');
const jwtRefreshSecret = readEnv(
  'JWT_REFRESH_SECRET',
  isProduction ? '' : `${jwtSecret || 'supersecretjwtkey'}_refresh`
);

requireInProduction('JWT_SECRET', jwtSecret);
requireInProduction('JWT_REFRESH_SECRET', jwtRefreshSecret);

const config = {
  port: readEnv('PORT', '3000'),
  jwtSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn: readEnv('JWT_ACCESS_EXPIRES_IN', '1h'),
  jwtRefreshExpiresIn: readEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  mongoUri: readEnv('MONGODB_URI', 'mongodb://localhost:27017/fluxpay'),
  frontendUrl: readEnv('FRONTEND_URL', 'https://fluxpay-frontend.onrender.com'),
  backendUrl: readEnv('BACKEND_URL', 'http://localhost:3000'),

  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // Use 'true' or 'false' in .env
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password',
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://fluxpay-backend.onrender.com/api/auth/google/callback',
  },

  mpesa: {
    consumerKey: process.env.CONSUMER_KEY || '',
    consumerSecret: process.env.CONSUMER_SECRET || '',
    shortCode: process.env.SHORTCODE || '',
    passKey: process.env.PASSKEY || '',
    callbackUrl: process.env.CALLBACK_URL || '',
  },

};

export default config;
