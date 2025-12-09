-- Migration: Add new order/store fields (PostgreSQL-safe & idempotent)

-- storeGoogleMapLink
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS storeGoogleMapLink VARCHAR(500);

-- orderType as text with check constraint
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS orderType TEXT NOT NULL DEFAULT 'dine_in';


-- Add check constraint (runner will skip "already exists" errors)
ALTER TABLE orders
ADD CONSTRAINT orders_orderType_check CHECK (orderType IN ('dine_in', 'delivery'));

-- deliveryAddress
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS deliveryAddress TEXT;

-- deliveryDistance
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS deliveryDistance NUMERIC(10, 2);

-- shippingFee
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shippingFee NUMERIC(10, 2) NOT NULL DEFAULT 0;

