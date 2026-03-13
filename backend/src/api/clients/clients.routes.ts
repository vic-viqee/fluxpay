import { Router } from 'express';
import { createClient, getClients } from './clients.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate, clientSchema } from '../../middleware/validation';

const router = Router();

router.post('/', authMiddleware, validate(clientSchema), createClient);
router.get('/', authMiddleware, getClients);

export default router;
