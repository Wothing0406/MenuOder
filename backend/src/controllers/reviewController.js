const Review = require('../models/Review');
const Store = require('../models/Store');
const Item = require('../models/Item');
const Order = require('../models/Order');
const { sequelize, Sequelize } = require('../config/database');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');
const multer = require('multer');
const Op = Sequelize.Op;

// Multer setup for multiple images
const memoryStorage = multer.memoryStorage();
const uploadMultiple = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 5 } // Max 5 images, 5MB each
}).array('images', 5);

// Helper function to update store/item average rating
const updateAverageRating = async (storeId, itemId = null) => {
  try {
    const whereCondition = { storeId, isVisible: true };
    if (itemId) {
      whereCondition.itemId = itemId;
    } else {
      whereCondition.itemId = null; // Store review
    }

    const stats = await Review.findAll({
      where: whereCondition,
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalReviews']
      ],
      raw: true
    });

    const avgRating = stats[0]?.avgRating ? parseFloat(stats[0].avgRating).toFixed(2) : 0;
    const totalReviews = parseInt(stats[0]?.totalReviews || 0);

    if (itemId) {
      await Item.update(
        { averageRating: avgRating, totalReviews },
        { where: { id: itemId } }
      );
    } else {
      await Store.update(
        { averageRating: avgRating, totalReviews },
        { where: { id: storeId } }
      );
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
};

// Create review (public - no auth needed)
exports.createReview = async (req, res) => {
  try {
    const {
      storeId,
      orderId,
      itemId,
      reviewerName,
      reviewerPhone,
      rating,
      comment,
      reviewImages,
      isAnonymous = false
    } = req.body;

    // Validation
    if (!storeId || !reviewerName || !reviewerPhone || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (tên, số điện thoại, đánh giá)'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating phải từ 1 đến 5'
      });
    }

    // Check if store exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Cửa hàng không tồn tại'
      });
    }

    // If itemId provided, check if item exists
    if (itemId) {
      const item = await Item.findOne({
        where: { id: itemId, storeId }
      });
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Món ăn không tồn tại'
        });
      }
    }

    // If orderId provided, verify it exists and belongs to store
    let isVerified = false;
    if (orderId) {
      const order = await Order.findOne({
        where: {
          id: orderId,
          storeId,
          status: 'completed'
        }
      });
      if (order) {
        isVerified = true;
        // Check if customer info matches
        if (reviewerPhone && order.customerPhone) {
          isVerified = order.customerPhone === reviewerPhone;
        }
      }
    }

    // Create review
    // Lưu tên thật vào database, hiển thị "Ẩn danh" nếu isAnonymous = true
    const review = await Review.create({
      storeId,
      orderId: orderId || null,
      itemId: itemId || null,
      reviewerName: reviewerName.trim(),
      reviewerPhone: reviewerPhone.trim(),
      reviewerEmail: null, // Không cần email
      rating,
      comment: comment || null,
      reviewImages: reviewImages || null,
      isVerified,
      isVisible: true,
      isAnonymous: isAnonymous || false
    });

    // Update average rating
    await updateAverageRating(storeId, itemId);

    res.status(201).json({
      success: true,
      message: 'Đánh giá đã được gửi thành công',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo đánh giá',
      error: error.message
    });
  }
};

// Get reviews for store (public)
exports.getStoreReviews = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { itemId, page = 1, limit = 10, sort = 'newest' } = req.query;

    const whereCondition = {
      storeId: parseInt(storeId),
      isVisible: true
    };

    if (itemId) {
      whereCondition.itemId = parseInt(itemId);
    } else {
      whereCondition.itemId = null; // Store reviews only
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let orderBy = [['createdAt', 'DESC']];

    if (sort === 'oldest') {
      orderBy = [['createdAt', 'ASC']];
    } else if (sort === 'highest') {
      orderBy = [['rating', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'lowest') {
      orderBy = [['rating', 'ASC'], ['createdAt', 'DESC']];
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereCondition,
      order: orderBy,
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName', 'itemImage'],
          required: false
        }
      ]
    });

    // Format reviews for public display - hide name if anonymous
    const formattedReviews = rows.map(review => {
      const reviewData = review.toJSON();
      if (reviewData.isAnonymous) {
        reviewData.reviewerName = 'Khách hàng ẩn danh';
        reviewData.reviewerPhone = null; // Hide phone for anonymous
      }
      return reviewData;
    });

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get store reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đánh giá',
      error: error.message
    });
  }
};

// Get reviews for my store (authenticated - store owner)
exports.getMyStoreReviews = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const { itemId, page = 1, limit = 20, sort = 'newest', isVisible } = req.query;

    const whereCondition = {
      storeId: store.id
    };

    if (itemId) {
      whereCondition.itemId = parseInt(itemId);
    }

    if (isVisible !== undefined) {
      whereCondition.isVisible = isVisible === 'true';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let orderBy = [['createdAt', 'DESC']];

    if (sort === 'oldest') {
      orderBy = [['createdAt', 'ASC']];
    } else if (sort === 'highest') {
      orderBy = [['rating', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'lowest') {
      orderBy = [['rating', 'ASC'], ['createdAt', 'DESC']];
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereCondition,
      order: orderBy,
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Item,
          as: 'item',
          attributes: ['id', 'itemName', 'itemImage'],
          required: false
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderCode', 'createdAt'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: {
        reviews: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my store reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đánh giá',
      error: error.message
    });
  }
};

// Toggle review visibility (authenticated - store owner)
exports.toggleReviewVisibility = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const review = await Review.findOne({
      where: {
        id: reviewId,
        storeId: store.id
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Đánh giá không tồn tại'
      });
    }

    review.isVisible = !review.isVisible;
    await review.save();

    // Update average rating
    await updateAverageRating(store.id, review.itemId);

    res.json({
      success: true,
      message: review.isVisible ? 'Đã hiển thị đánh giá' : 'Đã ẩn đánh giá',
      data: review
    });
  } catch (error) {
    console.error('Toggle review visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đánh giá',
      error: error.message
    });
  }
};

// Delete review (authenticated - store owner)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const review = await Review.findOne({
      where: {
        id: reviewId,
        storeId: store.id
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Đánh giá không tồn tại'
      });
    }

    const itemId = review.itemId;
    await review.destroy();

    // Update average rating
    await updateAverageRating(store.id, itemId);

    res.json({
      success: true,
      message: 'Đã xóa đánh giá'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa đánh giá',
      error: error.message
    });
  }
};

// Upload review images (public)
exports.uploadReviewImages = async (req, res) => {
  return new Promise((resolve, reject) => {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Lỗi upload ảnh'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có ảnh nào được upload'
        });
      }

      try {
        const uploadedUrls = [];

        for (const file of req.files) {
          const result = await uploadBufferToCloudinary(
            file.buffer,
            'menu-order/review-images',
            file.originalname
          );
          uploadedUrls.push(result.url);
        }

        res.json({
          success: true,
          data: {
            urls: uploadedUrls
          }
        });
      } catch (error) {
        console.error('Upload review images error:', error);
        res.status(500).json({
          success: false,
          message: 'Không thể upload ảnh',
          error: error.message
        });
      }
    });
  });
};

// Get review statistics (authenticated - store owner)
exports.getReviewStats = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { userId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const { itemId } = req.query;
    const whereCondition = {
      storeId: store.id,
      isVisible: true
    };

    if (itemId) {
      whereCondition.itemId = parseInt(itemId);
    } else {
      whereCondition.itemId = null; // Store reviews only
    }

    // Get rating distribution
    const ratingDistribution = await Review.findAll({
      where: whereCondition,
      attributes: [
        'rating',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      raw: true
    });

    // Get total stats
    const totalStats = await Review.findAll({
      where: whereCondition,
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalReviews']
      ],
      raw: true
    });

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    ratingDistribution.forEach(item => {
      distribution[item.rating] = parseInt(item.count || 0);
    });

    res.json({
      success: true,
      data: {
        averageRating: totalStats[0]?.avgRating ? parseFloat(totalStats[0].avgRating).toFixed(2) : 0,
        totalReviews: parseInt(totalStats[0]?.totalReviews || 0),
        distribution
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê đánh giá',
      error: error.message
    });
  }
};

