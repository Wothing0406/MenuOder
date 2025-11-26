-- Migration: Add storeDetailedAddress field to stores table
-- This field allows store owners to add a detailed address for display purposes
-- while keeping storeAddress for distance calculation with OpenStreetMap

-- Add storeDetailedAddress column to stores table
ALTER TABLE stores 
  ADD COLUMN storeDetailedAddress TEXT NULL COMMENT 'Detailed address for display (does not affect distance calculation)' 
  AFTER storeAddress;

