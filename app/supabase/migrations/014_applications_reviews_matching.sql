-- Migration 014: Job applications, Reviews/Ratings, Matching system

-- 1. Job Applications
CREATE TABLE IF NOT EXISTS ivoireio_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES ivoireio_job_listings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  cv_url TEXT,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected', 'withdrawn')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_job_apps_job ON ivoireio_job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_profile ON ivoireio_job_applications(profile_id);

-- 2. Reviews / Ratings
CREATE TABLE IF NOT EXISTS ivoireio_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  project_ref UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status VARCHAR(20) DEFAULT 'published'
    CHECK (status IN ('published', 'hidden', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewed_id, project_ref)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON ivoireio_reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON ivoireio_reviews(reviewer_id);

-- Average rating view
CREATE OR REPLACE VIEW ivoireio_profile_ratings AS
SELECT
  reviewed_id AS profile_id,
  COUNT(*) AS review_count,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating
FROM ivoireio_reviews
WHERE status = 'published'
GROUP BY reviewed_id;

-- 3. Matching
CREATE TABLE IF NOT EXISTS ivoireio_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dev_id UUID NOT NULL REFERENCES ivoireio_profiles(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('dev_request', 'job_listing', 'startup')),
  entity_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  match_reasons JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'new'
    CHECK (status IN ('new', 'viewed', 'contacted', 'accepted', 'dismissed')),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dev_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_dev ON ivoireio_matches(dev_id);
CREATE INDEX IF NOT EXISTS idx_matches_entity ON ivoireio_matches(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON ivoireio_matches(score DESC);

-- 4. RLS
ALTER TABLE ivoireio_job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivoireio_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ivoireio_matches ENABLE ROW LEVEL SECURITY;

-- Job applications: applicant can see/create own
CREATE POLICY job_apps_applicant_select ON ivoireio_job_applications
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY job_apps_applicant_insert ON ivoireio_job_applications
  FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY job_apps_applicant_update ON ivoireio_job_applications
  FOR UPDATE USING (profile_id = auth.uid());

-- Job applications: job poster can see applications for their jobs
CREATE POLICY job_apps_poster_select ON ivoireio_job_applications
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ivoireio_job_listings j WHERE j.id = job_id AND j.profile_id = auth.uid()
  ));
CREATE POLICY job_apps_poster_update ON ivoireio_job_applications
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM ivoireio_job_listings j WHERE j.id = job_id AND j.profile_id = auth.uid()
  ));

-- Reviews: public read published, owner insert
CREATE POLICY reviews_public_read ON ivoireio_reviews
  FOR SELECT USING (status = 'published');
CREATE POLICY reviews_owner_insert ON ivoireio_reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Matches: dev can read own
CREATE POLICY matches_dev_select ON ivoireio_matches
  FOR SELECT USING (dev_id = auth.uid());
CREATE POLICY matches_dev_update ON ivoireio_matches
  FOR UPDATE USING (dev_id = auth.uid());

-- Admin policies for all three
CREATE POLICY job_apps_admin ON ivoireio_job_applications FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY reviews_admin ON ivoireio_reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
CREATE POLICY matches_admin ON ivoireio_matches FOR ALL
  USING (EXISTS (SELECT 1 FROM ivoireio_profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
