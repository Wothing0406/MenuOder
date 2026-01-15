const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const { createOrderRateLimit } = require('../middleware/rateLimit');
const { deviceSpamCheck } = require('../middleware/deviceSpamCheck');
const { busyModeCheck } = require('../middleware/busyModeCheck');

// Public routes
router.post('/',
  createOrderRateLimit,
  deviceSpamCheck,
  busyModeCheck,
  orderController.createOrder
);
router.post('/validate-address', orderController.validateAddress);
router.post('/calculate-shipping', orderController.calculateShipping);
router.get('/track', orderController.trackOrder);
router.get('/:orderId', orderController.getOrderDetail);

// Protected routes
router.get('/my-store/list', authMiddleware, orderController.getMyStoreOrders);
router.put('/:orderId/status', authMiddleware, orderController.updateOrderStatus);
router.get('/my-store/stats', authMiddleware, orderController.getOrderStats);
router.get('/my-store/revenue-chart', authMiddleware, orderController.getRevenueChartData);
router.get('/my-store/top-items', authMiddleware, orderController.getTopSellingItems);
router.get('/my-store/order-type-stats', authMiddleware, orderController.getOrderTypeStats);

module.exports = router;
