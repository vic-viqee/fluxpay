import { Router } from 'express';
import { createServicePlan, getServicePlans } from './plans.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createServicePlan);
router.get('/', authMiddleware, getServicePlans);

export default router;
