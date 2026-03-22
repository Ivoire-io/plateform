-- Migration 020: Add registration_extra to profiles
-- Stores type-specific fields captured during registration:
--   developer  → { title, city, skills, github_url }
--   startup    → { startup_name, tagline, sector, stage, problem_statement }
--   enterprise → { company_name, sector, company_size, hiring_needs }
-- This column is pre-filled at account creation and re-used by the onboarding wizard.

ALTER TABLE ivoireio_profiles
  ADD COLUMN IF NOT EXISTS registration_extra JSONB DEFAULT '{}';
