-- =====================================================
-- ivoire.io — Migration initiale
-- Préfixe : ivoireio_ sur toutes les tables
-- =====================================================

-- ─── PROFILES ───
CREATE TABLE IF NOT EXISTS ivoireio_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  city VARCHAR(50),
  bio TEXT,
  avatar_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  skills TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  type VARCHAR(20) DEFAULT 'developer' CHECK (type IN ('developer', 'startup', 'enterprise', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivoireio_profiles_slug ON ivoireio_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_ivoireio_profiles_skills ON ivoireio_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_ivoireio_profiles_type ON ivoireio_profiles(type);
CREATE INDEX IF NOT EXISTS idx_ivoireio_profiles_city ON ivoireio_profiles(city);

-- ─── PROJECTS ───
CREATE TABLE IF NOT EXISTS ivoireio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  stars INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivoireio_projects_profile ON ivoireio_projects(profile_id);

-- ─── EXPERIENCES ───
CREATE TABLE IF NOT EXISTS ivoireio_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivoireio_experiences_profile ON ivoireio_experiences(profile_id);

-- ─── WAITLIST ───
CREATE TABLE IF NOT EXISTS ivoireio_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  desired_slug VARCHAR(50),
  whatsapp VARCHAR(30),
  type VARCHAR(20) DEFAULT 'developer' CHECK (type IN ('developer', 'startup', 'enterprise', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONTACT MESSAGES ───
CREATE TABLE IF NOT EXISTS ivoireio_contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ivoireio_contact_messages_profile ON ivoireio_contact_messages(profile_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Profiles : lecture publique, écriture par le propriétaire
ALTER TABLE ivoireio_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ivoireio_profiles_select_public"
  ON ivoireio_profiles FOR SELECT
  USING (true);

CREATE POLICY "ivoireio_profiles_insert_own"
  ON ivoireio_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "ivoireio_profiles_update_own"
  ON ivoireio_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "ivoireio_profiles_delete_own"
  ON ivoireio_profiles FOR DELETE
  USING (auth.uid() = id);

-- Projects : lecture publique, écriture par le propriétaire du profil
ALTER TABLE ivoireio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ivoireio_projects_select_public"
  ON ivoireio_projects FOR SELECT
  USING (true);

CREATE POLICY "ivoireio_projects_insert_own"
  ON ivoireio_projects FOR INSERT
  WITH CHECK (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

CREATE POLICY "ivoireio_projects_update_own"
  ON ivoireio_projects FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

CREATE POLICY "ivoireio_projects_delete_own"
  ON ivoireio_projects FOR DELETE
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

-- Experiences : lecture publique, écriture par le propriétaire
ALTER TABLE ivoireio_experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ivoireio_experiences_select_public"
  ON ivoireio_experiences FOR SELECT
  USING (true);

CREATE POLICY "ivoireio_experiences_insert_own"
  ON ivoireio_experiences FOR INSERT
  WITH CHECK (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

CREATE POLICY "ivoireio_experiences_update_own"
  ON ivoireio_experiences FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

CREATE POLICY "ivoireio_experiences_delete_own"
  ON ivoireio_experiences FOR DELETE
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

-- Waitlist : insertion publique, lecture admin seulement
ALTER TABLE ivoireio_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ivoireio_waitlist_insert_public"
  ON ivoireio_waitlist FOR INSERT
  WITH CHECK (true);

-- Contact Messages : insertion publique, lecture par le propriétaire du profil
ALTER TABLE ivoireio_contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ivoireio_contact_insert_public"
  ON ivoireio_contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "ivoireio_contact_select_own"
  ON ivoireio_contact_messages FOR SELECT
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

CREATE POLICY "ivoireio_contact_update_own"
  ON ivoireio_contact_messages FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM ivoireio_profiles WHERE id = auth.uid())
  );

-- =====================================================
-- TRIGGER : auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION ivoireio_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ivoireio_profiles_updated_at
  BEFORE UPDATE ON ivoireio_profiles
  FOR EACH ROW
  EXECUTE FUNCTION ivoireio_update_updated_at();

-- =====================================================
-- STORAGE BUCKET (avatars & images projets)
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('ivoireio-avatars', 'ivoireio-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ivoireio-projects', 'ivoireio-projects', true)
ON CONFLICT (id) DO NOTHING;

-- Politique storage : upload par utilisateur authentifié, lecture publique
CREATE POLICY "ivoireio_avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ivoireio-avatars');

CREATE POLICY "ivoireio_avatars_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ivoireio-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "ivoireio_avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'ivoireio-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "ivoireio_projects_img_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ivoireio-projects');

CREATE POLICY "ivoireio_projects_img_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ivoireio-projects' AND auth.role() = 'authenticated');

CREATE POLICY "ivoireio_projects_img_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'ivoireio-projects' AND auth.uid()::text = (storage.foldername(name))[1]);
