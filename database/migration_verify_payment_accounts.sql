-- Migration: Verify and update payment_accounts table structure (MySQL / MariaDB)
-- Simple, idempotent style: duplicate column/index errors are ignored by the JS runner.

-- Add isActive column (if it already exists, the migration runner will ignore Duplicate column errors)
ALTER TABLE `payment_accounts`
  ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1 AFTER `accountName`;

-- Add isVerified column
ALTER TABLE `payment_accounts`
  ADD COLUMN `isVerified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether account has been verified' AFTER `zaloPayMerchantId`;

-- Add verifiedAt column
ALTER TABLE `payment_accounts`
  ADD COLUMN `verifiedAt` TIMESTAMP NULL AFTER `isVerified`;

-- Add verificationError column
ALTER TABLE `payment_accounts`
  ADD COLUMN `verificationError` TEXT NULL AFTER `verifiedAt`;

-- Add composite index for storeId + isActive
CREATE INDEX `idx_storeId_active` ON `payment_accounts`(`storeId`, `isActive`);
