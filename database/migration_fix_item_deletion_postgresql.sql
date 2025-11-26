-- Migration: Fix item deletion issue for PostgreSQL
-- This migration allows items to be deleted even if they have been ordered
-- Changes order_items.itemId to nullable and updates foreign key to ON DELETE SET NULL
-- This preserves order history while allowing item deletion

-- For PostgreSQL
ALTER TABLE order_items 
  ALTER COLUMN itemId DROP NOT NULL;

-- Drop the old foreign key constraint (adjust constraint name if different)
ALTER TABLE order_items 
  DROP CONSTRAINT IF EXISTS order_items_itemId_fkey;

-- Add the new foreign key constraint with ON DELETE SET NULL
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_itemId_fkey 
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE SET NULL;

