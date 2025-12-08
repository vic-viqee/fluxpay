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
import connectDB from './config/db';

const app: Express = express();
const port = config.port;

// Connect to database
connectDB();

app.use(cors());
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

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
