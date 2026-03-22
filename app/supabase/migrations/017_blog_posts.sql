-- Blog posts table for dynamic content management
CREATE TABLE IF NOT EXISTS ivoireio_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID REFERENCES ivoireio_profiles(id),
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for public queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON ivoireio_blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON ivoireio_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON ivoireio_blog_posts(category);

-- RLS
ALTER TABLE ivoireio_blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog posts: public read published"
  ON ivoireio_blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Blog posts: admin full access"
  ON ivoireio_blog_posts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM ivoireio_profiles WHERE id = auth.uid() AND is_admin = true)
  );
