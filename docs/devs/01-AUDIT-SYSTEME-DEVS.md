# Audit complet du systeme developpeur — ivoire.io

> Analyse exhaustive de tout le parcours developpeur dans l'ecosysteme ivoire.io
> Date : Mars 2026

---

## Table des matieres

1. [Vue d'ensemble](#1-vue-densemble)
2. [Parcours d'inscription](#2-parcours-dinscription)
3. [Authentification](#3-authentification)
4. [Dashboard developpeur](#4-dashboard-developpeur)
5. [Portfolio public](#5-portfolio-public-slugivoireio)
6. [Annuaire devs.ivoire.io](#6-annuaire-devsivoireio)
7. [Systeme de souscription](#7-systeme-de-souscription)
8. [Configuration admin](#8-configuration-admin-pour-les-devs)
9. [Relations inter-utilisateurs](#9-relations-avec-les-autres-types-dutilisateurs)
10. [Schema des flux](#10-schemas-des-flux)

---

## 1. Vue d'ensemble

### Qu'est-ce qu'un "dev" dans ivoire.io ?

Un developpeur est un utilisateur dont le `profile.type = "developer"`. C'est le type d'utilisateur **principal** et historiquement le premier implemente sur la plateforme.

### Points d'entree du developpeur

| Surface | URL | Description |
|---------|-----|-------------|
| Landing page | `ivoire.io` | Page d'accueil avec hero, features, waitlist |
| Annuaire | `devs.ivoire.io` | Listing de tous les developpeurs visibles |
| Portfolio | `{slug}.ivoire.io` | Page publique individuelle du dev |
| Dashboard | `ivoire.io/dashboard` | Espace personnel de gestion |
| Login | `ivoire.io/login` | Connexion par magic link |

### Stack technique

- **Frontend** : Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : API Routes Next.js, Supabase (PostgreSQL + Auth + Storage)
- **Auth** : Supabase OTP (magic link par email, PKCE)
- **Paiement** : PayPal REST API, Mobile Money (manuel), Credits
- **IA** : OpenAI, Anthropic, CrunAI
- **Analytics** : Plausible (auto-heberge)

---

## 2. Parcours d'inscription

### Flux actuel : Modele waitlist

Il n'existe **pas de page d'inscription classique**. Le parcours est :

```
Landing (ivoire.io)
  |
  v
Formulaire waitlist (#rejoindre)
  - Nom complet
  - Email
  - Slug souhaite (ex: ulrich.ivoire.io)
  - Numero WhatsApp (format CI : +225)
  - Type : Developpeur / Startup / Entreprise / Autre
  - Code parrainage (optionnel, capture depuis ?ref=xxx)
  |
  v
Email de confirmation waitlist (via Resend)
  |
  v
Admin invite manuellement (panel admin)
  - Cree le profil Supabase
  - Genere un magic link
  - Envoie l'email d'invitation
  |
  v
Dev clique le magic link
  |
  v
Auth callback -> redirect /dashboard
  |
  v
Dashboard avec checklist de completion de profil
```

### Fichiers impliques

| Fichier | Role |
|---------|------|
| `app/src/components/landing/waitlist.tsx` | Formulaire d'inscription waitlist |
| `app/src/app/api/waitlist/route.ts` | API POST waitlist + GET count |
| `app/src/app/api/check-slug/route.ts` | Verification disponibilite du slug |
| `app/src/app/api/admin/waitlist/[id]/invite/route.ts` | Invitation par admin |
| `app/src/components/landing/hero.tsx` | Hero avec checker de slug |

### Validation du slug

- 1-30 caracteres, alphanumerique + tirets
- Doit commencer/finir par alphanumerique
- Verifie contre les **sous-domaines reserves** : www, mail, api, admin, app, devs, startups, jobs, learn, health, data, events, invest, blog, docs, status, dashboard, login, auth, logout
- Verifie l'unicite dans waitlist + profiles

### Ce qui manque / Points faibles

- **Pas d'inscription directe** : le dev depend d'une action admin pour acceder a la plateforme
- **Pas d'onboarding guide** : apres la premiere connexion, le dev atterrit sur le dashboard sans tutoriel
- **Pas de verification email automatique** sur la waitlist
- **Le mode "open"** existe dans la config admin (`registration_mode: "open"`) mais n'est pas encore implemente cote frontend

---

## 3. Authentification

### Methode : Magic Link (Supabase OTP)

```
/login -> User entre son email
       -> supabase.auth.signInWithOtp({ email, emailRedirectTo: /auth/callback })
       -> Email avec magic link envoye
       -> Clic sur le lien -> /auth/callback
       -> Echange code PKCE -> session creee
       -> Redirect vers /dashboard
```

### Protection des routes

| Route | Protection | Methode |
|-------|-----------|---------|
| `/dashboard` | Auth required | `supabase.auth.getUser()` dans la page server component |
| `/admin/*` | Auth + is_admin | Layout verifie auth puis `is_admin` sur le profil |
| `/api/dashboard/*` | Auth required | Chaque route verifie `supabase.auth.getUser()` |
| `/api/admin/*` | Auth + is_admin | `admin-guard.ts` verifie auth + `is_admin` |
| `/devs`, `/portfolio/*` | Public | Aucune auth |

### Fichiers impliques

| Fichier | Role |
|---------|------|
| `app/src/app/login/page.tsx` | Page de connexion |
| `app/src/app/auth/callback/route.ts` | Callback PKCE |
| `app/src/proxy.ts` | Middleware de routage par sous-domaine |
| `app/src/lib/admin-guard.ts` | Guard admin pour les APIs |
| `app/src/lib/supabase/server.ts` | Client Supabase serveur (RLS) |
| `app/src/lib/supabase/admin.ts` | Client Supabase admin (service role) |

---

## 4. Dashboard developpeur

### Onglets disponibles pour le type "developer"

Le dashboard est contextuel : les onglets affiches dependent du `profile.type`.

#### Sidebar developpeur :

```
GENERAL
  - Vue d'ensemble (overview)
  - Mon Profil (profile)
  - Template (template)

CONTENU
  - Projets (projects)
  - Experiences (experiences)

INTERACTIONS
  - Messages (messages)
  - Statistiques (stats)

EMPLOI
  - Offres d'emploi (jobs)

COMPTE
  - Abonnement (subscription)
  - Parrainage (referral)
  - Parametres (settings)
```

### Detail de chaque onglet

#### 4.1 Vue d'ensemble (`overview-tab.tsx`)

- Message de bienvenue personnalise
- **6 KPI cards** : Visites du mois, Clics sur liens, Messages non lus, Projets publies, Experiences, Favoris recus
- **Checklist de completion du profil** avec barre de progression :
  - Photo de profil
  - Bio (>20 caracteres)
  - Titre & ville
  - Competences (min 3)
  - Liens sociaux (min 1)
  - Projets (min 1)
- Graphique de visites sur 30 jours (pour startups : score de projet)
- Activite recente
- Actions rapides : Modifier profil, Ajouter un projet, Partager portfolio, Copier le lien

#### 4.2 Mon Profil (`profile-tab.tsx`)

Formulaire complet d'edition :
- **Avatar** : upload avec preview, 2MB max, JPG/PNG/WebP
- **Toggle disponibilite** : Disponible / Non disponible
- **Infos** : Nom complet, Titre/role, Ville, Bio (300 chars max)
- **Liens sociaux** : GitHub, LinkedIn, Twitter, Site web (validation HTTPS)
- **Competences** : tags ajoutables/supprimables, max 30 skills, 50 chars chacun
- Sauvegarde avec dirty tracking (seuls les champs modifies sont envoyes)

**API** : `PATCH /api/dashboard/profile`

#### 4.3 Template (`template-tab.tsx`)

Selection du template de portfolio parmi 10 options :
- classic, minimal, bento, terminal, magazine, timeline, card-stack, split, startup, corporate
- Preview visuelle, certains templates reserves aux plans premium

**API** : `PUT /api/dashboard/template`

#### 4.4 Projets (`projects-tab.tsx`)

CRUD complet pour les projets du portfolio :
- Nom, description, image (upload), tech stack, GitHub URL, demo URL
- Drag & drop pour reordonner
- Compteur de stars

**API** : `/api/dashboard/projects` (GET, POST, PUT, DELETE)

#### 4.5 Experiences (`experiences-tab.tsx`)

CRUD pour les experiences professionnelles :
- Role, entreprise, date debut, date fin (null = present), description

**API** : `/api/dashboard/experiences` (GET, POST, PUT, DELETE)

#### 4.6 Messages (`messages-tab.tsx`)

Boite de reception des messages recus via le formulaire de contact du portfolio :
- Nom expediteur, email, message, date
- Marquage lu/non lu

**API** : `/api/dashboard/messages`

#### 4.7 Statistiques (`stats-tab.tsx`)

Statistiques de visite du portfolio :
- Vues totales et uniques
- Clics sur les liens
- Repartition par source (direct, devs, referral)

**API** : `/api/dashboard/stats`

#### 4.8 Offres d'emploi (`jobs-tab.tsx`)

Consultation des offres publiees sur la plateforme.
> Note : Le systeme de candidature (wireframe prevu) n'est pas encore implemente.

#### 4.9 Abonnement (`subscription-tab.tsx`)

- Affichage des plans disponibles (charges dynamiquement depuis la DB)
- Selection et paiement :
  - Mobile Money (Wave, Orange Money, Moov) : upload de preuve
  - PayPal : redirection + capture
  - Credits : deduction directe
- Historique des paiements
- Section Packs (achats uniques)

#### 4.10 Parrainage (`referral-tab.tsx`)

- Code parrainage unique + URL partageable
- Stats : total referrals, convertis, credits gagnes
- Partage WhatsApp en un clic
- Explication des recompenses

#### 4.11 Parametres (`settings-tab.tsx`)

- **Notifications** : Messages, Rapport hebdomadaire, Actualites
- **Confidentialite** : Visible dans l'annuaire, Afficher l'email
- **Compte** : Suppression de compte

**API** : `/api/dashboard/settings`

---

## 5. Portfolio public (`{slug}.ivoire.io`)

### Acces

Le middleware `proxy.ts` redirige tout sous-domaine non reserve vers `/portfolio/{slug}`.

### Structure de la page

1. **Navbar** : `{slug}.ivoire.io` + badge "Powered by ivoire.io"
2. **Hero/Profil** : Avatar, nom, titre, ville, bio, liens sociaux, CTAs (Me contacter, M'embaucher)
3. **Competences** : Tags des technologies
4. **Projets** : Grille de cards avec screenshot, nom, description, tech stack, liens
5. **Experiences** : Timeline verticale (masquee si vide)
6. **Formulaire de contact** : Nom, email, message -> stocke dans Supabase
7. **Footer** : "Propulse par ivoire.io" + CTA virale "Cree le tien gratuitement"

### Templates disponibles

10 templates avec des layouts differents :
`classic`, `minimal`, `bento`, `terminal`, `magazine`, `timeline`, `card-stack`, `split`, `startup`, `corporate`

### Tracking

- **Vues** : Chaque visite est trackee via `/api/portfolio/track` (profil id, referrer, user agent, headers)
- **Clics** : Chaque clic sur un lien est tracke via `/api/portfolio/track-click` (type de lien, URL)
- Tables : `ivoireio_portfolio_views`, `ivoireio_link_clicks`

### SEO

- Title : `{nom} — {titre} | ivoire.io`
- Meta description : `{bio} — Portfolio de {nom} sur ivoire.io`
- OG Image : dynamique (a implementer)
- JSON-LD : schema Person
- URL canonique : `https://{slug}.ivoire.io`

### Fichiers impliques

| Fichier | Role |
|---------|------|
| `app/src/app/portfolio/[slug]/page.tsx` | Page server component |
| `app/src/components/portfolio/portfolio-page.tsx` | Composant principal |
| `app/src/components/portfolio/portfolio-renderer.tsx` | Rendu conditionnel par template |
| `app/src/components/portfolio/templates.tsx` | Definitions des 10 templates |
| `app/src/components/portfolio/portfolio-tracker.tsx` | Tracking cote client |

---

## 6. Annuaire devs.ivoire.io

### Acces

Le middleware `proxy.ts` redirige le sous-domaine `devs` vers `/devs`.

### Fonctionnalites implementees

1. **Header** : Logo ivoire.io + indicateur "devs.ivoire.io"
2. **Hero** : "Annuaire des developpeurs" + compteur de talents
3. **Recherche** : Barre de recherche full-text (nom, titre, competence)
4. **Filtres** :
   - Par technologie (dropdown dynamique depuis les profils)
   - Par ville (dropdown dynamique)
   - Toggle "Disponibles uniquement"
5. **Grille** : Cards des developpeurs (3 colonnes desktop, 2 tablette, 1 mobile)
   - Avatar, nom, titre, ville, skills (5 max), indicateur dispo, lien sous-domaine
6. **Lien vers portfolio** : Chaque card redirige vers `{slug}.ivoire.io`

### Donnees chargees

```sql
SELECT * FROM ivoireio_profiles
WHERE type = 'developer'
AND privacy_visible_in_directory = true
ORDER BY created_at DESC
```

### Ce qui manque par rapport au wireframe

- **Pas de pagination** : Tous les profils sont charges en une fois
- **Pas de tri** : Le wireframe prevoyait Recent/Populaire/Alphabetique
- **Pas de banniere CTA** en bas pour inciter a l'inscription
- **Pas de badge verifie** sur les cards
- **Pas de tags actifs** affichables/supprimables sous les filtres

### Fichiers impliques

| Fichier | Role |
|---------|------|
| `app/src/app/devs/page.tsx` | Page server component |
| `app/src/components/devs/devs-directory.tsx` | Composant de l'annuaire |

---

## 7. Systeme de souscription

### Plans actuels (depuis la DB, migration 012)

| Tier | Nom | Prix | Frequence | Cible | Highlighted |
|------|-----|------|-----------|-------|-------------|
| `free` | Gratuit | 0 | - | Tout le monde | Non |
| `builder` | Builder | 3 000 FCFA | /mois | Devs actifs | Non |
| `startup` | Startup | 10 000 FCFA | /mois | Startups | Oui |
| `pro` | Pro | 60 000 FCFA | /an | Usage serieux | Non |
| `growth` | Growth | 0 (custom) | Sur mesure | Grandes structures | Non |

> Note : Il y a une **incoherence** entre les plans en DB (migration 012 : free/builder/startup/pro/growth) et les plans du profil (migration 001/011 : free/starter/pro/enterprise/student). Les deux systemes coexistent.

### Methodes de paiement

| Methode | Status | Flux |
|---------|--------|------|
| **Manuel / Virement** | Actif | User transfere + upload preuve -> Admin approuve |
| **PayPal** | Actif | Redirect PayPal -> Capture -> Activation (EUR, conversion FCFA) |
| **Wave** | Configure | Numero affiche, preuve manuelle (pas d'API automatique) |
| **Orange Money** | Configure | Numero affiche, preuve manuelle (pas d'API automatique) |
| **Moov** | Configure | Numero affiche, preuve manuelle (pas d'API automatique) |
| **Credits** | Actif | Deduction directe du solde credits |

### Feature gating (Plan Guard)

Le fichier `plan-guard.ts` controle l'acces aux features selon le plan :

| Feature | Free | Builder | Startup | Pro | Growth |
|---------|------|---------|---------|-----|--------|
| Projets max | 5 | Defini par plan | Defini par plan | Illimite | Illimite |
| Templates | Basiques | +premium | +premium | Tous | Tous+corporate |
| Pitch Deck | - | ? | ? | Oui | Oui |
| Cahier des charges | - | - | ? | Oui | Oui |
| Export PDF | - | - | ? | Oui | Oui |
| Stats avancees | - | - | ? | Oui | Oui |
| Badge verifie | - | - | - | Oui | Oui |
| Dev outsourcing | - | - | - | Oui | Oui |
| Gen. IA/jour | 5 | Defini | Defini | 50 | Illimite |

### Packs (achats uniques)

| Pack | Prix | Contenu |
|------|------|---------|
| Pack Lancement | 10 000 FCFA | A definir par admin |
| Pack Investisseur | 15 000 FCFA | A definir par admin |

### Systeme de credits

- Gains : parrainage, achat, promo admin, remboursement
- Utilisation : payer un abonnement, acheter un pack
- Balance = somme de toutes les transactions (positives et negatives)

### Systeme de parrainage

1. Chaque user a un `referral_code` unique (8 caracteres)
2. URL : `ivoire.io?ref=CODE`
3. Le code est capture dans localStorage lors de la visite
4. Applique automatiquement au premier login apres inscription
5. Recompenses :
   - Filleul souscrit Starter : parrain +1 000 FCFA, filleul +500 FCFA
   - Filleul souscrit Pro : parrain +5 000 FCFA, filleul +5 000 FCFA

---

## 8. Configuration admin pour les devs

### Actions admin sur un profil developpeur

| Action | API | Effet |
|--------|-----|-------|
| Voir le profil | GET `/api/admin/profiles/[id]` | Consulter toutes les infos |
| Modifier le profil | PUT `/api/admin/profiles/[id]` | Changer nom, bio, type, plan, notes |
| Suspendre | POST `/api/admin/profiles/[id]/suspend` | `is_suspended = true` |
| Reactiver | POST `/api/admin/profiles/[id]/activate` | `is_suspended = false` |
| Accorder badge | POST `/api/admin/profiles/[id]/badge` | `verified_badge = true` |
| Revoquer badge | DELETE `/api/admin/profiles/[id]/badge` | `verified_badge = false` |
| Promouvoir admin | POST `/api/admin/profiles/[id]/promote` | `is_admin = true` |
| Supprimer compte | DELETE `/api/admin/profiles/[id]` | Suppression definitive |
| Inviter (waitlist) | POST `/api/admin/waitlist/[id]/invite` | Cree profil + envoie magic link |

### Feature flags pertinents pour les devs

Geres dans `/admin/flags` :

| Flag | Description |
|------|-------------|
| `portal_devs` | Active/desactive le portail devs.ivoire.io |
| `portal_jobs` | Active/desactive le portail emploi |
| `feature_messaging` | Active/desactive la messagerie |
| `feature_mobile_money` | Active/desactive le paiement mobile money |

### Configuration plateforme (`/admin/config`)

| Cle | Impact sur les devs |
|-----|---------------------|
| `registration_mode` | `waitlist` (actuel) ou `open` (inscription directe) |
| `maintenance_mode` | Met toute la plateforme en maintenance |
| `pricing` | Grille tarifaire par plan |
| `payment_providers` | Active/configure les methodes de paiement |
| `plan_limits` | Limites par plan (projets, IA, templates, etc.) |
| `referral_config` | Montants des recompenses parrainage |
| `free_slots_total/remaining` | Nombre de places gratuites restantes |

### Gestion des templates

L'admin peut creer/modifier/desactiver des templates de portfolio via `/admin/templates`.
Chaque template a : `slug`, `name`, `description`, `category`, `is_premium`, `is_active`.

---

## 9. Relations avec les autres types d'utilisateurs

### Types d'utilisateurs dans l'ecosysteme

```
                    ┌─────────────┐
                    │   ADMIN     │
                    │ (is_admin)  │
                    └──────┬──────┘
                           │ gere tout
                           v
    ┌──────────┐    ┌──────────────┐    ┌──────────────┐
    │   DEV    │    │   STARTUP    │    │  ENTERPRISE  │
    │developer │    │   startup    │    │  enterprise  │
    └────┬─────┘    └──────┬───────┘    └──────┬───────┘
         │                 │                    │
         │ portfolio       │ profil startup     │ profil entreprise
         │ annuaire        │ project builder    │ (futur)
         │ emploi          │ dev outsourcing    │
         │                 │ fundraising        │
         └────────┬────────┘                    │
                  │                             │
                  v                             │
         ┌────────────────┐                     │
         │  DEV OUTSOURCING│ <------------------┘
         │  (marketplace)  │
         └────────────────┘
```

### Interactions Dev <-> Startup

1. **Annuaire** : Les startups consultent `devs.ivoire.io` pour trouver des talents
2. **Contact direct** : Via le formulaire de contact du portfolio du dev
3. **Dev Outsourcing** : La startup soumet une demande de dev -> ivoire.io compose l'equipe (incluant potentiellement des devs de la plateforme)
4. **Jobs** : Les startups publient des offres d'emploi, les devs consultent

### Interactions Dev <-> Entreprise

Pas encore implemente. Prevu dans la roadmap Phase 7 :
- Recherche avancee dans l'annuaire
- Dashboard recrutement
- Bulk messaging

### Interactions Dev <-> Investisseur

Pas implemente. Futur.

### Points de friction actuels

- **Pas de matching automatique** entre devs et demandes de startups
- **Pas de systeme de candidature** aux offres d'emploi
- **Le dev ne peut pas "postuler"** a un projet dev outsourcing
- **Pas de notation/review** entre dev et client
- **Pas de messagerie interne** entre utilisateurs

---

## 10. Schemas des flux

### Flux complet du developpeur

```
                    DECOUVERTE
                    |
    [Landing page] -+-> [Hero: checker slug]
    [Reseaux sociaux]   [Features section]
    [Bouche a oreille]  [Roadmap section]
    [devs.ivoire.io]    |
                        v
                    INSCRIPTION
                    |
    [Formulaire waitlist] --> [Email confirmation]
                        |
                        v
                    ATTENTE (waitlist)
                        |
                        v (admin invite)
                    ACTIVATION
                    |
    [Magic link email] --> [Auth callback]
                        |
                        v
                    ONBOARDING (pseudo)
                    |
    [Dashboard overview] --> [Checklist completion]
    [Remplir profil]         [Ajouter projets]
    [Ajouter experiences]    [Choisir template]
                        |
                        v
                    UTILISATION QUOTIDIENNE
                    |
    [Consulter stats]  [Lire messages]
    [Modifier profil]  [Gerer projets]
    [Partager portfolio] [Consulter jobs]
                        |
                        v
                    MONETISATION (optionnel)
                    |
    [Upgrader plan]    [Parrainer]
    [Acheter pack]     [Gagner credits]
                        |
                        v
                    VISIBILITE
                    |
    [Portfolio slug.ivoire.io]
    [Annuaire devs.ivoire.io]
    [Referencement Google]
    [Partage reseaux sociaux]
```

### Flux de donnees

```
DB (ivoireio_profiles)
    |
    +--> Dashboard (/dashboard)      [lecture/ecriture]
    |      |
    |      +--> Profile tab          [PATCH /api/dashboard/profile]
    |      +--> Projects tab         [CRUD /api/dashboard/projects]
    |      +--> Experiences tab      [CRUD /api/dashboard/experiences]
    |      +--> Template tab         [PUT /api/dashboard/template]
    |      +--> Settings tab         [PUT /api/dashboard/settings]
    |      +--> Subscription tab     [POST /api/dashboard/subscription]
    |
    +--> Portfolio (/portfolio/[slug])  [lecture seule]
    |      |
    |      +--> Tracking views       [POST /api/portfolio/track]
    |      +--> Tracking clicks      [POST /api/portfolio/track-click]
    |      +--> Contact form         [POST /api/contact]
    |
    +--> Annuaire (/devs)            [lecture seule]
    |      |
    |      +--> Filtrage client-side
    |
    +--> Admin (/admin)              [lecture/ecriture]
           |
           +--> Users tab            [CRUD /api/admin/profiles]
           +--> Waitlist tab         [invite /api/admin/waitlist]
           +--> Plans tab            [CRUD /api/admin/plans]
           +--> Payments tab         [review /api/admin/payments]
```

---

## Base de donnees : tables liees aux devs

### Table principale : `ivoireio_profiles`

```sql
id UUID PRIMARY KEY
slug VARCHAR(50) UNIQUE NOT NULL       -- sous-domaine
email VARCHAR(255) UNIQUE NOT NULL
full_name VARCHAR(100) NOT NULL
title VARCHAR(100)                      -- ex: "Lead Developer"
city VARCHAR(50)                        -- ex: "Abidjan"
bio TEXT
avatar_url TEXT
github_url, linkedin_url, twitter_url, website_url TEXT
skills TEXT[] DEFAULT '{}'              -- ["Flutter", "React", "Go"]
is_available BOOLEAN DEFAULT true
type VARCHAR(20) DEFAULT 'developer'
is_admin BOOLEAN DEFAULT false
is_suspended BOOLEAN DEFAULT false
plan VARCHAR(20) DEFAULT 'free'
admin_notes TEXT
verified_badge BOOLEAN DEFAULT false
referral_code VARCHAR(20) UNIQUE
referred_by UUID
notif_messages, notif_weekly_report, notif_news BOOLEAN
privacy_visible_in_directory BOOLEAN
privacy_show_email BOOLEAN
template_id VARCHAR
created_at, updated_at TIMESTAMPTZ
```

### Tables de contenu

| Table | Colonnes principales |
|-------|---------------------|
| `ivoireio_projects` | profile_id, name, description, image_url, tech_stack[], github_url, demo_url, stars, sort_order |
| `ivoireio_experiences` | profile_id, role, company, start_date, end_date, description, sort_order |

### Tables d'analytics

| Table | Colonnes principales |
|-------|---------------------|
| `ivoireio_portfolio_views` | profile_id, referrer, user_agent, viewed_at |
| `ivoireio_link_clicks` | profile_id, link_type, url, clicked_at |

### Tables de messaging

| Table | Colonnes principales |
|-------|---------------------|
| `ivoireio_contact_messages` | profile_id, name, email, message, read, created_at |

### Tables de souscription

| Table | Colonnes principales |
|-------|---------------------|
| `ivoireio_subscriptions` | profile_id, plan, payment_method, status, amount, expires_at |
| `ivoireio_payments` | profile_id, subscription_id, amount, payment_method, status, proof_url |
| `ivoireio_credits` | profile_id, amount, source, description |
| `ivoireio_referrals` | referrer_id, referred_id, referral_code, status, reward_amount |
| `ivoireio_plans` | tier, name, price, billing_type, features, limits |
| `ivoireio_packs` | slug, name, price, includes[], unlocked_features[] |

---

*Document genere automatiquement a partir de l'analyse du code source — Mars 2026*
