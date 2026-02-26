import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { uploadLogo } from '../../middleware/logoUpload';

const router = Router();

router.route('/')
  .get(authMiddleware, getSettings)
  .put(authMiddleware, uploadLogo, updateSettings);

export default router;
