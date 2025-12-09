const express = require('express');
const router = express.Router();
const zaloPayController = require('../controllers/zaloPayController');

// Create QR for an order (public)
router.post('/create-qr/:orderId', zaloPayController.createQrPayment);

// Check status (public)
router.get('/check-status/:orderId', zaloPayController.checkStatus);

// Webhook callback (public, but should be protected by IP/secret in production)
router.post('/callback', zaloPayController.webhookCallback);

// Verify credentials (public; does not save)
router.post('/verify', zaloPayController.verifyConfig);

module.exports = router;

