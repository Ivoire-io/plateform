-- ─── SEED : Profil de test ulrich.ivoire.io ───────────────────────────────
-- À exécuter APRÈS 001_initial_schema.sql
-- SQL Editor : https://supabase.com/dashboard/project/xgcmyktcgwqdeqfudkzl/sql/new

INSERT INTO ivoireio_profiles (
  slug, email, full_name, title, city, bio,
  avatar_url, github_url, linkedin_url, twitter_url,
  skills, is_available, type
) VALUES (
  'ulrich',
  'ulrich@ivoire.io',
  'Ulrich Kouamé',
  'Lead Developer & Fondateur ivoire.io',
  'Abidjan, Côte d''Ivoire',
  'Développeur passionné, fondateur de ivoire.io — Le hub digital de la tech ivoirienne. Je construis des produits qui connectent les talents tech de Côte d''Ivoire au monde.',
  null,
  'https://github.com/ulrichkouame',
  'https://linkedin.com/in/ulrichkouame',
  'https://twitter.com/ulrichkouame',
  ARRAY['Next.js', 'TypeScript', 'React', 'Supabase', 'Tailwind CSS', 'Node.js'],
  true,
  'developer'
) ON CONFLICT (slug) DO NOTHING;

-- Récupère l'id du profil inséré
WITH profile AS (
  SELECT id FROM ivoireio_profiles WHERE slug = 'ulrich'
)
INSERT INTO ivoireio_projects (profile_id, name, description, tech_stack, github_url, demo_url, sort_order)
SELECT
  profile.id,
  p.name, p.description, p.tech_stack, p.github_url, p.demo_url, p.sort_order
FROM profile, (VALUES
  (
    'ivoire.io',
    'Le hub central des développeurs, startups et services tech de Côte d''Ivoire. Portfolio, annuaire et marketplace.',
    ARRAY['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    'https://github.com/ulrichkouame/ivoire.io',
    'https://ivoire.io',
    1
  ),
  (
    'Portfolio Builder',
    'Générateur de portfolios dynamiques accessibles via sous-domaine personnalisé. Infrastructure serverless sur Vercel.',
    ARRAY['Next.js', 'React', 'PostgreSQL', 'Vercel Edge'],
    null,
    'https://ulrich.ivoire.io',
    2
  )
) AS p(name, description, tech_stack, github_url, demo_url, sort_order)
ON CONFLICT DO NOTHING;

WITH profile AS (
  SELECT id FROM ivoireio_profiles WHERE slug = 'ulrich'
)
INSERT INTO ivoireio_experiences (profile_id, role, company, start_date, end_date, description, sort_order)
SELECT
  profile.id,
  e.role, e.company, e.start_date, e.end_date, e.description, e.sort_order
FROM profile, (VALUES
  (
    'Fondateur & Lead Developer',
    'ivoire.io',
    '2026-01-01'::DATE,
    NULL::DATE,
    'Construction du hub digital de la tech ivoirienne. Architecture, développement et lancement du produit.',
    1
  ),
  (
    'Développeur Full-Stack',
    'Freelance',
    '2023-01-01'::DATE,
    '2025-12-31'::DATE,
    'Développement d''applications web et mobiles pour des clients en Côte d''Ivoire et en Europe.',
    2
  )
) AS e(role, company, start_date, end_date, description, sort_order)
ON CONFLICT DO NOTHING;
