-- =====================================================
-- ivoire.io — Migration 011
-- Paiements, abonnements, parrainage, tracking IA,
-- cache IA, dev outsourcing marketplace
-- =====================================================

-- ─── 1. SUBSCRIPTIONS ───
CREATE TABLE IF NOT EXISTS ivoireio_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise', 'student')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('manual', 'paypal', 'wave', 'orange_money', 'credit', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'cancelled', 'suspended')),
  amount INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(5) DEFAULT 'XOF',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_profile ON ivoireio_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON ivoireio_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON ivoireio_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON ivoireio_subscriptions(expires_at) WHERE expires_at IS NOT NULL;

-- ─── 2. PAYMENTS ───
CREATE TABLE IF NOT EXISTS ivoireio_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES ivoireio_subscriptions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(5) DEFAULT 'XOF',
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('manual', 'paypal', 'wave', 'orange_money', 'credit')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  -- Manual payment fields
  proof_url VARCHAR(1000),
  proof_file_name VARCHAR(500),
  bank_reference VARCHAR(200),
  -- PayPal fields
  paypal_order_id VARCHAR(200),
  paypal_capture_id VARCHAR(200),
  -- Admin review
  reviewed_by UUID REFERENCES ivoireio_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  -- General
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_profile ON ivoireio_payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON ivoireio_payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON ivoireio_payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_created ON ivoireio_payments(created_at DESC);

-- ─── 3. REFERRALS ───
CREATE TABLE IF NOT EXISTS ivoireio_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
  reward_type VARCHAR(20) CHECK (reward_type IN ('credit', 'upgrade', 'regeneration')),
  reward_amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON ivoireio_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON ivoireio_referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON ivoireio_referrals(referral_code);

-- ─── 4. CREDITS ───
CREATE TABLE IF NOT EXISTS ivoireio_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source VARCHAR(30) NOT NULL CHECK (source IN ('referral', 'purchase', 'promo', 'admin', 'refund')),
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credits_profile ON ivoireio_credits(profile_id);
CREATE INDEX IF NOT EXISTS idx_credits_source ON ivoireio_credits(source);

-- ─── 5. AI USAGE TRACKING ───
CREATE TABLE IF NOT EXISTS ivoireio_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  task VARCHAR(50) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  model VARCHAR(50) NOT NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0,
  cost_fcfa INTEGER DEFAULT 0,
  cached BOOLEAN DEFAULT false,
  cache_key VARCHAR(200),
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_profile ON ivoireio_ai_usage(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_task ON ivoireio_ai_usage(task);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ivoireio_ai_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON ivoireio_ai_usage(provider);

-- ─── 6. AI CACHE ───
CREATE TABLE IF NOT EXISTS ivoireio_ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(200) NOT NULL UNIQUE,
  task VARCHAR(50) NOT NULL,
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  input_hash VARCHAR(64) NOT NULL,
  result JSONB NOT NULL,
  hits INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ivoireio_ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ivoireio_ai_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_profile ON ivoireio_ai_cache(profile_id);

-- ─── 7. DEV REQUESTS ───
CREATE TABLE IF NOT EXISTS ivoireio_dev_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES ivoireio_startups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  cahier_charges_ref TEXT,
  required_roles TEXT[] DEFAULT '{}',
  budget_min INTEGER,
  budget_max INTEGER,
  timeline VARCHAR(50),
  payment_type VARCHAR(20) DEFAULT 'one_shot' CHECK (payment_type IN ('one_shot', 'installments', 'partnership')),
  installments_count INTEGER DEFAULT 1,
  partnership_percentage NUMERIC(5, 2),
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewing', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_requests_startup ON ivoireio_dev_requests(startup_id);
CREATE INDEX IF NOT EXISTS idx_dev_requests_profile ON ivoireio_dev_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_dev_requests_status ON ivoireio_dev_requests(status);

-- ─── 8. DEV QUOTES ───
CREATE TABLE IF NOT EXISTS ivoireio_dev_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_request_id UUID NOT NULL REFERENCES ivoireio_dev_requests(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency VARCHAR(5) DEFAULT 'XOF',
  timeline VARCHAR(100),
  scope TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  team_composition JSONB DEFAULT '[]',
  payment_schedule JSONB DEFAULT '[]',
  discount_applied NUMERIC(5, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until TIMESTAMPTZ,
  admin_id UUID REFERENCES ivoireio_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_quotes_request ON ivoireio_dev_quotes(dev_request_id);
CREATE INDEX IF NOT EXISTS idx_dev_quotes_status ON ivoireio_dev_quotes(status);

-- ─── 9. DEV PROJECTS ───
CREATE TABLE IF NOT EXISTS ivoireio_dev_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_request_id UUID NOT NULL REFERENCES ivoireio_dev_requests(id) ON DELETE CASCADE,
  dev_quote_id UUID NOT NULL REFERENCES ivoireio_dev_quotes(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES ivoireio_startups(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  status VARCHAR(20) DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'review', 'completed', 'paused', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_amount INTEGER NOT NULL,
  paid_amount INTEGER DEFAULT 0,
  current_milestone VARCHAR(200),
  milestones JSONB DEFAULT '[]',
  team_assigned JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_projects_request ON ivoireio_dev_projects(dev_request_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_startup ON ivoireio_dev_projects(startup_id);
CREATE INDEX IF NOT EXISTS idx_dev_projects_status ON ivoireio_dev_projects(status);

-- ─── ALTER PROFILES ───

-- Add referral columns
ALTER TABLE ivoireio_profiles
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES ivoireio_profiles(id);

-- Extend plan CHECK to include new tiers
ALTER TABLE ivoireio_profiles DROP CONSTRAINT IF EXISTS ivoireio_profiles_plan_check;
ALTER TABLE ivoireio_profiles
  ADD CONSTRAINT ivoireio_profiles_plan_check
    CHECK (plan IN ('free', 'starter', 'pro', 'enterprise', 'student'));

-- Rename existing 'premium' values to 'pro'
UPDATE ivoireio_profiles SET plan = 'pro' WHERE plan = 'premium';

-- ─── STORAGE BUCKET ───
INSERT INTO storage.buckets (id, name, public)
VALUES ('ivoireio-payment-proofs', 'ivoireio-payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- ─── TRIGGERS (updated_at) ───
-- Reuse the existing trigger function from migration 001
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON ivoireio_subscriptions
      FOR EACH ROW EXECUTE FUNCTION ivoireio_update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payments_updated_at') THEN
    CREATE TRIGGER update_payments_updated_at
      BEFORE UPDATE ON ivoireio_payments
      FOR EACH ROW EXECUTE FUNCTION ivoireio_update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dev_requests_updated_at') THEN
    CREATE TRIGGER update_dev_requests_updated_at
      BEFORE UPDATE ON ivoireio_dev_requests
      FOR EACH ROW EXECUTE FUNCTION ivoireio_update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dev_quotes_updated_at') THEN
    CREATE TRIGGER update_dev_quotes_updated_at
      BEFORE UPDATE ON ivoireio_dev_quotes
      FOR EACH ROW EXECUTE FUNCTION ivoireio_update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dev_projects_updated_at') THEN
    CREATE TRIGGER update_dev_projects_updated_at
      BEFORE UPDATE ON ivoireio_dev_projects
      FOR EACH ROW EXECUTE FUNCTION ivoireio_update_updated_at();
  END IF;
END $$;

-- ─── RLS POLICIES ───

-- Subscriptions
ALTER TABLE ivoireio_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_owner_select ON ivoireio_subscriptions FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY subscriptions_admin_all ON ivoireio_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Payments
ALTER TABLE ivoireio_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_owner_select ON ivoireio_payments FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY payments_owner_insert ON ivoireio_payments FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY payments_admin_all ON ivoireio_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Referrals
ALTER TABLE ivoireio_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY referrals_owner_select ON ivoireio_referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY referrals_public_insert ON ivoireio_referrals FOR INSERT WITH CHECK (true);
CREATE POLICY referrals_admin_all ON ivoireio_referrals FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Credits
ALTER TABLE ivoireio_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY credits_owner_select ON ivoireio_credits FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY credits_admin_all ON ivoireio_credits FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- AI Usage
ALTER TABLE ivoireio_ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_owner_select ON ivoireio_ai_usage FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY ai_usage_admin_select ON ivoireio_ai_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- AI Cache (admin + service role only)
ALTER TABLE ivoireio_ai_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_cache_admin_all ON ivoireio_ai_cache FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Dev Requests
ALTER TABLE ivoireio_dev_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY dev_requests_owner_select ON ivoireio_dev_requests FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY dev_requests_owner_insert ON ivoireio_dev_requests FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY dev_requests_owner_update ON ivoireio_dev_requests FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY dev_requests_admin_all ON ivoireio_dev_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- Dev Quotes
ALTER TABLE ivoireio_dev_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY dev_quotes_admin_all ON ivoireio_dev_quotes FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);
CREATE POLICY dev_quotes_owner_select ON ivoireio_dev_quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM ivoireio_dev_requests r WHERE r.id = dev_request_id AND r.profile_id = auth.uid())
);

-- Dev Projects
ALTER TABLE ivoireio_dev_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY dev_projects_admin_all ON ivoireio_dev_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);
CREATE POLICY dev_projects_owner_select ON ivoireio_dev_projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
);

-- Storage policies for payment proofs
CREATE POLICY payment_proofs_owner_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ivoireio-payment-proofs' AND auth.uid() IS NOT NULL);
CREATE POLICY payment_proofs_admin_select ON storage.objects FOR SELECT
  USING (bucket_id = 'ivoireio-payment-proofs' AND EXISTS (
    SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  ));
CREATE POLICY payment_proofs_owner_select ON storage.objects FOR SELECT
  USING (bucket_id = 'ivoireio-payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ─── CACHE CLEANUP FUNCTION ───
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM ivoireio_ai_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ─── SEED PLATFORM CONFIG ───
INSERT INTO ivoireio_platform_config (key, value) VALUES
  ('pricing', '{"free": {"amount": 0, "type": "free", "label": "Gratuit"}, "starter": {"amount": 5000, "type": "one_time", "label": "Starter"}, "student": {"amount": 2000, "type": "one_time", "label": "Etudiant"}, "pro": {"amount": 35000, "type": "yearly", "label": "Pro"}, "enterprise": {"amount": 150000, "type": "yearly", "label": "Enterprise"}}'::jsonb),
  ('payment_providers', '{"manual": {"enabled": true, "bank_name": "", "account_number": "", "account_name": "", "instructions": "Effectuez un virement bancaire puis uploadez votre preuve de paiement."}, "paypal": {"enabled": false, "mode": "sandbox"}, "wave": {"enabled": false}, "orange_money": {"enabled": false}}'::jsonb),
  ('plan_limits', '{
    "free": {"max_projects": 3, "max_team_members": 3, "max_products": 1, "max_job_listings": 1, "max_ai_generations_per_day": 5, "max_logo_variations": 1, "max_regenerations": 1, "allowed_templates": "free", "features": {"pitch_deck": false, "cahier_charges": false, "business_plan": false, "one_pager": false, "cgu": false, "roadmap": false, "competitors_analysis": false, "oapi_check": false, "timestamp": false, "export_pdf": false, "fundraising": false, "advanced_stats": false, "verified_badge": false, "priority_visibility": false, "homepage_featured": false, "dev_outsourcing": false}},
    "starter": {"max_projects": 10, "max_team_members": 5, "max_products": 3, "max_job_listings": 1, "max_ai_generations_per_day": 15, "max_logo_variations": 3, "max_regenerations": 3, "allowed_templates": "free+1", "features": {"pitch_deck": true, "cahier_charges": false, "business_plan": false, "one_pager": true, "cgu": false, "roadmap": false, "competitors_analysis": true, "oapi_check": true, "timestamp": true, "export_pdf": true, "fundraising": false, "advanced_stats": false, "verified_badge": false, "priority_visibility": false, "homepage_featured": false, "dev_outsourcing": false}},
    "student": {"max_projects": 10, "max_team_members": 5, "max_products": 3, "max_job_listings": 1, "max_ai_generations_per_day": 15, "max_logo_variations": 3, "max_regenerations": 3, "allowed_templates": "free+1", "features": {"pitch_deck": true, "cahier_charges": false, "business_plan": false, "one_pager": true, "cgu": false, "roadmap": false, "competitors_analysis": true, "oapi_check": true, "timestamp": true, "export_pdf": true, "fundraising": false, "advanced_stats": false, "verified_badge": false, "priority_visibility": false, "homepage_featured": false, "dev_outsourcing": false}},
    "pro": {"max_projects": null, "max_team_members": null, "max_products": null, "max_job_listings": null, "max_ai_generations_per_day": null, "max_logo_variations": 3, "max_regenerations": null, "allowed_templates": "all", "features": {"pitch_deck": true, "cahier_charges": true, "business_plan": true, "one_pager": true, "cgu": true, "roadmap": true, "competitors_analysis": true, "oapi_check": true, "timestamp": true, "export_pdf": true, "fundraising": true, "advanced_stats": true, "verified_badge": true, "priority_visibility": true, "homepage_featured": false, "dev_outsourcing": true}},
    "enterprise": {"max_projects": null, "max_team_members": null, "max_products": null, "max_job_listings": null, "max_ai_generations_per_day": null, "max_logo_variations": null, "max_regenerations": null, "allowed_templates": "all+corporate", "features": {"pitch_deck": true, "cahier_charges": true, "business_plan": true, "one_pager": true, "cgu": true, "roadmap": true, "competitors_analysis": true, "oapi_check": true, "timestamp": true, "export_pdf": true, "fundraising": true, "advanced_stats": true, "verified_badge": true, "priority_visibility": true, "homepage_featured": true, "dev_outsourcing": true}}
  }'::jsonb),
  ('referral_config', '{"enabled": true, "starter_reward_referrer": 1000, "starter_reward_referred": 500, "pro_reward_referrer": 5000, "pro_reward_referred": 5000}'::jsonb),
  ('free_slots_total', '100'::jsonb),
  ('free_slots_remaining', '100'::jsonb)
ON CONFLICT (key) DO NOTHING;
