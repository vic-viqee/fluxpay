import { Router } from 'express';
import { initiatePayment, handleCallback } from './payments.controller';
import { authMiddleware } from '../../middleware/auth.middleware'; // I will create this middleware next

const router = Router();

router.post('/stk-push', authMiddleware, initiatePayment);
router.post('/callback', handleCallback);

export default router;
