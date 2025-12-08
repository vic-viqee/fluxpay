import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(authMiddleware, getSettings)
  .put(authMiddleware, updateSettings);

export default router;
