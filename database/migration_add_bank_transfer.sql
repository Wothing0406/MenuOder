USE menu_order_db;

-- Add Bank Transfer QR configuration fields to stores
SET @dbname = DATABASE();
SET @tablename = 'stores';

SET @columnname = 'bankAccountNumber';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) NULL AFTER zaloPayLink')
));
PREPARE s1 FROM @stmt; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @columnname = 'bankAccountName';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(200) NULL AFTER bankAccountNumber')
));
PREPARE s2 FROM @stmt; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @columnname = 'bankName';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) NULL AFTER bankAccountName')
));
PREPARE s3 FROM @stmt; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @columnname = 'bankCode';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) NULL AFTER bankName')
));
PREPARE s4 FROM @stmt; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @columnname = 'bankTransferQRIsActive';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) NOT NULL DEFAULT 0 AFTER bankCode')
));
PREPARE s5 FROM @stmt; EXECUTE s5; DEALLOCATE PREPARE s5;

-- Update paymentMethod enum to include bank_transfer_qr
ALTER TABLE orders MODIFY paymentMethod ENUM('cash','bank_transfer','credit_card','zalopay_qr','bank_transfer_qr') NOT NULL DEFAULT 'cash';

-- Add bankTransferQRCode column to orders table
SET @tablename = 'orders';
SET @columnname = 'bankTransferQRCode';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL AFTER zaloPayQrCode')
));
PREPARE s6 FROM @stmt; EXECUTE s6; DEALLOCATE PREPARE s6;

SELECT 'Migration Bank Transfer QR completed' AS result;


-- Add Bank Transfer QR configuration fields to stores
SET @dbname = DATABASE();
SET @tablename = 'stores';

SET @columnname = 'bankAccountNumber';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) NULL AFTER zaloPayLink')
));
PREPARE s1 FROM @stmt; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @columnname = 'bankAccountName';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(200) NULL AFTER bankAccountNumber')
));
PREPARE s2 FROM @stmt; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @columnname = 'bankName';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) NULL AFTER bankAccountName')
));
PREPARE s3 FROM @stmt; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @columnname = 'bankCode';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) NULL AFTER bankName')
));
PREPARE s4 FROM @stmt; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @columnname = 'bankTransferQRIsActive';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) NOT NULL DEFAULT 0 AFTER bankCode')
));
PREPARE s5 FROM @stmt; EXECUTE s5; DEALLOCATE PREPARE s5;

-- Update paymentMethod enum to include bank_transfer_qr
ALTER TABLE orders MODIFY paymentMethod ENUM('cash','bank_transfer','credit_card','zalopay_qr','bank_transfer_qr') NOT NULL DEFAULT 'cash';

-- Add bankTransferQRCode column to orders table
SET @tablename = 'orders';
SET @columnname = 'bankTransferQRCode';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL AFTER zaloPayQrCode')
));
PREPARE s6 FROM @stmt; EXECUTE s6; DEALLOCATE PREPARE s6;

SELECT 'Migration Bank Transfer QR completed' AS result;

