import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import authRoutes from './api/auth/auth.routes';
import paymentRoutes from './api/payments/payments.routes';
import subscriptionRoutes from './api/subscriptions/subscriptions.routes';
import customerRoutes from './api/customers/customers.routes';
import analyticsRoutes from './api/analytics/analytics.routes';
import settingsRoutes from './api/settings/settings.routes';
import docsRoutes from './api/docs.routes';
import userRoutes from './api/users/users.routes';
import transactionRoutes from './api/transactions/transactions.routes';
import plansRoutes from './api/plans/plans.routes';
import clientsRoutes from './api/clients/clients.routes';
import apikeysRoutes from './api/apikeys/apikeys.routes';
import thirdpartyRoutes from './api/thirdparty/thirdparty.routes';
import invoicesRoutes from './api/invoices/invoices.routes';
import mpesaRoutes from './api/mpesa/mpesa.routes';
import disbursementRoutes from './api/disbursements/disbursements.routes';
import adminRoutes from './api/admin/admin.routes';
import connectDB from './config/db';
import cron from 'node-cron';
import { processDuePayments, processFailedTransactions } from './services/billing.service';
import passport from './config/passport';
import securityHeaders from './middleware/securityHeaders';
import { globalRateLimiter } from './middleware/rateLimit';
import { resolveUploadsDir } from './utils/uploads';

const app: Express = express();
const port = parseInt(process.env.PORT || config.port || '3000', 10);

// Connect to database
(async () => {
  try {
    await connectDB();
  } catch (error) {
    logger.error('Failed to connect to the database. Exiting...', error);
    process.exit(1);
  }
})();

// --- CORS CONFIGURATION ---
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  if (envOrigins) {
    const parsedOrigins = envOrigins.split(',').map(o => o.trim()).filter(Boolean);
    return [...new Set([...defaultOrigins, ...parsedOrigins])];
  }
  
  return defaultOrigins;
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'X-API-Key', 'X-API-Secret'],
}));
// --------------------------------

app.use(express.json());
app.use(cookieParser());
app.use(securityHeaders);
app.use(globalRateLimiter);
app.use(requestLogger);

app.use(passport.initialize());

// Serve static files from the resolved uploads directory.
const uploadsDir = resolveUploadsDir();
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req: Request, res: Response) => {
  res.send('FluxPay API is running...');
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/apikeys', apikeysRoutes);
app.use('/api/v1', thirdpartyRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/disbursements', disbursementRoutes);
app.use('/api/admin', adminRoutes);

// Schedule daily tasks
cron.schedule('0 0 * * *', () => { // Runs daily at midnight
  logger.info('Running daily billing tasks...');
  processDuePayments();
  processFailedTransactions();
});

// Error handling middleware
app.use(errorHandler);

app.listen(Number(port), '0.0.0.0', () => {
  logger.info(`[server]: Server is running at http://0.0.0.0:${port}`);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});
