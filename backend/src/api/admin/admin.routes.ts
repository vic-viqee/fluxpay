import { Router } from 'express';
import { 
  getOverview, 
  getBusinesses, 
  getBusinessDetail,
  getAllTransactions,
  getAllSubscriptions
} from './admin.controller';
import { isAdmin } from '../../middleware/adminAuth';

const router = Router();

router.get('/overview', isAdmin, getOverview);
router.get('/businesses', isAdmin, getBusinesses);
router.get('/businesses/:id', isAdmin, getBusinessDetail);
router.get('/transactions', isAdmin, getAllTransactions);
router.get('/subscriptions', isAdmin, getAllSubscriptions);

export default router;