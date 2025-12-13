-- Migration: Verify and update payment_accounts table structure
-- This migration ensures all required columns exist and are properly configured
-- Idempotent: Can be run multiple times safely

-- Check and add isActive column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'isActive'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN isActive BOOLEAN DEFAULT true AFTER accountName',
  'SELECT "Column isActive already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add isVerified column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'isVerified'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN isVerified BOOLEAN DEFAULT false COMMENT "Whether account has been verified" AFTER zaloPayMerchantId',
  'SELECT "Column isVerified already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add verifiedAt column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'verifiedAt'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN verifiedAt TIMESTAMP NULL AFTER isVerified',
  'SELECT "Column verifiedAt already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add verificationError column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'verificationError'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN verificationError TEXT NULL AFTER verifiedAt',
  'SELECT "Column verificationError already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add index for storeId + isActive if missing
SET @index_exists = (
  SELECT COUNT(*) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND index_name = 'idx_storeId_active'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_storeId_active ON payment_accounts(storeId, isActive)',
  'SELECT "Index idx_storeId_active already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Payment accounts table verification completed' AS result;


-- This migration ensures all required columns exist and are properly configured
-- Idempotent: Can be run multiple times safely

-- Check and add isActive column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'isActive'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN isActive BOOLEAN DEFAULT true AFTER accountName',
  'SELECT "Column isActive already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add isVerified column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'isVerified'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN isVerified BOOLEAN DEFAULT false COMMENT "Whether account has been verified" AFTER zaloPayMerchantId',
  'SELECT "Column isVerified already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add verifiedAt column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'verifiedAt'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN verifiedAt TIMESTAMP NULL AFTER isVerified',
  'SELECT "Column verifiedAt already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add verificationError column if missing
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND column_name = 'verificationError'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE payment_accounts ADD COLUMN verificationError TEXT NULL AFTER verifiedAt',
  'SELECT "Column verificationError already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add index for storeId + isActive if missing
SET @index_exists = (
  SELECT COUNT(*) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE()
    AND table_name = 'payment_accounts'
    AND index_name = 'idx_storeId_active'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_storeId_active ON payment_accounts(storeId, isActive)',
  'SELECT "Index idx_storeId_active already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Payment accounts table verification completed' AS result;

