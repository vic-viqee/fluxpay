import { Router } from 'express';
import { 
  initiatePayment, 
  getTransactions, 
  getTransaction,
  getDashboardStats,
  createPaymentLink,
  getPaymentLinks,
  deletePaymentLink,
  getPaymentLinkByCode,
  payPaymentLink,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  handleMpesaCallback
} from './gateway.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate, gatewayPaymentSchema, paymentLinkSchema, customerSchema } from '../../middleware/validation';

const router = Router();

router.post('/initiate', authMiddleware, validate(gatewayPaymentSchema), initiatePayment);
router.get('/transactions', authMiddleware, getTransactions);
router.get('/transactions/:id', authMiddleware, getTransaction);
router.get('/dashboard', authMiddleware, getDashboardStats);

router.post('/payment-links', authMiddleware, validate(paymentLinkSchema), createPaymentLink);
router.get('/payment-links', authMiddleware, getPaymentLinks);
router.delete('/payment-links/:id', authMiddleware, deletePaymentLink);

router.get('/pay/:code', getPaymentLinkByCode);
router.post('/pay/:code', payPaymentLink);

router.get('/customers', authMiddleware, getCustomers);
router.post('/customers', authMiddleware, validate(customerSchema), createCustomer);
router.put('/customers/:id', authMiddleware, updateCustomer);
router.delete('/customers/:id', authMiddleware, deleteCustomer);

router.post('/callback', handleMpesaCallback);

export default router;
