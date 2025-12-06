-- Migration: Add reviews system
-- Supports both MySQL and PostgreSQL

-- Reviews table for store and item reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storeId INT NOT NULL,
  orderId INT NULL COMMENT 'Link to order if review is from customer',
  itemId INT NULL COMMENT 'NULL for store review, itemId for item review',
  reviewerName VARCHAR(255) NOT NULL,
  reviewerPhone VARCHAR(20) NOT NULL,
  reviewerEmail VARCHAR(255),
  isAnonymous BOOLEAN DEFAULT false COMMENT 'True if reviewer wants to hide name publicly',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  reviewImages JSON COMMENT 'Array of image URLs',
  isVerified BOOLEAN DEFAULT false COMMENT 'True if review is from verified order',
  isVisible BOOLEAN DEFAULT true COMMENT 'Store owner can hide inappropriate reviews',
  helpfulCount INT DEFAULT 0 COMMENT 'Number of helpful votes',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_storeId (storeId),
  INDEX idx_itemId (itemId),
  INDEX idx_orderId (orderId),
  INDEX idx_rating (rating),
  INDEX idx_createdAt (createdAt),
  INDEX idx_store_item (storeId, itemId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add average rating columns to stores and items
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS averageRating DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS totalReviews INT DEFAULT 0;

ALTER TABLE items
ADD COLUMN IF NOT EXISTS averageRating DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS totalReviews INT DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_rating ON stores(averageRating);
CREATE INDEX IF NOT EXISTS idx_items_rating ON items(averageRating);


