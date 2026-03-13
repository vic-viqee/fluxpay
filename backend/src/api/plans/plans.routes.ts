import { Router } from 'express';
import { createServicePlan, deleteServicePlan, getServicePlans, updateServicePlan } from './plans.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate, planSchema, updatePlanSchema } from '../../middleware/validation';

const router = Router();

router.post('/', authMiddleware, validate(planSchema), createServicePlan);
router.get('/', authMiddleware, getServicePlans);
router.put('/:id', authMiddleware, validate(updatePlanSchema), updateServicePlan);
router.delete('/:id', authMiddleware, deleteServicePlan);

export default router;
