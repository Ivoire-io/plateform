-- =====================================================
-- ivoire.io — Migration admin schema
-- Ajout des tables nécessaires au dashboard admin
-- =====================================================

-- ─── CHAMP IS_ADMIN sur les profils ───
ALTER TABLE ivoireio_profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_badge BOOLEAN DEFAULT false;

-- ─── FEATURE FLAGS ───
CREATE TABLE IF NOT EXISTS ivoireio_feature_flags (
  key VARCHAR(100) PRIMARY KEY,
  state VARCHAR(10) DEFAULT 'off' CHECK (state IN ('off', 'beta', 'public')),
  allowed_types TEXT[] DEFAULT '{}',
  allowed_emails TEXT[] DEFAULT '{}',
  coming_soon_message TEXT DEFAULT 'Ce portail arrive bientôt ! 🚀',
  updated_by UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial des portails
INSERT INTO ivoireio_feature_flags (key, state) VALUES
  ('devs', 'public'),
  ('portfolio', 'public'),
  ('startups', 'beta'),
  ('jobs', 'beta'),
  ('learn', 'off'),
  ('events', 'off'),
  ('health', 'off'),
  ('invest', 'off'),
  ('data', 'off'),
  ('blog', 'public')
ON CONFLICT (key) DO NOTHING;

-- Fonctionnalités individuelles
INSERT INTO ivoireio_feature_flags (key, state, allowed_types) VALUES
  ('feature_messaging', 'public', '{}'),
  ('feature_visio', 'off', '{}'),
  ('feature_calendar', 'off', '{}'),
  ('feature_votes', 'public', '{}'),
  ('feature_mobile_money', 'beta', '{}'),
  ('feature_stripe', 'public', '{}'),
  ('feature_pdf_export', 'public', '{}'),
  ('feature_custom_domain', 'off', '{}'),
  ('feature_analytics', 'beta', '{}'),
  ('feature_open_data_api', 'off', '{}'),
  ('feature_quiz', 'off', '{}'),
  ('feature_mentorship', 'off', '{}')
ON CONFLICT (key) DO NOTHING;

-- ─── FLAGS HISTORY ───
CREATE TABLE IF NOT EXISTS ivoireio_flag_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR(100) NOT NULL,
  old_state VARCHAR(10),
  new_state VARCHAR(10) NOT NULL,
  changed_by UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BROADCASTS ───
CREATE TABLE IF NOT EXISTS ivoireio_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] DEFAULT '{email}',
  target_types TEXT[] DEFAULT '{}',
  target_plans TEXT[] DEFAULT '{}',
  target_cities TEXT[] DEFAULT '{}',
  schedule_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  recipients_count INT DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SIGNALEMENTS ───
CREATE TABLE IF NOT EXISTS ivoireio_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'ignored', 'actioned')),
  reviewed_by UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivoireio_reports_profile ON ivoireio_reports(reported_profile_id);
CREATE INDEX IF NOT EXISTS idx_ivoireio_reports_status ON ivoireio_reports(status);

-- ─── CERTIFICATIONS ───
CREATE TABLE IF NOT EXISTS ivoireio_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  documents TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LOGS D'ACTIVITÉ ───
CREATE TABLE IF NOT EXISTS ivoireio_admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) NOT NULL CHECK (type IN ('profile', 'content', 'payment', 'waitlist', 'moderation', 'system', 'admin')),
  description TEXT NOT NULL,
  actor_id UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivoireio_admin_logs_type ON ivoireio_admin_logs(type);
CREATE INDEX IF NOT EXISTS idx_ivoireio_admin_logs_created ON ivoireio_admin_logs(created_at DESC);

-- ─── CONFIGURATION PLATEFORME ───
CREATE TABLE IF NOT EXISTS ivoireio_platform_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed config par défaut
INSERT INTO ivoireio_platform_config (key, value) VALUES
  ('registration_mode', '"waitlist"'),
  ('email_welcome', 'true'),
  ('email_contact', 'true'),
  ('email_weekly_admin', 'true'),
  ('email_waitlist_reminder', 'true'),
  ('maintenance_mode', 'false'),
  ('seo_title', '"ivoire.io — L''OS Digital de la CI"'),
  ('seo_description', '"Le hub central des développeurs, startups et entreprises de Côte d''Ivoire"'),
  ('twitter_handle', '"@ivoire_io"'),
  ('price_dev_premium', '3000'),
  ('price_startup_premium', '5000'),
  ('price_enterprise', '20000')
ON CONFLICT (key) DO NOTHING;

-- ─── TEMPLATES ───
CREATE TABLE IF NOT EXISTS ivoireio_templates (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '📄',
  state VARCHAR(10) DEFAULT 'active' CHECK (state IN ('off', 'beta', 'active')),
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
  allowed_types TEXT[] DEFAULT '{developer,startup,enterprise,other}',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO ivoireio_templates (slug, name, icon, state, plan, usage_count) VALUES
  ('classic', 'Classic', '📄', 'active', 'free', 423),
  ('minimal', 'Minimal', '✨', 'active', 'free', 198),
  ('bento', 'Bento Grid', '🧩', 'active', 'premium', 87),
  ('terminal', 'Terminal', '💻', 'active', 'premium', 56),
  ('magazine', 'Magazine', '📰', 'beta', 'premium', 12),
  ('timeline', 'Timeline', '⏰', 'beta', 'premium', 8),
  ('card-stack', 'Card Stack', '🃏', 'off', 'premium', 0),
  ('split', 'Split', '↔️', 'off', 'premium', 0),
  ('startup', 'Startup Landing', '🚀', 'active', 'free', 34),
  ('corporate', 'Corporate', '🏢', 'beta', 'enterprise', 5)
ON CONFLICT (slug) DO NOTHING;

-- ─── RLS pour les tables admin ───
-- Feature flags : lecture publique, écriture admin seulement
ALTER TABLE ivoireio_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flags_select_all" ON ivoireio_feature_flags FOR SELECT USING (true);
CREATE POLICY "flags_admin_write" ON ivoireio_feature_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));

ALTER TABLE ivoireio_flag_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flag_history_select_admin" ON ivoireio_flag_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "flag_history_insert_admin" ON ivoireio_flag_history FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));

-- Broadcasts : admin seulement
ALTER TABLE ivoireio_broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broadcasts_admin_all" ON ivoireio_broadcasts FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));

-- Reports : admin seulement + owner peut créer
ALTER TABLE ivoireio_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert_auth" ON ivoireio_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reports_select_admin" ON ivoireio_reports FOR SELECT
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "reports_update_admin" ON ivoireio_reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));

-- Certifications : admin seulement + owner peut créer
ALTER TABLE ivoireio_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certif_insert_own" ON ivoireio_certifications FOR INSERT
  WITH CHECK (profile_id = auth.uid());
CREATE POLICY "certif_select_admin" ON ivoireio_certifications FOR SELECT
  USING (profile_id = auth.uid() OR EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "certif_update_admin" ON ivoireio_certifications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));

-- Logs : admin lecture, système écriture
ALTER TABLE ivoireio_admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_select_admin" ON ivoireio_admin_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "logs_insert_service" ON ivoireio_admin_logs FOR INSERT WITH CHECK (true);

-- Config : admin seulement
ALTER TABLE ivoireio_platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_select_admin" ON ivoireio_platform_config FOR SELECT
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "config_write_admin" ON ivoireio_platform_config FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));

-- Templates : lecture publique, écriture admin
ALTER TABLE ivoireio_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_select_all" ON ivoireio_templates FOR SELECT USING (true);
CREATE POLICY "templates_write_admin" ON ivoireio_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true));
