-- Migration: Add reviews system (PostgreSQL version)

-- Reviews table for store and item reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  "storeId" INT NOT NULL,
  "orderId" INT NULL,
  "itemId" INT NULL,
  "reviewerName" VARCHAR(255) NOT NULL,
  "reviewerPhone" VARCHAR(20) NOT NULL,
  "reviewerEmail" VARCHAR(255),
  "isAnonymous" BOOLEAN DEFAULT false,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  "reviewImages" JSONB,
  "isVerified" BOOLEAN DEFAULT false,
  "isVisible" BOOLEAN DEFAULT true,
  "helpfulCount" INT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("storeId") REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY ("itemId") REFERENCES items(id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_reviews_storeId ON reviews("storeId");
CREATE INDEX IF NOT EXISTS idx_reviews_itemId ON reviews("itemId");
CREATE INDEX IF NOT EXISTS idx_reviews_orderId ON reviews("orderId");
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_createdAt ON reviews("createdAt");
CREATE INDEX IF NOT EXISTS idx_reviews_store_item ON reviews("storeId", "itemId");

-- Add average rating columns to stores and items
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS "averageRating" DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "totalReviews" INT DEFAULT 0;

ALTER TABLE items
ADD COLUMN IF NOT EXISTS "averageRating" DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "totalReviews" INT DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_rating ON stores("averageRating");
CREATE INDEX IF NOT EXISTS idx_items_rating ON items("averageRating");


