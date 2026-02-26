import { Router } from 'express';
import { createServicePlan, deleteServicePlan, getServicePlans, updateServicePlan } from './plans.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createServicePlan);
router.get('/', authMiddleware, getServicePlans);
router.put('/:id', authMiddleware, updateServicePlan);
router.delete('/:id', authMiddleware, deleteServicePlan);

export default router;
