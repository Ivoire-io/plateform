# ⚙️ BRIEF TECHNIQUE — ivoire.io

> Ce document décrit l'architecture technique, le setup initial et les étapes de développement.
> **Mis à jour le 14 mars 2026 — MVP code complet, en attente de déploiement.**

---

## STACK TECHNIQUE

| Composant | Choix | Raison |
|-----------|-------|--------|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) | SSR/SSG, SEO, performance, edge functions |
| **Langage** | TypeScript strict | Typage, maintenabilité |
| **Styling** | Tailwind CSS v4 (`@theme inline`) | Rapide, cohérent avec la charte graphique |
| **Backend / BDD** | Supabase (PostgreSQL) | Auth, real-time, API REST auto, gratuit |
| **DNS / CDN** | Cloudflare | Wildcard DNS, SSL auto, Workers, protection DDoS |
| **Hébergement** | Vercel | Déploiement natif Next.js, edge functions |
| **Email** | Resend | Emails transactionnels (contact, bienvenue) |
| **Analytics** | Plausible (`next-plausible`) | Respectueux vie privée, pas de cookies |
| **Icônes** | Lucide React | Open source, cohérent, léger |
| **Fonts** | Inter + JetBrains Mono | Google Fonts, gratuit |
| **Routing subdomain** | `src/proxy.ts` (Next.js 16) | Remplace `middleware.ts` |

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

## STRUCTURE DU PROJET (réelle)

```
app/
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← Landing page
│   │   ├── layout.tsx                ← Layout racine (SEO, fonts, PlausibleProvider)
│   │   ├── globals.css               ← Tailwind v4 @theme inline
│   │   ├── not-found.tsx             ← 404 personnalisé
│   │   ├── devs/page.tsx             ← Annuaire devs (Server Component)
│   │   ├── portfolio/[slug]/page.tsx ← Portfolio dynamique SSR + JSON-LD
│   │   └── api/
│   │       ├── waitlist/route.ts     ← POST + GET, Resend email bienvenue
│   │       ├── contact/route.ts      ← POST, Resend notification
│   │       ├── profiles/route.ts     ← GET avec filtres
│   │       └── check-slug/route.ts   ← GET disponibilité temps réel
│   ├── components/
│   │   ├── ui/button.tsx, input.tsx
│   │   ├── landing/
│   │   │   ├── navbar.tsx            ← Logo image, sticky scroll
│   │   │   ├── hero.tsx              ← Check dispo temps réel + debounce
│   │   │   ├── features.tsx
│   │   │   ├── preview.tsx           ← Screenshot réelle portfolio
│   │   │   ├── roadmap.tsx           ← Timeline horizontale desktop
│   │   │   ├── waitlist.tsx          ← Formulaire validation complète
│   │   │   └── footer.tsx
│   │   ├── portfolio/portfolio-page.tsx
│   │   └── devs/devs-directory.tsx
│   ├── lib/
│   │   ├── supabase/client.ts, server.ts, admin.ts
│   │   ├── utils.ts                  ← TABLES (préfixe ivoireio_), cn(), isValidSlug()
│   │   └── types.ts
│   └── proxy.ts                      ← Routing subdomain (Next.js 16)
├── public/
│   ├── favicon.png / favicon.webp
│   ├── og-image.png                  ← OG image 1200×630
│   ├── logo-ivoire.io-blanc.webp
│   ├── example-porfolio-ivoire.io.webp
│   └── site.webmanifest
├── supabase/migrations/
│   └── 001_initial_schema.sql        ← 5 tables + RLS + storage buckets
└── .env.local
```
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

Le fichier `src/proxy.ts` (Next.js 16 — renommé depuis `middleware.ts`) est le cœur du système.

```
Logique :
- ivoire.io              → / (landing page)
- devs.ivoire.io         → /devs (annuaire)
- [slug].ivoire.io       → /portfolio/[slug] (portfolio du dev)
- Sous-domaines réservés → /[reservé]/
```

Sous-domaines réservés (inaccessibles aux utilisateurs) :
`www, mail, api, admin, app, devs, startups, jobs, learn, health, data, events, invest, blog, docs, status`

---

## VARIABLES D'ENVIRONNEMENT (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xgcmyktcgwqdeqfudkzl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=re_...         ← À remplir sur resend.com
NEXT_PUBLIC_SITE_URL=https://ivoire.io
NEXT_PUBLIC_APP_NAME=ivoire.io
```

---

## BASE DE DONNÉES (Supabase)

> Projet Supabase : `xgcmyktcgwqdeqfudkzl`
> Migration : `supabase/migrations/001_initial_schema.sql` — **À exécuter via SQL Editor**

### Tables (préfixe `ivoireio_`)

#### `ivoireio_profiles`
```sql
CREATE TABLE ivoireio_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  title VARCHAR(100), city VARCHAR(50), bio TEXT,
  avatar_url TEXT, github_url TEXT, linkedin_url TEXT,
  twitter_url TEXT, website_url TEXT,
  skills TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  type VARCHAR(20) DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ivoireio_projects`, `ivoireio_experiences` — voir migration SQL

#### `ivoireio_waitlist`
```sql
CREATE TABLE ivoireio_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100), desired_slug VARCHAR(50),
  whatsapp VARCHAR(30),
  type VARCHAR(20) DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ivoireio_contact_messages` — voir migration SQL

### Storage Buckets
- `ivoireio-avatars` (public)
- `ivoireio-projects` (public)

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
