-- Migration: Add storeGoogleMapLink column to stores table
-- This migration checks if the column exists before adding it

USE menu_order_db;

-- Check and add storeGoogleMapLink if not exists
SET @dbname = DATABASE();
SET @tablename = 'stores';
SET @columnname = 'storeGoogleMapLink';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT "Column storeGoogleMapLink already exists" AS result',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(500) NULL AFTER storeAddress; SELECT "Column storeGoogleMapLink added successfully" AS result')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;





