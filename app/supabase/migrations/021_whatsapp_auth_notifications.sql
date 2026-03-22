-- Migration 021: WhatsApp OTP auth (public), notifications, WhatsApp logs & templates
-- Extends phone_verifications for anonymous OTP, adds notifications table,
-- adds WhatsApp admin logging and templates tables

-- A. phone_verifications: support anonymous OTP (before authentication)
ALTER TABLE ivoireio_phone_verifications
  ALTER COLUMN profile_id DROP NOT NULL;

ALTER TABLE ivoireio_phone_verifications
  ADD COLUMN IF NOT EXISTS session_token VARCHAR(64),
  ADD COLUMN IF NOT EXISTS purpose VARCHAR(20) DEFAULT 'settings'
    CHECK (purpose IN ('settings', 'registration', 'login'));

CREATE INDEX IF NOT EXISTS idx_phone_verif_session
  ON ivoireio_phone_verifications(session_token) WHERE session_token IS NOT NULL;

-- B. Notifications
CREATE TABLE IF NOT EXISTS ivoireio_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  link VARCHAR(500),
  read BOOLEAN DEFAULT false,
  channel VARCHAR(20) DEFAULT 'inapp' CHECK (channel IN ('inapp', 'whatsapp', 'email')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_profile ON ivoireio_notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON ivoireio_notifications(profile_id, read) WHERE read = false;

-- C. WhatsApp logs (admin visibility)
CREATE TABLE IF NOT EXISTS ivoireio_whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  message_type VARCHAR(30) DEFAULT 'text',
  content TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  profile_id UUID REFERENCES ivoireio_profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_logs_phone ON ivoireio_whatsapp_logs(phone);
CREATE INDEX IF NOT EXISTS idx_wa_logs_created ON ivoireio_whatsapp_logs(created_at DESC);

-- D. WhatsApp templates (admin)
CREATE TABLE IF NOT EXISTS ivoireio_whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Notification preferences on profiles
ALTER TABLE ivoireio_profiles
  ADD COLUMN IF NOT EXISTS notif_whatsapp BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_inapp BOOLEAN DEFAULT true;

-- F. RLS
ALTER TABLE ivoireio_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_own ON ivoireio_notifications FOR ALL USING (auth.uid() = profile_id);

ALTER TABLE ivoireio_whatsapp_logs ENABLE ROW LEVEL SECURITY;
-- Admin-only: no public RLS policy (accessed via supabaseAdmin)

ALTER TABLE ivoireio_whatsapp_templates ENABLE ROW LEVEL SECURITY;
-- Admin-only: no public RLS policy (accessed via supabaseAdmin)
