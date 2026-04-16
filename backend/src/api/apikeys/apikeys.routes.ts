import { Router } from 'express';
import { createApiKey, listApiKeys, revokeApiKey, deleteApiKey } from './apikeys.controller';

const router = Router();

router.post('/', createApiKey);
router.get('/', listApiKeys);
router.patch('/:id/revoke', revokeApiKey);
router.delete('/:id', deleteApiKey);

export default router;