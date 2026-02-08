
const { Router } = require('express');
const ReceiptController = require('../controllers/receipt.controller.js');

const router = Router();

// Endpoint para procesar ticket
router.post('/process', ReceiptController.processReceipt);

module.exports = router;
