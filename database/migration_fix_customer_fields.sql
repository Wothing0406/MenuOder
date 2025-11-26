-- Migration: Fix customerName and customerPhone to allow NULL for dine-in orders
-- This allows dine-in orders to not require customer information

-- Update orders table to allow NULL for customerName and customerPhone
ALTER TABLE orders 
  MODIFY COLUMN customerName VARCHAR(255) NULL COMMENT 'Customer name (required for delivery orders, optional for dine-in)',
  MODIFY COLUMN customerPhone VARCHAR(20) NULL COMMENT 'Customer phone (required for delivery orders, optional for dine-in)';

-- Update existing dine-in orders to set customerName and customerPhone to NULL if they are empty strings
UPDATE orders 
SET customerName = NULL, customerPhone = NULL 
WHERE orderType = 'dine_in' AND (customerName = '' OR customerPhone = '');



