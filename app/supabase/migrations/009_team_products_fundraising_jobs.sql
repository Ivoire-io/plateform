-- ============================================================
-- Migration 009 — Team Members, Products, Fundraising, Jobs
-- ============================================================

-- ─── Team Members ───
CREATE TABLE IF NOT EXISTS ivoireio_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES ivoireio_startups(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  email VARCHAR(320),
  linkedin VARCHAR(500),
  ivoireio_slug VARCHAR(100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_team_members_startup ON ivoireio_team_members(startup_id);

-- ─── Products ───
CREATE TABLE IF NOT EXISTS ivoireio_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES ivoireio_startups(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  short_desc VARCHAR(200),
  long_desc TEXT,
  category VARCHAR(50) DEFAULT 'autre',
  tech_stack TEXT[] DEFAULT '{}',
  website_url VARCHAR(500),
  app_store_url VARCHAR(500),
  play_store_url VARCHAR(500),
  docs_url VARCHAR(500),
  github_url VARCHAR(500),
  launch_date DATE,
  publish_on_portal BOOLEAN DEFAULT false,
  votes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_startup ON ivoireio_products(startup_id);
CREATE INDEX idx_products_published ON ivoireio_products(publish_on_portal) WHERE publish_on_portal = true;

-- ─── Fundraising ───
CREATE TABLE IF NOT EXISTS ivoireio_fundraising (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL UNIQUE REFERENCES ivoireio_startups(id) ON DELETE CASCADE,
  is_raising VARCHAR(10) DEFAULT 'no' CHECK (is_raising IN ('yes', 'no', 'hidden')),
  raise_type VARCHAR(20) DEFAULT 'preseed',
  target_amount NUMERIC(15, 2) DEFAULT 0,
  raised_amount NUMERIC(15, 2) DEFAULT 0,
  show_progress_on_profile BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Investors ───
CREATE TABLE IF NOT EXISTS ivoireio_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraising_id UUID NOT NULL REFERENCES ivoireio_fundraising(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  amount NUMERIC(15, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'negotiating' CHECK (status IN ('confirmed', 'negotiating', 'refused')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_investors_fundraising ON ivoireio_investors(fundraising_id);

-- ─── Fundraising Documents ───
CREATE TABLE IF NOT EXISTS ivoireio_fundraising_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraising_id UUID NOT NULL REFERENCES ivoireio_fundraising(id) ON DELETE CASCADE,
  doc_type VARCHAR(30) NOT NULL CHECK (doc_type IN ('pitch_deck', 'business_plan', 'one_pager')),
  file_url VARCHAR(1000) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fundraising_docs ON ivoireio_fundraising_documents(fundraising_id);

-- ─── Job Listings ───
CREATE TABLE IF NOT EXISTS ivoireio_job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES ivoireio_startups(id) ON DELETE SET NULL,
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  company VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  type VARCHAR(20) DEFAULT 'cdi' CHECK (type IN ('cdi', 'cdd', 'freelance', 'stage')),
  salary_min INT,
  salary_max INT,
  salary_currency VARCHAR(5) DEFAULT 'XOF',
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  tech_tags TEXT[] DEFAULT '{}',
  remote_ok BOOLEAN DEFAULT false,
  expires_at DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_listings_startup ON ivoireio_job_listings(startup_id);
CREATE INDEX idx_job_listings_status ON ivoireio_job_listings(status) WHERE status = 'active';
CREATE INDEX idx_job_listings_profile ON ivoireio_job_listings(profile_id);

-- ─── Updated_at triggers ───
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  -- Only create triggers if they don't already exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_members_updated_at') THEN
    CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON ivoireio_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON ivoireio_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fundraising_updated_at') THEN
    CREATE TRIGGER update_fundraising_updated_at BEFORE UPDATE ON ivoireio_fundraising FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_job_listings_updated_at') THEN
    CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON ivoireio_job_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ─── RLS Policies ───

-- Team Members
ALTER TABLE ivoireio_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_public_read" ON ivoireio_team_members
  FOR SELECT USING (true);

CREATE POLICY "team_members_owner_insert" ON ivoireio_team_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

CREATE POLICY "team_members_owner_update" ON ivoireio_team_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

CREATE POLICY "team_members_owner_delete" ON ivoireio_team_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

-- Products
ALTER TABLE ivoireio_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON ivoireio_products
  FOR SELECT USING (true);

CREATE POLICY "products_owner_insert" ON ivoireio_products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

CREATE POLICY "products_owner_update" ON ivoireio_products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

CREATE POLICY "products_owner_delete" ON ivoireio_products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

-- Fundraising
ALTER TABLE ivoireio_fundraising ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fundraising_owner_select" ON ivoireio_fundraising
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

CREATE POLICY "fundraising_owner_insert" ON ivoireio_fundraising
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

CREATE POLICY "fundraising_owner_update" ON ivoireio_fundraising
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM ivoireio_startups s WHERE s.id = startup_id AND s.profile_id = auth.uid())
  );

CREATE POLICY "fundraising_admin_select" ON ivoireio_fundraising
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- Investors
ALTER TABLE ivoireio_investors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investors_owner_select" ON ivoireio_investors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ivoireio_fundraising f
      JOIN ivoireio_startups s ON s.id = f.startup_id
      WHERE f.id = fundraising_id AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "investors_owner_insert" ON ivoireio_investors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ivoireio_fundraising f
      JOIN ivoireio_startups s ON s.id = f.startup_id
      WHERE f.id = fundraising_id AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "investors_owner_update" ON ivoireio_investors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM ivoireio_fundraising f
      JOIN ivoireio_startups s ON s.id = f.startup_id
      WHERE f.id = fundraising_id AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "investors_owner_delete" ON ivoireio_investors
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ivoireio_fundraising f
      JOIN ivoireio_startups s ON s.id = f.startup_id
      WHERE f.id = fundraising_id AND s.profile_id = auth.uid()
    )
  );

-- Fundraising Documents
ALTER TABLE ivoireio_fundraising_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fundraising_docs_owner_select" ON ivoireio_fundraising_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ivoireio_fundraising f
      JOIN ivoireio_startups s ON s.id = f.startup_id
      WHERE f.id = fundraising_id AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "fundraising_docs_owner_insert" ON ivoireio_fundraising_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ivoireio_fundraising f
      JOIN ivoireio_startups s ON s.id = f.startup_id
      WHERE f.id = fundraising_id AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "fundraising_docs_owner_delete" ON ivoireio_fundraising_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ivoireio_fundraising f
      JOIN ivoireio_startups s ON s.id = f.startup_id
      WHERE f.id = fundraising_id AND s.profile_id = auth.uid()
    )
  );

-- Job Listings
ALTER TABLE ivoireio_job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_public_read" ON ivoireio_job_listings
  FOR SELECT USING (status = 'active' OR profile_id = auth.uid());

CREATE POLICY "jobs_owner_insert" ON ivoireio_job_listings
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "jobs_owner_update" ON ivoireio_job_listings
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "jobs_owner_delete" ON ivoireio_job_listings
  FOR DELETE USING (profile_id = auth.uid());

CREATE POLICY "jobs_admin_select" ON ivoireio_job_listings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

-- ─── Storage bucket for fundraising documents ───
INSERT INTO storage.buckets (id, name, public) VALUES ('ivoireio-fundraising-docs', 'ivoireio-fundraising-docs', false) ON CONFLICT (id) DO NOTHING;
