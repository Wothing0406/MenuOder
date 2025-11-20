const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/', orderController.createOrder);
router.get('/:orderId', orderController.getOrderDetail);

// Protected routes
router.get('/my-store/list', authMiddleware, orderController.getMyStoreOrders);
router.put('/:orderId/status', authMiddleware, orderController.updateOrderStatus);
router.get('/my-store/stats', authMiddleware, orderController.getOrderStats);

module.exports = router;
