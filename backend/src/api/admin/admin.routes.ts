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

const router = Router();

router.get('/overview', isAdmin, getOverview);
router.get('/businesses', isAdmin, getBusinesses);
router.get('/businesses/:id', isAdmin, getBusinessDetail);
router.get('/transactions', isAdmin, getAllTransactions);
router.get('/subscriptions', isAdmin, getAllSubscriptions);
router.get('/apikeys', isAdmin, getAllApiKeys);
router.get('/webhooks', isAdmin, getAllWebhooks);
router.get('/plan-limits', isAdmin, getPlanLimits);
router.get('/audit-logs', isAdmin, getAuditLogs);

export default router;