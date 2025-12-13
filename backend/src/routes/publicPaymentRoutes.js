const express = require('express');
const router = express.Router();
const paymentAccountController = require('../controllers/paymentAccountController');

// Public routes (no authentication required)

// Get active payment accounts for checkout
router.get('/store/:storeId/active', paymentAccountController.getActivePaymentAccounts);

module.exports = router;