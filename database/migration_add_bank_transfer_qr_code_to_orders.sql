USE menu_order_db;

-- Add bankTransferQRCode column to orders table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'orders';
SET @columnname = 'bankTransferQRCode';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL AFTER zaloPayQrCode')
));
PREPARE s1 FROM @stmt; EXECUTE s1; DEALLOCATE PREPARE s1;

SELECT 'Migration: Added bankTransferQRCode to orders table' AS result;



-- Add bankTransferQRCode column to orders table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'orders';
SET @columnname = 'bankTransferQRCode';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL AFTER zaloPayQrCode')
));
PREPARE s1 FROM @stmt; EXECUTE s1; DEALLOCATE PREPARE s1;

SELECT 'Migration: Added bankTransferQRCode to orders table' AS result;






