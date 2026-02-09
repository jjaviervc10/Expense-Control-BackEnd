
import { Router } from 'express';
import ReceiptController from '../controllers/receipt.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

// Endpoint para procesar ticket (protegido)
const controller = new ReceiptController();
router.post('/process', verifyToken, controller.processReceipt);

export default router;
