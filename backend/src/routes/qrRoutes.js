const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const authMiddleware = require('../middleware/auth');

// Protected route
router.get('/my-store', authMiddleware, qrController.getMyStoreQR);

// Public route
router.get('/store/:storeId', qrController.generateQR);

module.exports = router;
