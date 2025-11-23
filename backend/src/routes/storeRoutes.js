const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route
router.get('/slug/:slug', storeController.getStoreBySlug);
router.get('/', storeController.getAllStores);

// Protected routes
router.get('/my-store', authMiddleware, storeController.getMyStore);
router.put('/my-store', authMiddleware, upload.single('logo'), storeController.updateStore);
router.post('/my-store/logo', authMiddleware, upload.single('logo'), storeController.uploadLogo);

module.exports = router;
