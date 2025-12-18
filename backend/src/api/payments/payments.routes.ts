import { Router } from 'express';
import { initiatePayment, handleCallback, simulateStkPush } from './payments.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/stk-push', authMiddleware, initiatePayment);
router.post('/simulate-stk-push', authMiddleware, simulateStkPush); // New route for simulation
router.post('/callback', handleCallback);

export default router;
