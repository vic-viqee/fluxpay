import { Router } from 'express';
import { initiatePayment, handleCallback, simulateStkPush, initiatePricingStkPush } from './payments.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { createRateLimiter } from '../../middleware/rateLimit';

const router = Router();

const pricingIpLimiter = createRateLimiter({
  windowMs: 10 * 60_000,
  maxRequests: 10,
  message: 'Too many pricing checkout attempts from this IP. Try again later.',
});

const pricingPhoneLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 1,
  keyFn: (req) => {
    const phone = String(req.body?.phoneNumber || '').replace(/\D/g, '');
    return phone ? `phone:${phone}` : `no-phone:${req.ip}`;
  },
  message: 'Please wait before sending another STK push to this phone number.',
});

router.post('/stk-push', authMiddleware, initiatePayment);
router.post('/simulate-stk-push', authMiddleware, simulateStkPush); // New route for simulation
router.post('/pricing-stk-push', pricingIpLimiter, pricingPhoneLimiter, initiatePricingStkPush);
router.post('/callback', handleCallback);

export default router;
