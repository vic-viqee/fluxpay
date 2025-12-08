import { Router } from 'express';
import { getCustomers } from './customers.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getCustomers);

export default router;
