-- Migration: Add 'completed' status to orders table
-- This status means the order has been paid and is completed
-- Revenue will only be calculated from orders with 'completed' status

-- For MySQL
ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled') DEFAULT 'pending';

-- For PostgreSQL (if using PostgreSQL, uncomment this and comment the MySQL line above)
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
-- ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'));

