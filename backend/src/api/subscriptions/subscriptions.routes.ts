import { Router } from 'express';
import { createSubscription, getSubscriptions, getSubscriptionById, updateSubscription, deleteSubscription } from './subscriptions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate, subscriptionSchema, updateSubscriptionSchema } from '../../middleware/validation';

const router = Router();

router.use(authMiddleware);

router.route('/')
  .post(validate(subscriptionSchema), createSubscription)
  .get(getSubscriptions);

router.route('/:id')
  .get(getSubscriptionById)
  .put(validate(updateSubscriptionSchema), updateSubscription)
  .delete(deleteSubscription);

export default router;
