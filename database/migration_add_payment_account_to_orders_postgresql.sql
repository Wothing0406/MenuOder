-- Add payment account reference to orders table (PostgreSQL)
-- This should be run after payment_accounts table is created

-- Check if column already exists before adding
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'paymentAccountId'
  ) THEN
    ALTER TABLE orders ADD COLUMN "paymentAccountId" INTEGER NULL;
    
    -- Add foreign key constraint
    ALTER TABLE orders 
      ADD CONSTRAINT fk_orders_payment_account 
      FOREIGN KEY ("paymentAccountId") 
      REFERENCES payment_accounts(id) 
      ON DELETE SET NULL;
    
    -- Add comment
    COMMENT ON COLUMN orders."paymentAccountId" IS 'Reference to payment account used for this order';
  END IF;
END $$;

