import { Router } from 'express';
import { 
  getOverview, 
  getBusinesses, 
  getBusinessDetail,
  getAllTransactions,
  getAllSubscriptions,
  getAllApiKeys,
  getAllWebhooks,
  getPlanLimits,
  getAuditLogs
} from './admin.controller';
import { isAdmin } from '../../middleware/adminAuth';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/overview', authMiddleware, isAdmin, getOverview);
router.get('/businesses', authMiddleware, isAdmin, getBusinesses);
router.get('/businesses/:id', authMiddleware, isAdmin, getBusinessDetail);
router.get('/transactions', authMiddleware, isAdmin, getAllTransactions);
router.get('/subscriptions', authMiddleware, isAdmin, getAllSubscriptions);
router.get('/apikeys', authMiddleware, isAdmin, getAllApiKeys);
router.get('/webhooks', authMiddleware, isAdmin, getAllWebhooks);
router.get('/plan-limits', authMiddleware, isAdmin, getPlanLimits);
router.get('/audit-logs', authMiddleware, isAdmin, getAuditLogs);

export default router;