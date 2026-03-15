-- =====================================================
-- ivoire.io — Migration analytics
-- Tables pour le tracking des visites et clics
-- =====================================================

-- ─── VUES DE PORTFOLIO ───
-- Enregistrées à chaque visite de la page /portfolio/[slug]
CREATE TABLE IF NOT EXISTS ivoireio_portfolio_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  -- Visitor info (anonymisé)
  visitor_ip_hash TEXT,          -- hash SHA-256 de l'ip (jamais l'ip brute)
  country_code VARCHAR(2),       -- code ISO pays (CI, FR, SN, US, etc.)
  referrer TEXT,                 -- source de trafic (google, linkedin, direct...)
  user_agent_hint TEXT,          -- mobile/desktop/bot
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_views_profile ON ivoireio_portfolio_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_created ON ivoireio_portfolio_views(created_at DESC);

-- ─── CLICS SUR LES LIENS ───
-- Enregistrés lorsqu'un visiteur clique sur un lien social/projet du portfolio
CREATE TABLE IF NOT EXISTS ivoireio_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  link_type VARCHAR(30) NOT NULL CHECK (link_type IN ('github', 'linkedin', 'twitter', 'website', 'project_github', 'project_demo', 'other')),
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_profile ON ivoireio_link_clicks(profile_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_created ON ivoireio_link_clicks(created_at DESC);

-- ─── FAVORIS ───
-- Un visiteur connecté (ou anonyme) peut mettre un profil en favori
CREATE TABLE IF NOT EXISTS ivoireio_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  visitor_ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favorites_profile ON ivoireio_favorites(profile_id);

-- ─── COLONNES NOTIF/PRIVACY sur les profils ───
ALTER TABLE ivoireio_profiles
  ADD COLUMN IF NOT EXISTS notif_messages BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_weekly_report BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notif_news BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS privacy_visible_in_directory BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS privacy_show_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS template_id VARCHAR(50) DEFAULT 'minimal-dark';

-- ─── RLS ───
ALTER TABLE ivoireio_portfolio_views ENABLE ROW LEVEL SECURITY;

-- Insertion publique (tracking non authentifié)
CREATE POLICY "views_insert_public"
  ON ivoireio_portfolio_views FOR INSERT
  WITH CHECK (true);

-- Lecture par le propriétaire du profil
CREATE POLICY "views_select_own"
  ON ivoireio_portfolio_views FOR SELECT
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

-- Admin peut tout lire
CREATE POLICY "views_select_admin"
  ON ivoireio_portfolio_views FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true)
  );

ALTER TABLE ivoireio_link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clicks_insert_public"
  ON ivoireio_link_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "clicks_select_own"
  ON ivoireio_link_clicks FOR SELECT
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

ALTER TABLE ivoireio_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_insert_public"
  ON ivoireio_favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "favorites_select_own"
  ON ivoireio_favorites FOR SELECT
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );
