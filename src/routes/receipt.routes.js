import { Router } from 'express';
import ReceiptController from '../controllers/receipt.controller.js';

const router = Router();

// Endpoint para procesar ticket
router.post('/process', ReceiptController.processReceipt);

export default router;
