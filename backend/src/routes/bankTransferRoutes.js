const express = require('express');
const router = express.Router();
const bankTransferController = require('../controllers/bankTransferController');
const { VIETQR_BANKS, findBank } = require('../utils/vietqrBanks');

// Get list of supported banks
router.get('/banks', (req, res) => {
  const { search } = req.query;
  
  if (search) {
    const results = findBank(search);
    return res.json({
      success: true,
      data: results
    });
  }
  
  res.json({
    success: true,
    data: VIETQR_BANKS
  });
});

// Lookup account name by account number and bank code
router.get('/lookup-account-name', bankTransferController.lookupAccountName);

// Generate preview QR code (without order) - for checkout preview
router.post('/generate-preview-qr', bankTransferController.generatePreviewQR);

// Create Bank Transfer QR for an order (public)
router.post('/create-qr/:orderId', bankTransferController.createBankTransferQR);

// Get bank transfer info (public)
router.get('/info/:orderId', bankTransferController.getBankTransferInfo);

// Confirm payment (public - customer confirms they have paid)
router.post('/confirm-payment/:orderId', bankTransferController.confirmPayment);

module.exports = router;