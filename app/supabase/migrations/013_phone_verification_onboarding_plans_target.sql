-- Migration 013: Phone verification, onboarding, plans target type
-- Extends profiles for WhatsApp verification and onboarding wizard
-- Adds phone_verifications table for OTP flow
-- Adds target_type to plans for per-user-type pricing

-- 1. Profile extensions
ALTER TABLE ivoireio_profiles
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Unique constraint on verified phone (one phone per account)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_verified_phone
  ON ivoireio_profiles(verified_phone) WHERE verified_phone IS NOT NULL;

-- 2. Phone verifications (WhatsApp OTP)
CREATE TABLE IF NOT EXISTS ivoireio_phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_verif_profile ON ivoireio_phone_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_phone_verif_phone ON ivoireio_phone_verifications(phone_number);

-- 3. Plans: target_type for per-user-type pricing
ALTER TABLE ivoireio_plans
  ADD COLUMN IF NOT EXISTS target_type VARCHAR(20) DEFAULT 'all';

-- Update existing plans to target developers
UPDATE ivoireio_plans SET target_type = 'developer' WHERE tier IN ('free', 'builder', 'pro');
UPDATE ivoireio_plans SET target_type = 'startup' WHERE tier IN ('startup', 'growth');

-- 4. RLS for phone_verifications
ALTER TABLE ivoireio_phone_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY phone_verif_owner_select ON ivoireio_phone_verifications
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY phone_verif_owner_insert ON ivoireio_phone_verifications
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY phone_verif_admin_all ON ivoireio_phone_verifications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true
  ));
