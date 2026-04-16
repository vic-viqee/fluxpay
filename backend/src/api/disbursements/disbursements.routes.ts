import { Router } from 'express';
import { initiateDisbursement, listDisbursements } from './disbursements.controller';

const router = Router();

router.post('/', initiateDisbursement);
router.get('/', listDisbursements);

export default router;