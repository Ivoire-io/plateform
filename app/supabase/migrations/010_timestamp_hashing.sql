-- Migration 010: Add timestamp hashing columns to startups table
-- Used by the project-builder timestamp route to store SHA-256 proof of project data

ALTER TABLE ivoireio_startups ADD COLUMN IF NOT EXISTS timestamp_hash VARCHAR(128);
ALTER TABLE ivoireio_startups ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;
