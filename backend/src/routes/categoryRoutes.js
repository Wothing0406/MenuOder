const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

// Public route
router.get('/store/:storeId', categoryController.getCategories);

// Protected routes
router.post('/', authMiddleware, categoryController.createCategory);
router.get('/my-categories', authMiddleware, categoryController.getMyCategories);
router.put('/:categoryId', authMiddleware, categoryController.updateCategory);
router.delete('/:categoryId', authMiddleware, categoryController.deleteCategory);
router.post('/reorder', authMiddleware, categoryController.reorderCategories);

module.exports = router;
