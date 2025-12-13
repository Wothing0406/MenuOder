-- Migration: Verify and update payment_accounts table structure (PostgreSQL)
-- This migration ensures all required columns exist and are properly configured
-- Idempotent: Can be run multiple times safely

-- Check and add isActive column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'isActive'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "isActive" BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Check and add isVerified column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'isVerified'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "isVerified" BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Check and add verifiedAt column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'verifiedAt'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "verifiedAt" TIMESTAMP NULL;
  END IF;
END $$;

-- Check and add verificationError column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'verificationError'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "verificationError" TEXT NULL;
  END IF;
END $$;

-- Check and add index for storeId + isActive if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'payment_accounts' AND indexname = 'idx_payment_accounts_store_active'
  ) THEN
    CREATE INDEX idx_payment_accounts_store_active ON payment_accounts("storeId", "isActive");
  END IF;
END $$;

SELECT 'Payment accounts table verification completed' AS result;


-- This migration ensures all required columns exist and are properly configured
-- Idempotent: Can be run multiple times safely

-- Check and add isActive column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'isActive'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "isActive" BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Check and add isVerified column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'isVerified'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "isVerified" BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Check and add verifiedAt column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'verifiedAt'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "verifiedAt" TIMESTAMP NULL;
  END IF;
END $$;

-- Check and add verificationError column if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_accounts' AND column_name = 'verificationError'
  ) THEN
    ALTER TABLE payment_accounts ADD COLUMN "verificationError" TEXT NULL;
  END IF;
END $$;

-- Check and add index for storeId + isActive if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'payment_accounts' AND indexname = 'idx_payment_accounts_store_active'
  ) THEN
    CREATE INDEX idx_payment_accounts_store_active ON payment_accounts("storeId", "isActive");
  END IF;
END $$;

SELECT 'Payment accounts table verification completed' AS result;



