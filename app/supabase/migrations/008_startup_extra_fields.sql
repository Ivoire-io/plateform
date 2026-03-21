-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 008: Champs supplémentaires startup — ivoire.io
-- ═══════════════════════════════════════════════════════════════════════════

-- Problème résolu (1 phrase)
ALTER TABLE ivoireio_startups
  ADD COLUMN IF NOT EXISTS problem_statement TEXT;

-- Recherche en cours (tableau de tags)
-- Valeurs : 'cofounders' | 'developers' | 'investors' | 'customers' | 'mentors' | 'partners'
ALTER TABLE ivoireio_startups
  ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}';
