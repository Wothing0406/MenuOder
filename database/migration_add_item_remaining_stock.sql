-- Migration: add remainingStock column to items (MySQL)
-- Idempotent: if column exists, MySQL will raise "Duplicate column" which is ignored by runner

ALTER TABLE `items`
  ADD COLUMN `remainingStock` INT NULL DEFAULT NULL AFTER `itemPrice`;


