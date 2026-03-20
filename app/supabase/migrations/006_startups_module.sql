-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 006: Module Startups — ivoire.io
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Table startups ───
CREATE TABLE IF NOT EXISTS ivoireio_startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website_url TEXT,
  sector TEXT NOT NULL DEFAULT 'tech',
  stage TEXT NOT NULL DEFAULT 'idea',
  city TEXT DEFAULT 'Abidjan',
  team_size INT DEFAULT 1,
  founded_year INT,
  tech_stack TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  is_hiring BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  upvotes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Table upvotes (1 vote per IP per startup per day) ───
CREATE TABLE IF NOT EXISTS ivoireio_startup_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES ivoireio_startups(id) ON DELETE CASCADE,
  voter_ip_hash TEXT NOT NULL,
  voter_profile_id UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  vote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(startup_id, voter_ip_hash, vote_date)
);

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_startups_profile_id ON ivoireio_startups(profile_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON ivoireio_startups(status);
CREATE INDEX IF NOT EXISTS idx_startups_sector ON ivoireio_startups(sector);
CREATE INDEX IF NOT EXISTS idx_startups_slug ON ivoireio_startups(slug);
CREATE INDEX IF NOT EXISTS idx_startups_upvotes ON ivoireio_startups(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_startup_upvotes_startup ON ivoireio_startup_upvotes(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_upvotes_ip ON ivoireio_startup_upvotes(voter_ip_hash);

-- ─── RLS ───
ALTER TABLE ivoireio_startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivoireio_startup_upvotes ENABLE ROW LEVEL SECURITY;

-- Startups: lecture publique des startups approuvées
CREATE POLICY "startups_select_approved" ON ivoireio_startups
  FOR SELECT USING (status = 'approved');

-- Startups: insertion par utilisateur authentifié
CREATE POLICY "startups_insert_auth" ON ivoireio_startups
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Startups: modification par le propriétaire uniquement
CREATE POLICY "startups_update_owner" ON ivoireio_startups
  FOR UPDATE USING (auth.uid() = profile_id);

-- Startups: suppression par le propriétaire uniquement
CREATE POLICY "startups_delete_owner" ON ivoireio_startups
  FOR DELETE USING (auth.uid() = profile_id);

-- Upvotes: lecture publique
CREATE POLICY "upvotes_select" ON ivoireio_startup_upvotes
  FOR SELECT USING (true);

-- Upvotes: insertion publique (guests can vote)
CREATE POLICY "upvotes_insert" ON ivoireio_startup_upvotes
  FOR INSERT WITH CHECK (true);

-- ─── Feature flag ───
INSERT INTO ivoireio_feature_flags (key, state, allowed_types, allowed_emails, coming_soon_message)
VALUES ('startups', 'beta', ARRAY['developer','startup','enterprise','other'], ARRAY[]::TEXT[], 'Le portail startups arrive bientôt !')
ON CONFLICT (key) DO NOTHING;

-- ─── Seed: sectors for reference ───
COMMENT ON COLUMN ivoireio_startups.sector IS 'Sectors: tech, fintech, agritech, healthtech, edtech, ecommerce, logistics, media, energy, other';
COMMENT ON COLUMN ivoireio_startups.stage IS 'Stages: idea, mvp, seed, series_a, growth, profitable';
