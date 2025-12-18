import { Router } from 'express';
import { createClient, getClients } from './clients.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createClient);
router.get('/', authMiddleware, getClients);

export default router;
