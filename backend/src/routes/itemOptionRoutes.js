const express = require('express');
const router = express.Router();
const itemOptionController = require('../controllers/itemOptionController');
const authMiddleware = require('../middleware/auth');

// Protected routes
router.post('/', authMiddleware, itemOptionController.createItemOption);
router.get('/item/:itemId', itemOptionController.getItemOptions);
router.put('/:optionId', authMiddleware, itemOptionController.updateItemOption);
router.delete('/:optionId', authMiddleware, itemOptionController.deleteItemOption);

module.exports = router;
