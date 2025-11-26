-- Migration: Add 'completed' status to orders table (PostgreSQL)
-- This status means the order has been paid and is completed
-- Revenue will only be calculated from orders with 'completed' status

-- Drop existing constraint if exists
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add new constraint with 'completed' status
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));

