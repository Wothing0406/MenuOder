USE menu_order_db;

-- Add ZaloPay fields to stores
SET @dbname = DATABASE();
SET @tablename = 'stores';

SET @columnname = 'zaloPayAppId';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) NULL AFTER storeImage')
));
PREPARE s1 FROM @stmt; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @columnname = 'zaloPayKey1';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(200) NULL AFTER zaloPayAppId')
));
PREPARE s2 FROM @stmt; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @columnname = 'zaloPayKey2';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(200) NULL AFTER zaloPayKey1')
));
PREPARE s3 FROM @stmt; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @columnname = 'zaloPayMerchantId';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) NULL AFTER zaloPayKey2')
));
PREPARE s4 FROM @stmt; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @columnname = 'zaloPayIsActive';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) NOT NULL DEFAULT 0 AFTER zaloPayMerchantId')
));
PREPARE s5 FROM @stmt; EXECUTE s5; DEALLOCATE PREPARE s5;

SET @columnname = 'zaloPayLink';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(500) NULL AFTER zaloPayIsActive')
));
PREPARE s6 FROM @stmt; EXECUTE s6; DEALLOCATE PREPARE s6;

-- Add ZaloPay fields to orders
SET @tablename = 'orders';

SET @columnname = 'zaloPayTransactionId';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) NULL AFTER isPaid')
));
PREPARE s7 FROM @stmt; EXECUTE s7; DEALLOCATE PREPARE s7;

SET @columnname = 'zaloPayStatus';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(\'pending\', \'success\', \'failed\') NULL AFTER zaloPayTransactionId')
));
PREPARE s8 FROM @stmt; EXECUTE s8; DEALLOCATE PREPARE s8;

SET @columnname = 'zaloPayQrCode';
SET @stmt = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=@tablename AND table_schema=@dbname AND column_name=@columnname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL AFTER zaloPayStatus')
));
PREPARE s9 FROM @stmt; EXECUTE s9; DEALLOCATE PREPARE s9;

-- Update paymentMethod enum to include zalopay_qr
ALTER TABLE orders MODIFY paymentMethod ENUM('cash','bank_transfer','credit_card','zalopay_qr') NOT NULL DEFAULT 'cash';

SELECT 'Migration ZaloPay completed' AS result;

