import { Router } from 'express';
import { apiKeyAuth } from '../../middleware/apiKeyAuth';
import { 
  initiateThirdPartyPayment, 
  getTransactionStatus,
  registerWebhook,
  listWebhooks,
  deleteWebhook,
  getBusinessInfo
} from './thirdparty.controller';

const router = Router();

router.post('/payments', apiKeyAuth, initiateThirdPartyPayment);
router.get('/payments/:checkoutRequestId', apiKeyAuth, getTransactionStatus);
router.post('/webhooks', apiKeyAuth, registerWebhook);
router.get('/webhooks', apiKeyAuth, listWebhooks);
router.delete('/webhooks/:id', apiKeyAuth, deleteWebhook);
router.get('/business', apiKeyAuth, getBusinessInfo);

export default router;