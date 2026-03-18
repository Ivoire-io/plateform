-- =====================================================
-- ivoire.io — Waitlist invites & conversion tracking
-- Ajoute les colonnes nécessaires au workflow:
-- waitlist -> invitation admin -> création profil -> accès utilisateur
-- =====================================================

ALTER TABLE ivoireio_waitlist
  ADD COLUMN IF NOT EXISTS invited BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS converted_profile_id UUID REFERENCES ivoireio_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_ivoireio_waitlist_invited ON ivoireio_waitlist(invited);
CREATE INDEX IF NOT EXISTS idx_ivoireio_waitlist_converted ON ivoireio_waitlist(converted_at DESC);

