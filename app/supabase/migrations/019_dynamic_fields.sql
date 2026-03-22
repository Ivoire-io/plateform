-- =====================================================
-- MIGRATION 019: Dynamic Fields (lookup tables)
-- =====================================================
-- Centralised reference data managed from admin panel.
-- Replaces hardcoded lists for cities, skills, sectors, stages, etc.

CREATE TABLE IF NOT EXISTS ivoireio_dynamic_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,   -- 'city' | 'skill' | 'sector' | 'stage' | 'company_size' | 'product_category' | 'looking_for' | 'country'
  value VARCHAR(150) NOT NULL,      -- The stored value (slug-like, lowercase)
  label VARCHAR(150) NOT NULL,      -- Human-readable label shown in UI
  parent VARCHAR(150),              -- Optional grouping (e.g. region for city, or "frontend" for skill)
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, value)
);

CREATE INDEX IF NOT EXISTS idx_dynamic_fields_category ON ivoireio_dynamic_fields(category);
CREATE INDEX IF NOT EXISTS idx_dynamic_fields_active ON ivoireio_dynamic_fields(category, is_active);

-- Seed: Villes de Cote d'Ivoire (communes principales)
INSERT INTO ivoireio_dynamic_fields (category, value, label, parent, sort_order) VALUES
  ('city', 'abidjan-cocody',      'Cocody, Abidjan',          'Abidjan', 1),
  ('city', 'abidjan-plateau',     'Plateau, Abidjan',         'Abidjan', 2),
  ('city', 'abidjan-marcory',     'Marcory, Abidjan',         'Abidjan', 3),
  ('city', 'abidjan-treichville', 'Treichville, Abidjan',     'Abidjan', 4),
  ('city', 'abidjan-yopougon',    'Yopougon, Abidjan',        'Abidjan', 5),
  ('city', 'abidjan-abobo',       'Abobo, Abidjan',           'Abidjan', 6),
  ('city', 'abidjan-adjame',      'Adjame, Abidjan',          'Abidjan', 7),
  ('city', 'abidjan-koumassi',    'Koumassi, Abidjan',        'Abidjan', 8),
  ('city', 'abidjan-port-bouet',  'Port-Bouet, Abidjan',      'Abidjan', 9),
  ('city', 'abidjan-attiecoube',  'Attiecoube, Abidjan',      'Abidjan', 10),
  ('city', 'abidjan-anyama',      'Anyama, Abidjan',          'Abidjan', 11),
  ('city', 'abidjan-bingerville', 'Bingerville, Abidjan',     'Abidjan', 12),
  ('city', 'abidjan-songon',      'Songon, Abidjan',          'Abidjan', 13),
  ('city', 'bouake',              'Bouake',                    'Interieur', 14),
  ('city', 'daloa',               'Daloa',                    'Interieur', 15),
  ('city', 'yamoussoukro',        'Yamoussoukro',             'Interieur', 16),
  ('city', 'san-pedro',           'San-Pedro',                'Interieur', 17),
  ('city', 'korhogo',             'Korhogo',                  'Interieur', 18),
  ('city', 'man',                 'Man',                      'Interieur', 19),
  ('city', 'gagnoa',              'Gagnoa',                   'Interieur', 20),
  ('city', 'divo',                'Divo',                     'Interieur', 21),
  ('city', 'abengourou',          'Abengourou',               'Interieur', 22),
  ('city', 'other',               'Autre',                    NULL, 99)
ON CONFLICT (category, value) DO NOTHING;

-- Seed: Competences techniques
INSERT INTO ivoireio_dynamic_fields (category, value, label, parent, sort_order) VALUES
  ('skill', 'react',          'React',          'Frontend',  1),
  ('skill', 'nextjs',         'Next.js',        'Frontend',  2),
  ('skill', 'vuejs',          'Vue.js',         'Frontend',  3),
  ('skill', 'angular',        'Angular',        'Frontend',  4),
  ('skill', 'typescript',     'TypeScript',     'Frontend',  5),
  ('skill', 'tailwindcss',    'TailwindCSS',    'Frontend',  6),
  ('skill', 'nodejs',         'Node.js',        'Backend',   7),
  ('skill', 'python',         'Python',         'Backend',   8),
  ('skill', 'go',             'Go',             'Backend',   9),
  ('skill', 'php',            'PHP',            'Backend',  10),
  ('skill', 'laravel',        'Laravel',        'Backend',  11),
  ('skill', 'django',         'Django',         'Backend',  12),
  ('skill', 'java',           'Java',           'Backend',  13),
  ('skill', 'kotlin',         'Kotlin',         'Mobile',   14),
  ('skill', 'swift',          'Swift',          'Mobile',   15),
  ('skill', 'flutter',        'Flutter',        'Mobile',   16),
  ('skill', 'react-native',   'React Native',   'Mobile',   17),
  ('skill', 'postgresql',     'PostgreSQL',     'Data',     18),
  ('skill', 'mongodb',        'MongoDB',        'Data',     19),
  ('skill', 'docker',         'Docker',         'DevOps',   20),
  ('skill', 'aws',            'AWS',            'DevOps',   21),
  ('skill', 'firebase',       'Firebase',       'DevOps',   22),
  ('skill', 'figma',          'Figma',          'Design',   23)
ON CONFLICT (category, value) DO NOTHING;

-- Seed: Secteurs
INSERT INTO ivoireio_dynamic_fields (category, value, label, parent, sort_order) VALUES
  ('sector', 'tech',        'Tech',         NULL, 1),
  ('sector', 'fintech',     'Fintech',      NULL, 2),
  ('sector', 'agritech',    'AgriTech',     NULL, 3),
  ('sector', 'healthtech',  'HealthTech',   NULL, 4),
  ('sector', 'edtech',      'EdTech',       NULL, 5),
  ('sector', 'ecommerce',   'E-commerce',   NULL, 6),
  ('sector', 'saas',        'SaaS',         NULL, 7),
  ('sector', 'marketplace', 'Marketplace',  NULL, 8),
  ('sector', 'logistics',   'Logistique',   NULL, 9),
  ('sector', 'media',       'Media',        NULL, 10),
  ('sector', 'energy',      'Energie',      NULL, 11),
  ('sector', 'ai',          'IA',           NULL, 12),
  ('sector', 'realestate',  'Immobilier',   NULL, 13),
  ('sector', 'consulting',  'Consulting',   NULL, 14),
  ('sector', 'telecom',     'Telecom',      NULL, 15),
  ('sector', 'banking',     'Banque',       NULL, 16),
  ('sector', 'industry',    'Industrie',    NULL, 17),
  ('sector', 'health',      'Sante',        NULL, 18),
  ('sector', 'education',   'Education',    NULL, 19),
  ('sector', 'other',       'Autre',        NULL, 99)
ON CONFLICT (category, value) DO NOTHING;

-- Seed: Stages
INSERT INTO ivoireio_dynamic_fields (category, value, label, parent, sort_order) VALUES
  ('stage', 'idea',       'Idee',       NULL, 1),
  ('stage', 'mvp',        'MVP',        NULL, 2),
  ('stage', 'preseed',    'Pre-seed',   NULL, 3),
  ('stage', 'seed',       'Seed',       NULL, 4),
  ('stage', 'series_a',   'Serie A',    NULL, 5),
  ('stage', 'series_b',   'Serie B+',   NULL, 6),
  ('stage', 'growth',     'Croissance', NULL, 7),
  ('stage', 'profitable', 'Rentable',   NULL, 8),
  ('stage', 'acquired',   'Acquise',    NULL, 9)
ON CONFLICT (category, value) DO NOTHING;

-- Seed: Company sizes
INSERT INTO ivoireio_dynamic_fields (category, value, label, parent, sort_order) VALUES
  ('company_size', '1-10',   '1-10',   NULL, 1),
  ('company_size', '11-50',  '11-50',  NULL, 2),
  ('company_size', '51-200', '51-200', NULL, 3),
  ('company_size', '200+',   '200+',   NULL, 4)
ON CONFLICT (category, value) DO NOTHING;

-- RLS: Allow authenticated users to read active fields, admins can manage
ALTER TABLE ivoireio_dynamic_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active dynamic fields"
  ON ivoireio_dynamic_fields FOR SELECT
  USING (is_active = true);
