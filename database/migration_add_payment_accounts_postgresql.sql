-- Migration: Add payment accounts table for multiple payment methods per store (PostgreSQL)
-- This allows stores to have multiple bank accounts and ZaloPay accounts

-- Create payment_accounts table
CREATE TABLE IF NOT EXISTS payment_accounts (
  id SERIAL PRIMARY KEY,
  "storeId" INTEGER NOT NULL,
  "accountType" VARCHAR(20) NOT NULL CHECK ("accountType" IN ('bank_transfer', 'zalopay')),
  "accountName" VARCHAR(255) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "isDefault" BOOLEAN DEFAULT false,
  
  -- Bank Transfer fields
  "bankAccountNumber" VARCHAR(50) NULL,
  "bankAccountName" VARCHAR(200) NULL,
  "bankName" VARCHAR(100) NULL,
  "bankCode" VARCHAR(10) NULL,
  
  -- ZaloPay fields
  "zaloPayAppId" VARCHAR(100) NULL,
  "zaloPayKey1" VARCHAR(200) NULL,
  "zaloPayKey2" VARCHAR(200) NULL,
  "zaloPayMerchantId" VARCHAR(100) NULL,
  
  -- Verification status
  "isVerified" BOOLEAN DEFAULT false,
  "verifiedAt" TIMESTAMP NULL,
  "verificationError" TEXT NULL,
  
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_payment_accounts_store 
    FOREIGN KEY ("storeId") REFERENCES stores(id) ON DELETE CASCADE
);

-- Note: Unique constraint for default account is handled at application level
-- because PostgreSQL unique constraints with NULL values work differently than MySQL
-- The application ensures only one default account per store per type

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_accounts_store_type ON payment_accounts("storeId", "accountType");
CREATE INDEX IF NOT EXISTS idx_payment_accounts_store_active ON payment_accounts("storeId", "isActive");

-- Add comment
COMMENT ON TABLE payment_accounts IS 'Payment accounts for stores (bank transfer and ZaloPay)';
COMMENT ON COLUMN payment_accounts."accountName" IS 'Display name for this account';
COMMENT ON COLUMN payment_accounts."isDefault" IS 'Default account for this payment type';
COMMENT ON COLUMN payment_accounts."isVerified" IS 'Whether account has been verified';
COMMENT ON COLUMN payment_accounts."verifiedAt" IS 'Timestamp when account was verified';
COMMENT ON COLUMN payment_accounts."verificationError" IS 'Error message if verification failed';

