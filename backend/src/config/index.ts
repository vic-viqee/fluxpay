import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey', // Fallback for dev, but should be strong
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fluxpay',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

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
  },

};

export default config;
