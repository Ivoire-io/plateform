-- Migration 018: Add registration_metadata to waitlist
-- Stores type-specific fields submitted during registration (dev skills, startup info, etc.)

ALTER TABLE ivoireio_waitlist
  ADD COLUMN IF NOT EXISTS registration_metadata JSONB DEFAULT '{}';
