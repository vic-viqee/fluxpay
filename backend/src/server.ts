import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';
import authRoutes from './api/auth/auth.routes';
import paymentRoutes from './api/payments/payments.routes';
import subscriptionRoutes from './api/subscriptions/subscriptions.routes';
import customerRoutes from './api/customers/customers.routes';
import analyticsRoutes from './api/analytics/analytics.routes';
import settingsRoutes from './api/settings/settings.routes';
import docsRoutes from './api/docs.routes';
import userRoutes from './api/users/users.routes';
import transactionRoutes from './api/transactions/transactions.routes';
import plansRoutes from './api/plans/plans.routes'; // NEW IMPORT
import clientsRoutes from './api/clients/clients.routes'; // NEW IMPORT
import connectDB from './config/db';
import cron from 'node-cron'; // NEW IMPORT
import { processDuePayments, processFailedTransactions } from './services/billing.service'; // NEW IMPORT

const app: Express = express();
const port = config.port;

// Connect to database
connectDB();

// --- FIXED CORS CONFIGURATION ---
const allowedOrigins = [
  'http://localhost:5173',                  // Local Frontend (Vite)
  'http://localhost:3000',                  // Local Backend/Testing
  'https://fluxpay-frontend.onrender.com'   // <--- YOUR LIVE RENDER FRONTEND
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Required for cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// --------------------------------

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('FluxPay API is running...');
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
app.use('/api/clients', clientsRoutes); // NEW USAGE // NEW USAGE

// Schedule daily tasks
cron.schedule('0 0 * * *', () => { // Runs daily at midnight
  logger.info('Running daily billing tasks...');
  processDuePayments();
  processFailedTransactions();
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});