const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/', reviewController.createReview);
router.post('/upload-images', reviewController.uploadReviewImages);
router.get('/store/:storeId', reviewController.getStoreReviews);

// Protected routes (store owner)
router.get('/my-store', authMiddleware, reviewController.getMyStoreReviews);
router.get('/my-store/stats', authMiddleware, reviewController.getReviewStats);
router.put('/:reviewId/visibility', authMiddleware, reviewController.toggleReviewVisibility);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;

