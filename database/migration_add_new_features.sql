-- Migration: Thêm các tính năng mới
USE menu_order_db;

-- Thêm Google Maps link
ALTER TABLE stores 
ADD COLUMN storeGoogleMapLink VARCHAR(500) NULL 
AFTER storeAddress;

-- Thêm orderType
ALTER TABLE orders 
ADD COLUMN orderType ENUM('dine_in', 'delivery') NOT NULL DEFAULT 'dine_in' 
AFTER customerNote;

-- Thêm deliveryAddress
ALTER TABLE orders 
ADD COLUMN deliveryAddress TEXT NULL 
AFTER orderType;

-- Thêm deliveryDistance
ALTER TABLE orders 
ADD COLUMN deliveryDistance DECIMAL(10, 2) NULL 
AFTER deliveryAddress;

-- Thêm shippingFee
ALTER TABLE orders 
ADD COLUMN shippingFee DECIMAL(10, 2) NOT NULL DEFAULT 0 
AFTER deliveryDistance;