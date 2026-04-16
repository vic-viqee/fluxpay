import { Router } from 'express';
import { createNewInvoice, listInvoices, getInvoice, updateInvoiceStatus, getInvoiceSummaryHandler, deleteInvoice } from './invoices.controller';

const router = Router();

router.post('/', createNewInvoice);
router.get('/', listInvoices);
router.get('/summary', getInvoiceSummaryHandler);
router.get('/:id', getInvoice);
router.patch('/:id', updateInvoiceStatus);
router.delete('/:id', deleteInvoice);

export default router;