-- Migration: Add payment accounts table for multiple payment methods per store
-- This allows stores to have multiple bank accounts and ZaloPay accounts
-- Idempotent: Can be run multiple times safely

-- Create payment_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storeId INT NOT NULL,
  accountType ENUM('bank_transfer', 'zalopay') NOT NULL,
  accountName VARCHAR(255) NOT NULL COMMENT 'Display name for this account',
  isActive BOOLEAN DEFAULT true,
  isDefault BOOLEAN DEFAULT false COMMENT 'Default account for this payment type',
  
  -- Bank Transfer fields
  bankAccountNumber VARCHAR(50) NULL,
  bankAccountName VARCHAR(200) NULL,
  bankName VARCHAR(100) NULL,
  bankCode VARCHAR(10) NULL,
  
  -- ZaloPay fields
  zaloPayAppId VARCHAR(100) NULL,
  zaloPayKey1 VARCHAR(200) NULL,
  zaloPayKey2 VARCHAR(200) NULL,
  zaloPayMerchantId VARCHAR(100) NULL,
  
  -- Verification status
  isVerified BOOLEAN DEFAULT false COMMENT 'Whether account has been verified',
  verifiedAt TIMESTAMP NULL,
  verificationError TEXT NULL,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_storeId_type (storeId, accountType),
  INDEX idx_storeId_active (storeId, isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add unique constraint for default account (only if it doesn't exist)
-- Note: This constraint allows NULL values for isDefault=false, but only one true per store+type
SET @constraint_exists = (
  SELECT COUNT(*) 
  FROM information_schema.table_constraints 
  WHERE constraint_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND constraint_name = 'unique_default_per_store_type'
);

SET @sql = IF(@constraint_exists = 0,
  'ALTER TABLE payment_accounts ADD CONSTRAINT unique_default_per_store_type UNIQUE (storeId, accountType, isDefault)',
  'SELECT "Constraint already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;