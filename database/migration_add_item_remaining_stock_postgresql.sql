-- Migration: Add remainingStock column to items table (PostgreSQL)
-- This migration adds the remainingStock column to control item stock levels

-- Add remainingStock column to items table if not exists
ALTER TABLE items
ADD COLUMN IF NOT EXISTS "remainingStock" INTEGER NULL;

-- Add comment to the column
COMMENT ON COLUMN items."remainingStock" IS 'Số lượng tồn kho còn lại - null: không giới hạn, 0: hết hàng, >0: còn X phần';