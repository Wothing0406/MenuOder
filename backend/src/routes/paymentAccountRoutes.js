const express = require('express');
const router = express.Router();
const paymentAccountController = require('../controllers/paymentAccountController');
const authMiddleware = require('../middleware/auth');

// Protected routes (require authentication)
router.use(authMiddleware);

// Get all payment accounts for a store
router.get('/store/:storeId', paymentAccountController.getPaymentAccounts);

// Create new payment account
router.post('/store/:storeId', paymentAccountController.createPaymentAccount);

// Update payment account
router.put('/:accountId', paymentAccountController.updatePaymentAccount);

// Delete payment account
router.delete('/:accountId', paymentAccountController.deletePaymentAccount);

// Verify payment account credentials
router.post('/:accountId/verify', paymentAccountController.verifyPaymentAccount);

module.exports = router;