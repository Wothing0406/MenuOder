const { sequelize, Sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storeId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  orderId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  itemId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'items',
      key: 'id'
    }
  },
  reviewerName: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  reviewerPhone: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  reviewerEmail: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  isAnonymous: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    comment: 'True if reviewer wants to hide name publicly'
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  reviewImages: {
    type: Sequelize.JSON,
    allowNull: true,
    comment: 'Array of image URLs'
  },
  isVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    comment: 'True if review is from verified order'
  },
  isVisible: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
    comment: 'Store owner can hide inappropriate reviews'
  },
  helpfulCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    comment: 'Number of helpful votes'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    {
      name: 'idx_reviews_storeId',
      fields: ['storeId']
    },
    {
      name: 'idx_reviews_itemId',
      fields: ['itemId']
    },
    {
      name: 'idx_reviews_orderId',
      fields: ['orderId']
    },
    {
      name: 'idx_reviews_rating',
      fields: ['rating']
    },
    {
      name: 'idx_reviews_store_item',
      fields: ['storeId', 'itemId']
    }
  ]
});

module.exports = Review;


