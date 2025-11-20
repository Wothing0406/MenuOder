const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/auth');

// Public route
router.get('/slug/:slug', storeController.getStoreBySlug);
router.get('/', storeController.getAllStores);

// Protected routes
router.get('/my-store', authMiddleware, storeController.getMyStore);
router.put('/my-store', authMiddleware, storeController.updateStore);

module.exports = router;
