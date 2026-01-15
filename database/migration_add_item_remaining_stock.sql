-- Migration: Add remainingStock column to items table (MySQL)
-- This migration adds the remainingStock column to control item stock levels

USE menu_order_db;

-- Check and add remainingStock if not exists
SET @dbname = DATABASE();
SET @tablename = 'items';
SET @columnname = 'remainingStock';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT "Column remainingStock already exists" AS result',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL DEFAULT NULL COMMENT "Số lượng tồn kho còn lại - null: không giới hạn, 0: hết hàng, >0: còn X phần" AFTER itemPrice; SELECT "Column remainingStock added successfully" AS result')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;