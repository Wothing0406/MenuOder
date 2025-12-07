-- Migration: Fix vouchers.storeId to allow NULL for system-wide vouchers
USE menu_order_db;

-- Modify storeId column to allow NULL
ALTER TABLE vouchers 
MODIFY COLUMN storeId INT NULL;

-- Note: The unique constraint (storeId, code) will still work correctly
-- as MySQL treats NULL values specially in unique constraints
