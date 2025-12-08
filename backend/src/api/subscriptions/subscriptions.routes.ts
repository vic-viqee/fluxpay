import { Router } from 'express';
import { createSubscription, getSubscriptions, getSubscriptionById, updateSubscription, deleteSubscription } from './subscriptions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.route('/')
  .post(createSubscription)
  .get(getSubscriptions);

router.route('/:id')
  .get(getSubscriptionById)
  .put(updateSubscription)
  .delete(deleteSubscription);

export default router;
