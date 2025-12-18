import { Router } from 'express';
import { createServicePlan } from './plans.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createServicePlan);

export default router;
