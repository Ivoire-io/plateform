# ⚙️ BRIEF TECHNIQUE — ivoire.io

> Ce document décrit l'architecture technique, le setup initial et les étapes de développement.

---

## STACK TECHNIQUE

| Composant | Choix | Raison |
|-----------|-------|--------|
| **Framework** | Next.js 14+ (App Router) | SSR/SSG, SEO, performance, edge functions |
| **Langage** | TypeScript | Typage, maintenabilité |
| **Styling** | Tailwind CSS | Rapide, cohérent avec la charte graphique |
| **Backend / BDD** | Supabase (PostgreSQL) | Auth, real-time, API REST auto, gratuit |
| **DNS / CDN** | Cloudflare | Wildcard DNS, SSL auto, Workers, protection DDoS |
| **Hébergement** | Vercel | Déploiement natif Next.js, edge functions |
| **Email** | Resend | Emails transactionnels (contact, bienvenue) |
| **Analytics** | Plausible ou PostHog | Respectueux vie privée, pas de cookies |
| **Icônes** | Lucide React | Open source, cohérent, léger |
| **Fonts** | Inter + JetBrains Mono | Google Fonts, gratuit |

---

## ARCHITECTURE GLOBALE

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Cloudflare  │     │    Vercel     │     │   Supabase   │
│              │     │              │     │              │
│  DNS Wildcard│────▶│  Next.js App │────▶│  PostgreSQL   │
│  *.ivoire.io │     │  Edge Funcs  │     │  Auth         │
│  SSL Auto    │     │  SSR/SSG     │     │  Realtime     │
│  CDN Cache   │     │              │     │  Storage      │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Flux d'une requête :

```
1. Utilisateur tape "ulrich.ivoire.io"
2. Cloudflare DNS résout *.ivoire.io → Vercel
3. Vercel reçoit la requête, middleware lit le header Host
4. Middleware extrait "ulrich" du subdomain
5. Next.js query Supabase : SELECT * FROM profiles WHERE slug = 'ulrich'
6. Si trouvé → rendu SSR de la page portfolio
7. Si non trouvé → page 404 "Ce profil n'existe pas encore"
```

---

## STRUCTURE DU PROJET

```
ivoire-io/
├── src/
│   ├── app/
│   │   ├── (main)/              ← Pages du domaine principal (ivoire.io)
│   │   │   ├── page.tsx         ← Landing page
│   │   │   └── layout.tsx
│   │   ├── (devs)/              ← Pages devs.ivoire.io
│   │   │   ├── page.tsx         ← Annuaire
│   │   │   └── layout.tsx
│   │   ├── (portfolio)/         ← Pages nom.ivoire.io
│   │   │   ├── page.tsx         ← Portfolio dynamique
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── waitlist/route.ts
│   │   │   ├── contact/route.ts
│   │   │   └── profiles/route.ts
│   │   ├── layout.tsx           ← Layout racine
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                  ← Composants réutilisables (Button, Card, Input...)
│   │   ├── landing/             ← Sections de la landing page
│   │   ├── portfolio/           ← Composants du portfolio
│   │   └── devs/                ← Composants de l'annuaire
│   ├── lib/
│   │   ├── supabase.ts          ← Client Supabase
│   │   ├── utils.ts             ← Utilitaires
│   │   └── types.ts             ← Types TypeScript
│   └── middleware.ts            ← Routing par subdomain
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── assets/
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── .env.local
```

---

## MIDDLEWARE SUBDOMAIN ROUTING

Le fichier `middleware.ts` est le cœur du système. Il détecte quel sous-domaine est appelé et redirige vers la bonne page.

```
Logique :
- ivoire.io              → /app/(main)/page.tsx    (landing page)
- devs.ivoire.io         → /app/(devs)/page.tsx    (annuaire)
- startups.ivoire.io     → /app/(startups)/page.tsx (future)
- [slug].ivoire.io       → /app/(portfolio)/page.tsx (portfolio du dev)
```

Sous-domaines réservés (ne peuvent pas être pris par un utilisateur) :
- www, mail, api, admin, app, devs, startups, jobs, learn, health, data, events, invest, blog, docs, status

---

## BASE DE DONNÉES (Supabase)

### Tables

#### `profiles`
```sql
CREATE TABLE profiles (
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
  type VARCHAR(20) DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
```

#### `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
```

#### `experiences`
```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `waitlist`
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  desired_slug VARCHAR(50),
  type VARCHAR(20) DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `contact_messages`
```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(100) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- Profils : lecture publique, écriture par le propriétaire
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profils visibles par tous"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Profil modifiable par son propriétaire"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Waitlist : insertion publique, lecture admin seulement
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inscription waitlist publique"
  ON waitlist FOR INSERT WITH CHECK (true);
```

---

## VARIABLES D'ENVIRONNEMENT

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

RESEND_API_KEY=re_xxxxx

NEXT_PUBLIC_SITE_URL=https://ivoire.io
NEXT_PUBLIC_APP_NAME=ivoire.io
```

---

## SETUP INITIAL (Commandes)

```bash
# 1. Créer le projet Next.js
npx create-next-app@latest ivoire-io --typescript --tailwind --app --src-dir

# 2. Installer les dépendances
cd ivoire-io
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react
npm install resend

# 3. Config Tailwind avec les couleurs de la charte
# (modifier tailwind.config.ts)

# 4. Déployer sur Vercel
npx vercel

# 5. Configurer le DNS Cloudflare
# A record : ivoire.io → IP Vercel
# CNAME : *.ivoire.io → cname.vercel-dns.com
```

---

## CONFIGURATION CLOUDFLARE

### DNS Records à créer

| Type | Nom | Valeur | Proxy |
|------|-----|--------|-------|
| A | ivoire.io | 76.76.21.21 (Vercel) | ✅ Proxied |
| CNAME | * | cname.vercel-dns.com | ✅ Proxied |
| CNAME | www | cname.vercel-dns.com | ✅ Proxied |

### SSL
- Mode : **Full (strict)**
- Always Use HTTPS : ✅
- Min TLS : 1.2

### Vercel
- Ajouter le domaine `ivoire.io` dans les settings du projet
- Ajouter le wildcard `*.ivoire.io`
- Vercel gérera les certificats SSL automatiquement via Cloudflare

---

## PRIORITÉ DE DÉVELOPPEMENT

| # | Fonctionnalité | Phase | Effort |
|---|---------------|-------|--------|
| 1 | Landing page + formulaire waitlist | Phase 1 | 2-3 jours |
| 2 | Middleware subdomain routing | Phase 1 | 1 jour |
| 3 | Auth Supabase (inscription/connexion) | Phase 2 | 1-2 jours |
| 4 | Dashboard dev (éditer son profil) | Phase 2 | 3-4 jours |
| 5 | Page portfolio publique (nom.ivoire.io) | Phase 2 | 2-3 jours |
| 6 | Import GitHub (repos/projets) | Phase 2 | 2 jours |
| 7 | Annuaire devs.ivoire.io | Phase 2 | 2-3 jours |
| 8 | Formulaire de contact (sur portfolio) | Phase 2 | 1 jour |
| 9 | Module startups (soumission + votes) | Phase 3 | 5-7 jours |
| 10 | SEO + OG images dynamiques | Continu | 1-2 jours |
