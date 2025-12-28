-- Migration: add remainingStock column to items (PostgreSQL)
-- Idempotent: uses IF NOT EXISTS so it can be run many times safely

ALTER TABLE IF EXISTS "items"
  ADD COLUMN IF NOT EXISTS "remainingStock" INTEGER NULL DEFAULT NULL;














