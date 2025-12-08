import { Router } from 'express';
import { getTransactions } from './transactions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getTransactions);

export default router;
