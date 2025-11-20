const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/category/:categoryId', itemController.getItemsByCategory);
router.get('/:itemId', itemController.getItemDetail);

// Protected routes
router.post('/', authMiddleware, itemController.createItem);
router.put('/:itemId', authMiddleware, itemController.updateItem);
router.delete('/:itemId', authMiddleware, itemController.deleteItem);

module.exports = router;
