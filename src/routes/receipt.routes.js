
import { Router } from 'express';
import ReceiptController from '../controllers/receipt.controller.js';

const router = Router();

// Endpoint para procesar ticket
const controller = new ReceiptController();
router.post('/process', controller.processReceipt);

export default router;
