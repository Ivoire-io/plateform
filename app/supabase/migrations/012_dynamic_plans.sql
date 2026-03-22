-- ============================================================
-- Migration 012 — Dynamic Plans + Packs Tables
-- Plans & Packs are fully administrable from the admin dashboard.
-- ============================================================

-- ─── Plans table ───
CREATE TABLE IF NOT EXISTS ivoireio_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  tagline TEXT,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'XOF',
  billing_type VARCHAR(20) DEFAULT 'free' CHECK (billing_type IN ('free', 'monthly', 'yearly', 'one_time', 'custom')),
  icon VARCHAR(50) DEFAULT 'Zap',
  color VARCHAR(20) DEFAULT '#6b7280',
  is_active BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  -- Limits (NULL = unlimited)
  max_projects INTEGER,
  max_team_members INTEGER,
  max_products INTEGER,
  max_job_listings INTEGER,
  max_ai_generations_per_day INTEGER,
  max_logo_variations INTEGER DEFAULT 1,
  max_regenerations INTEGER,
  allowed_templates VARCHAR(20) DEFAULT 'free',
  -- Features (boolean gating)
  features JSONB DEFAULT '{
    "pitch_deck": false,
    "cahier_charges": false,
    "business_plan": false,
    "one_pager": false,
    "cgu": false,
    "roadmap": false,
    "competitors_analysis": false,
    "oapi_check": false,
    "timestamp": false,
    "export_pdf": false,
    "fundraising": false,
    "advanced_stats": false,
    "verified_badge": false,
    "priority_visibility": false,
    "homepage_featured": false,
    "dev_outsourcing": false
  }',
  -- Display features (list of strings shown on pricing cards)
  display_features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Fix billing_type constraint before inserts (idempotent) ───
DO $$
BEGIN
  ALTER TABLE ivoireio_plans DROP CONSTRAINT IF EXISTS ivoireio_plans_billing_type_check;
  ALTER TABLE ivoireio_plans ADD CONSTRAINT ivoireio_plans_billing_type_check
    CHECK (billing_type IN ('free', 'monthly', 'yearly', 'one_time', 'custom'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ─── Seed plans : Gratuit / Builder / Startup / Pro / Growth ───
INSERT INTO ivoireio_plans (tier, name, tagline, description, price, billing_type, icon, color, is_active, is_highlighted, sort_order,
  max_projects, max_team_members, max_products, max_job_listings, max_ai_generations_per_day, max_logo_variations, max_regenerations, allowed_templates,
  features, display_features)
VALUES
  -- 🟢 GRATUIT — Decouverte
  ('free', 'Gratuit', 'Commence gratuitement',
   'Decouvrez ivoire.io sans engagement. Testez nos outils IA et creez votre premiere startup.',
   0, 'free', 'Zap', '#6b7280', true, false, 0,
   1, 2, 1, 0, 3, 1, 1, 'free',
   '{"pitch_deck":false,"cahier_charges":false,"business_plan":false,"one_pager":false,"cgu":false,"roadmap":false,"competitors_analysis":false,"oapi_check":false,"timestamp":false,"export_pdf":false,"fundraising":false,"advanced_stats":false,"verified_badge":false,"priority_visibility":false,"homepage_featured":false,"dev_outsourcing":false}',
   '["1 startup","Pitch basique (watermark)","Logo simple (1 variation)","3 generations IA / jour","Branding ivoire.io","Stats basiques"]'),

  -- 🟡 BUILDER — Etudiants & debutants
  ('builder', 'Builder', 'Rends ton idee serieuse',
   'Tout ce qu''il faut pour structurer ton idee et creer ta premiere vraie startup.',
   3000, 'monthly', 'GraduationCap', '#eab308', true, false, 1,
   1, 3, 2, 1, 10, 2, 2, 'free+1',
   '{"pitch_deck":true,"cahier_charges":false,"business_plan":false,"one_pager":true,"cgu":false,"roadmap":false,"competitors_analysis":false,"oapi_check":false,"timestamp":true,"export_pdf":true,"fundraising":false,"advanced_stats":false,"verified_badge":false,"priority_visibility":false,"homepage_featured":false,"dev_outsourcing":false}',
   '["1 startup","Pitch deck PDF (export propre)","One pager professionnel","Logo HD (2 variations)","10 generations IA / jour","Acces communaute","Support par email"]'),

  -- 🟠 STARTUP — Entrepreneurs serieux (POPULAIRE)
  ('startup', 'Startup', 'Trouve tes premiers clients',
   'Les outils complets pour valider ton marche, convaincre et lancer serieusement.',
   10000, 'monthly', 'Rocket', '#f97316', true, true, 2,
   2, 5, 3, 2, 25, 3, 5, 'free+1',
   '{"pitch_deck":true,"cahier_charges":false,"business_plan":true,"one_pager":true,"cgu":false,"roadmap":true,"competitors_analysis":true,"oapi_check":true,"timestamp":true,"export_pdf":true,"fundraising":false,"advanced_stats":false,"verified_badge":false,"priority_visibility":false,"homepage_featured":false,"dev_outsourcing":false}',
   '["2 startups","Pitch deck + Business plan complet","Analyse de la concurrence","Roadmap produit","Verification nom (OAPI)","3 variations de logo","25 generations IA / jour","Export & partage"]'),

  -- 🔵 PRO — Fondateurs en croissance
  ('pro', 'Pro', 'Passe a l''echelle',
   'La puissance complete : tous les outils, documents avances, acces dev et investisseurs.',
   60000, 'yearly', 'Crown', '#3b82f6', true, false, 3,
   5, NULL, NULL, 5, 50, 5, NULL, 'all',
   '{"pitch_deck":true,"cahier_charges":true,"business_plan":true,"one_pager":true,"cgu":true,"roadmap":true,"competitors_analysis":true,"oapi_check":true,"timestamp":true,"export_pdf":true,"fundraising":true,"advanced_stats":true,"verified_badge":true,"priority_visibility":true,"homepage_featured":false,"dev_outsourcing":true}',
   '["5 startups","Tous les templates","Cahier des charges, CGU, Roadmap","Stats avancees + Export PDF","Badge startup verifie","Acces dev outsourcing","Listing investisseurs africains","5 variations de logo","50 generations IA / jour","Support prioritaire"]'),

  -- 🔴 GROWTH — Startups avancees (sur mesure)
  ('growth', 'Growth', 'Accompagnement premium',
   'Accompagnement personnalise, strategie, mise en relation et support dedie pour les startups ambitieuses.',
   0, 'custom', 'Shield', '#ef4444', true, false, 4,
   NULL, NULL, NULL, NULL, NULL, 10, NULL, 'all+corporate',
   '{"pitch_deck":true,"cahier_charges":true,"business_plan":true,"one_pager":true,"cgu":true,"roadmap":true,"competitors_analysis":true,"oapi_check":true,"timestamp":true,"export_pdf":true,"fundraising":true,"advanced_stats":true,"verified_badge":true,"priority_visibility":true,"homepage_featured":true,"dev_outsourcing":true}',
   '["Startups illimitees (sur validation)","Accompagnement personnalise","Strategie & conseil","Mise en relation premium","Account manager dedie","Tous les outils Pro","Generations IA illimitees","10 variations de logo","SLA garanti","Support dedie"]')
ON CONFLICT (tier) DO NOTHING;

-- ─── Packs table (achats ponctuels) ───
CREATE TABLE IF NOT EXISTS ivoireio_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'XOF',
  icon VARCHAR(50) DEFAULT 'Package',
  color VARCHAR(20) DEFAULT '#f97316',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  -- What the pack includes (display)
  includes JSONB DEFAULT '[]',
  -- Which features it unlocks (temporary or permanent)
  unlocked_features JSONB DEFAULT '[]',
  -- Duration in days (NULL = permanent, 0 = one-time use)
  duration_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Pack purchases tracking ───
CREATE TABLE IF NOT EXISTS ivoireio_pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  pack_id UUID NOT NULL REFERENCES ivoireio_packs(id) ON DELETE SET NULL,
  pack_slug VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(5) DEFAULT 'XOF',
  payment_method VARCHAR(20) CHECK (payment_method IN ('manual', 'paypal', 'wave', 'orange_money', 'credit', 'admin')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  proof_url TEXT,
  expires_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seed packs ───
INSERT INTO ivoireio_packs (slug, name, description, price, icon, color, is_active, sort_order, includes, duration_days)
VALUES
  ('pack-lancement', 'Pack Lancement', 'Tout pour demarrer : logo, pitch deck, one pager et analyse marche en un seul achat.',
   10000, 'Rocket', '#f97316', true, 0,
   '["Logo HD (2 variations)","Pitch deck complet (PDF)","One pager professionnel","Analyse de marche"]',
   NULL),

  ('pack-investisseur', 'Pack Investisseur', 'Prepare ta levee de fonds : pitch deck pro, business plan et preparation investisseurs.',
   15000, 'TrendingUp', '#3b82f6', true, 1,
   '["Pitch deck pro (PDF export)","Business plan complet","Preparation levee de fonds","Analyse concurrence"]',
   NULL)
ON CONFLICT (slug) DO NOTHING;

-- ─── RLS — Plans ───
ALTER TABLE ivoireio_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_public_select ON ivoireio_plans FOR SELECT USING (true);

CREATE POLICY plans_admin_write ON ivoireio_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ─── RLS — Packs ───
ALTER TABLE ivoireio_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY packs_public_select ON ivoireio_packs FOR SELECT USING (true);

CREATE POLICY packs_admin_write ON ivoireio_packs FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ─── RLS — Pack Purchases ───
ALTER TABLE ivoireio_pack_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY pack_purchases_owner_select ON ivoireio_pack_purchases FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY pack_purchases_owner_insert ON ivoireio_pack_purchases FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY pack_purchases_admin_all ON ivoireio_pack_purchases FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ─── Update the profile plan constraint to allow all tiers ───
DO $$
BEGIN
  ALTER TABLE ivoireio_profiles DROP CONSTRAINT IF EXISTS ivoireio_profiles_plan_check;
  ALTER TABLE ivoireio_profiles ADD CONSTRAINT ivoireio_profiles_plan_check
    CHECK (plan IS NULL OR length(plan) <= 30);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ─── AI daily usage view (for rate limiting) ───
CREATE OR REPLACE VIEW ivoireio_ai_daily_usage AS
SELECT
  profile_id,
  DATE(created_at AT TIME ZONE 'UTC') AS usage_date,
  COUNT(*) AS generation_count
FROM ivoireio_ai_usage
GROUP BY profile_id, DATE(created_at AT TIME ZONE 'UTC');
