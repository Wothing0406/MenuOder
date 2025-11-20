const express = require('express');
const router = express.Router();
const accompanimentController = require('../controllers/accompanimentController');
const authMiddleware = require('../middleware/auth');

// Protected routes - only store owner can manage
router.post('/:itemId/accompaniments', authMiddleware, accompanimentController.createAccompaniment);
router.get('/:itemId/accompaniments', accompanimentController.getAccompaniments);
router.put('/accompaniments/:accompanimentId', authMiddleware, accompanimentController.updateAccompaniment);
router.delete('/accompaniments/:accompanimentId', authMiddleware, accompanimentController.deleteAccompaniment);

module.exports = router;
