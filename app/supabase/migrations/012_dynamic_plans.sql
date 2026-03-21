-- ============================================================
-- Migration 012 — Dynamic Plans Table
-- Plans are now fully administrable from the admin dashboard.
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
  billing_type VARCHAR(20) DEFAULT 'free' CHECK (billing_type IN ('free', 'monthly', 'yearly', 'one_time')),
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

-- ─── Seed default plans ───
INSERT INTO ivoireio_plans (tier, name, tagline, description, price, billing_type, icon, color, is_active, is_highlighted, sort_order,
  max_projects, max_team_members, max_products, max_job_listings, max_ai_generations_per_day, max_logo_variations, max_regenerations, allowed_templates,
  features, display_features)
VALUES
  -- FREE
  ('free', 'Gratuit', 'Pour explorer la plateforme',
   'Decouvrez ivoire.io sans engagement. Creez vos premiers projets et testez nos outils IA.',
   0, 'free', 'Zap', '#6b7280', true, false, 0,
   2, 2, 1, 0, 3, 1, 1, 'free',
   '{"pitch_deck":false,"cahier_charges":false,"business_plan":false,"one_pager":false,"cgu":false,"roadmap":false,"competitors_analysis":false,"oapi_check":false,"timestamp":false,"export_pdf":false,"fundraising":false,"advanced_stats":false,"verified_badge":false,"priority_visibility":false,"homepage_featured":false,"dev_outsourcing":false}',
   '["2 projets maximum","2 templates gratuits","1 variation de logo","3 generations IA / jour","Stats basiques","Branding ivoire.io sur les exports"]'),

  -- STUDENT
  ('student', 'Student', 'Pour les etudiants entrepreneurs',
   'Construisez votre premier projet serieusement. Acces aux outils essentiels a prix reduit.',
   2000, 'monthly', 'GraduationCap', '#8b5cf6', true, false, 1,
   5, 3, 2, 1, 10, 2, 2, 'free+1',
   '{"pitch_deck":true,"cahier_charges":false,"business_plan":false,"one_pager":true,"cgu":false,"roadmap":false,"competitors_analysis":true,"oapi_check":false,"timestamp":true,"export_pdf":true,"fundraising":false,"advanced_stats":false,"verified_badge":false,"priority_visibility":false,"homepage_featured":false,"dev_outsourcing":false}',
   '["5 projets maximum","Templates gratuits + 1 premium","Mini pitch exportable","Export PDF propre","2 variations de logo","10 generations IA / jour","Acces a la communaute","Support par email"]'),

  -- STARTER (now monthly instead of one-time)
  ('starter', 'Builder', 'Pour lancer votre startup',
   'Tout ce qu''il faut pour valider votre idee et demarcher vos premiers clients.',
   5000, 'monthly', 'Rocket', '#0ea5e9', true, false, 2,
   10, 5, 3, 2, 20, 3, 3, 'free+1',
   '{"pitch_deck":true,"cahier_charges":false,"business_plan":false,"one_pager":true,"cgu":false,"roadmap":false,"competitors_analysis":true,"oapi_check":true,"timestamp":true,"export_pdf":true,"fundraising":false,"advanced_stats":false,"verified_badge":false,"priority_visibility":false,"homepage_featured":false,"dev_outsourcing":false}',
   '["10 projets maximum","Templates gratuits + 1 premium","Pitch Deck genere par IA","One Pager professionnel","Analyse de la concurrence","Verification OAPI (marque)","3 variations de logo","20 generations IA / jour"]'),

  -- PRO
  ('pro', 'Pro', 'Pour scaler votre startup',
   'La puissance complete de la plateforme : IA, investisseurs, dev outsourcing. Tout pour passer a l''echelle.',
   30000, 'yearly', 'Crown', '#f97316', true, true, 3,
   NULL, NULL, NULL, NULL, NULL, 5, NULL, 'all',
   '{"pitch_deck":true,"cahier_charges":true,"business_plan":true,"one_pager":true,"cgu":true,"roadmap":true,"competitors_analysis":true,"oapi_check":true,"timestamp":true,"export_pdf":true,"fundraising":true,"advanced_stats":true,"verified_badge":true,"priority_visibility":true,"homepage_featured":false,"dev_outsourcing":true}',
   '["Projets illimites","Tous les templates","Pitch Deck, Business Plan, Cahier des charges","CGU, Roadmap produit generes par IA","Stats avancees + Export PDF","Badge startup verifie","Mise en relation devs verifies","Listing investisseurs africains","5 variations de logo","Generations IA illimitees","Support prioritaire"]'),

  -- ENTERPRISE (renamed to Growth in description)
  ('enterprise', 'Enterprise', 'Pour les grandes ambitions',
   'Accompagnement personnalise, templates corporate exclusifs et ressources illimitees pour les structures etablies.',
   150000, 'yearly', 'Shield', '#eab308', true, false, 4,
   NULL, NULL, NULL, NULL, NULL, 10, NULL, 'all+corporate',
   '{"pitch_deck":true,"cahier_charges":true,"business_plan":true,"one_pager":true,"cgu":true,"roadmap":true,"competitors_analysis":true,"oapi_check":true,"timestamp":true,"export_pdf":true,"fundraising":true,"advanced_stats":true,"verified_badge":true,"priority_visibility":true,"homepage_featured":true,"dev_outsourcing":true}',
   '["Projets illimites","Tous les templates + corporate exclusifs","Toutes les fonctionnalites Pro","Generations IA illimitees","10 variations de logo","Account manager dedie","Accompagnement personnalise","Rapports sur mesure","SLA garanti","Facturation entreprise"]')
ON CONFLICT (tier) DO NOTHING;

-- ─── RLS ───
ALTER TABLE ivoireio_plans ENABLE ROW LEVEL SECURITY;

-- Public read (pricing page, subscription tab)
CREATE POLICY plans_public_select ON ivoireio_plans FOR SELECT USING (true);

-- Admin-only write
CREATE POLICY plans_admin_write ON ivoireio_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ─── Update the profile plan constraint to allow all tiers ───
-- Drop old constraint if exists and add new flexible one
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
