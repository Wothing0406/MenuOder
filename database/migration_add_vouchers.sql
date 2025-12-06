-- Migration: Add vouchers and user roles
USE menu_order_db;

-- Ensure role column exists on users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role ENUM('store_owner', 'admin') NOT NULL DEFAULT 'store_owner'
AFTER storeAddress;

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storeId INT NULL,
  code VARCHAR(100) NOT NULL,
  description TEXT,
  discountType ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  discountValue DECIMAL(10, 2) NOT NULL,
  minOrderAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  maxDiscountAmount DECIMAL(10, 2),
  usageLimit INT NULL,
  usageCount INT NOT NULL DEFAULT 0,
  neverExpires BOOLEAN NOT NULL DEFAULT false,
  startsAt DATETIME NULL,
  expiresAt DATETIME NULL,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdBy INT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_store_code (storeId, code),
  INDEX idx_code (code),
  INDEX idx_store (storeId),
  INDEX idx_voucher_status (isActive, expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add voucher references to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS voucherId INT NULL AFTER isPaid,
ADD COLUMN IF NOT EXISTS voucherCode VARCHAR(100) NULL AFTER voucherId,
ADD COLUMN IF NOT EXISTS discountType ENUM('percentage', 'fixed') NULL AFTER voucherCode,
ADD COLUMN IF NOT EXISTS discountValue DECIMAL(10, 2) NULL AFTER discountType,
ADD COLUMN IF NOT EXISTS discountAmount DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER discountValue,
ADD CONSTRAINT fk_orders_voucherId FOREIGN KEY (voucherId) REFERENCES vouchers(id) ON DELETE SET NULL;

-- Add supporting indexes
CREATE INDEX IF NOT EXISTS idx_orders_voucherCode ON orders(voucherCode);

