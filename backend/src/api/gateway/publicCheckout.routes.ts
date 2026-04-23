import { Router } from 'express';
import { 
  getButtonById, 
  trackButtonClick, 
  initiateButtonPayment,
  getButtonStats,
  createButton,
  updateButton,
  deleteButton
} from './publicCheckout.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.get('/buttons/:buttonId', getButtonById);
router.post('/buttons/:buttonId/click', trackButtonClick);
router.post('/buttons/:buttonId/pay', initiateButtonPayment);

router.get('/buttons', authMiddleware, getButtonStats);
router.post('/buttons', authMiddleware, createButton);
router.patch('/buttons/:id', authMiddleware, updateButton);
router.delete('/buttons/:id', authMiddleware, deleteButton);

export default router;