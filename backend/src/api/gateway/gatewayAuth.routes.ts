import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword } from './gatewayAuth.controller';
import { authRateLimiter, passwordResetRateLimiter } from '../../middleware/rateLimit';

const router = Router();

router.post('/signup', authRateLimiter, signup);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);
router.post('/reset-password/:token', passwordResetRateLimiter, resetPassword);

export default router;
