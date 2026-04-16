import { Router } from 'express';
import { createApiKey, listApiKeys, revokeApiKey, deleteApiKey } from './apikeys.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createApiKey);
router.get('/', listApiKeys);
router.patch('/:id/revoke', revokeApiKey);
router.delete('/:id', deleteApiKey);

export default router;