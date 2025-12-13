-- Add payment account reference to orders table
-- This should be run after payment_accounts table is created
-- Idempotent: Can be run multiple times safely

-- Check if column exists before adding
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE()
    AND table_name = 'orders'
    AND column_name = 'paymentAccountId'
);

-- Add paymentAccountId column if it doesn't exist
SET @sql = IF(@column_exists = 0,
  'ALTER TABLE orders ADD COLUMN paymentAccountId INT NULL AFTER paymentMethod',
  'SELECT "Column paymentAccountId already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if foreign key constraint exists before adding
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM information_schema.table_constraints 
  WHERE constraint_schema = DATABASE()
    AND table_name = 'orders'
    AND constraint_name = 'fk_orders_payment_account'
);

-- Add foreign key constraint if it doesn't exist
SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE orders ADD CONSTRAINT fk_orders_payment_account FOREIGN KEY (paymentAccountId) REFERENCES payment_accounts(id) ON DELETE SET NULL',
  'SELECT "Foreign key constraint already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;