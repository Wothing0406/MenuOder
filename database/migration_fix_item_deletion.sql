-- Migration: Fix item deletion issue
-- This migration allows items to be deleted even if they have been ordered
-- Changes order_items.itemId to nullable and updates foreign key to ON DELETE SET NULL
-- This preserves order history while allowing item deletion

-- For MySQL
ALTER TABLE order_items 
  MODIFY COLUMN itemId INT NULL COMMENT 'Can be NULL if item is deleted, but order history is preserved';

-- Drop the old foreign key constraint
ALTER TABLE order_items 
  DROP FOREIGN KEY order_items_ibfk_2;

-- Add the new foreign key constraint with ON DELETE SET NULL
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_ibfk_2 
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE SET NULL;

-- For PostgreSQL (uncomment if using PostgreSQL)
-- ALTER TABLE order_items 
--   ALTER COLUMN itemId DROP NOT NULL;
-- 
-- ALTER TABLE order_items 
--   DROP CONSTRAINT IF EXISTS order_items_itemId_fkey;
-- 
-- ALTER TABLE order_items 
--   ADD CONSTRAINT order_items_itemId_fkey 
--   FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE SET NULL;

