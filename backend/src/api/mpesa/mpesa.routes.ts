import { Router } from 'express';
import { getBalance, checkTransactionStatus } from './mpesa.controller';

const router = Router();

router.get('/balance', getBalance);
router.get('/status/:checkoutRequestId', checkTransactionStatus);

export default router;