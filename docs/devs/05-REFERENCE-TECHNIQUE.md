# Fichiers et architecture technique — Reference developpeur

> Index de tous les fichiers du codebase lies au systeme developpeur
> Date : Mars 2026

---

## 1. Pages (App Router)

| Route | Fichier | Acces | Description |
|-------|---------|-------|-------------|
| `/` | `app/src/app/page.tsx` | Public | Landing page avec waitlist |
| `/login` | `app/src/app/login/page.tsx` | Public | Connexion magic link |
| `/auth/callback` | `app/src/app/auth/callback/route.ts` | Public | Callback PKCE |
| `/dashboard` | `app/src/app/dashboard/page.tsx` | Auth | Dashboard utilisateur |
| `/devs` | `app/src/app/devs/page.tsx` | Public | Annuaire developpeurs |
| `/portfolio/[slug]` | `app/src/app/portfolio/[slug]/page.tsx` | Public | Portfolio individuel |
| `/admin/*` | `app/src/app/admin/` | Admin | Panel admin (20+ pages) |

---

## 2. Composants developpeur

### Landing

| Fichier | Role |
|---------|------|
| `app/src/components/landing/hero.tsx` | Hero + checker de slug |
| `app/src/components/landing/navbar.tsx` | Navigation landing |
| `app/src/components/landing/social-proof.tsx` | Compteurs animes |
| `app/src/components/landing/features.tsx` | Grille des features |
| `app/src/components/landing/preview.tsx` | Screenshot portfolio |
| `app/src/components/landing/roadmap.tsx` | Roadmap 5 phases |
| `app/src/components/landing/waitlist.tsx` | Formulaire inscription |
| `app/src/components/landing/footer.tsx` | Footer + liens sociaux |

### Annuaire

| Fichier | Role |
|---------|------|
| `app/src/components/devs/devs-directory.tsx` | Composant complet de l'annuaire |

### Portfolio

| Fichier | Role |
|---------|------|
| `app/src/components/portfolio/portfolio-page.tsx` | Page wrapper du portfolio |
| `app/src/components/portfolio/portfolio-renderer.tsx` | Routeur de template |
| `app/src/components/portfolio/templates.tsx` | 10 templates de portfolio |
| `app/src/components/portfolio/portfolio-tracker.tsx` | Tracking des visites |

### Dashboard (21 composants)

| Fichier | Role | Type dev |
|---------|------|----------|
| `dashboard-shell.tsx` | Layout principal + sidebar + routing | Tous |
| `overview-tab.tsx` | Vue d'ensemble + KPIs + checklist | Tous |
| `profile-tab.tsx` | Edition du profil | Dev |
| `template-tab.tsx` | Selection de template | Dev |
| `projects-tab.tsx` | CRUD projets portfolio | Dev |
| `experiences-tab.tsx` | CRUD experiences pro | Dev |
| `messages-tab.tsx` | Boite de reception | Tous |
| `stats-tab.tsx` | Statistiques de visite | Tous |
| `jobs-tab.tsx` | Offres d'emploi | Dev |
| `subscription-tab.tsx` | Gestion abonnement | Tous |
| `referral-tab.tsx` | Programme parrainage | Tous |
| `settings-tab.tsx` | Notifications + confidentialite | Tous |
| `manual-payment-form.tsx` | Formulaire paiement manuel | Tous |
| `paypal-checkout.tsx` | Integration PayPal | Tous |
| `upgrade-dialog.tsx` | Dialog de mise a niveau | Tous |

### Admin (tabs pertinents pour les devs)

| Fichier | Role |
|---------|------|
| `admin/tabs/users-tab.tsx` | CRUD profils dev |
| `admin/tabs/waitlist-tab.tsx` | Gestion waitlist + invitation |
| `admin/tabs/plans-tab.tsx` | CRUD plans d'abonnement |
| `admin/tabs/packs-tab.tsx` | CRUD packs one-shot |
| `admin/tabs/payments-tab.tsx` | Review des paiements |
| `admin/tabs/subscriptions-tab.tsx` | Gestion abonnements |
| `admin/tabs/templates-tab.tsx` | Gestion templates portfolio |
| `admin/tabs/config-tab.tsx` | Configuration plateforme |
| `admin/tabs/feature-flags-tab.tsx` | Feature flags |
| `admin/tabs/referrals-tab.tsx` | Stats parrainage |
| `admin/tabs/payment-providers-tab.tsx` | Config moyens de paiement |

---

## 3. API Routes

### Dashboard (authentifie)

| Route | Methodes | Fichier |
|-------|----------|---------|
| `/api/dashboard/profile` | PATCH | `app/src/app/api/dashboard/profile/route.ts` |
| `/api/dashboard/avatar` | POST | `app/src/app/api/dashboard/avatar/route.ts` |
| `/api/dashboard/account` | DELETE | `app/src/app/api/dashboard/account/route.ts` |
| `/api/dashboard/projects` | GET, POST | `app/src/app/api/dashboard/projects/route.ts` |
| `/api/dashboard/projects/[id]` | PUT, DELETE | `app/src/app/api/dashboard/projects/[id]/route.ts` |
| `/api/dashboard/experiences` | GET, POST | `app/src/app/api/dashboard/experiences/route.ts` |
| `/api/dashboard/experiences/[id]` | PUT, DELETE | `app/src/app/api/dashboard/experiences/[id]/route.ts` |
| `/api/dashboard/messages` | GET | `app/src/app/api/dashboard/messages/route.ts` |
| `/api/dashboard/stats` | GET | `app/src/app/api/dashboard/stats/route.ts` |
| `/api/dashboard/settings` | GET, PUT | `app/src/app/api/dashboard/settings/route.ts` |
| `/api/dashboard/template` | PUT | `app/src/app/api/dashboard/template/route.ts` |
| `/api/dashboard/subscription` | GET, POST | `app/src/app/api/dashboard/subscription/route.ts` |
| `/api/dashboard/subscription/cancel` | POST | `app/src/app/api/dashboard/subscription/cancel/route.ts` |
| `/api/dashboard/payments` | POST | `app/src/app/api/dashboard/payments/route.ts` |
| `/api/dashboard/payments/upload-proof` | POST | `app/src/app/api/dashboard/payments/upload-proof/route.ts` |
| `/api/dashboard/payments/paypal/create-order` | POST | `...paypal/create-order/route.ts` |
| `/api/dashboard/payments/paypal/capture-order` | POST | `...paypal/capture-order/route.ts` |
| `/api/dashboard/referral` | GET, POST | `app/src/app/api/dashboard/referral/route.ts` |
| `/api/dashboard/credits` | GET | `app/src/app/api/dashboard/credits/route.ts` |
| `/api/dashboard/packs` | GET, POST | `app/src/app/api/dashboard/packs/route.ts` |

### Public

| Route | Methodes | Fichier |
|-------|----------|---------|
| `/api/waitlist` | GET, POST | `app/src/app/api/waitlist/route.ts` |
| `/api/check-slug` | GET | `app/src/app/api/check-slug/route.ts` |
| `/api/profiles` | GET | `app/src/app/api/profiles/route.ts` |
| `/api/contact` | POST | `app/src/app/api/contact/route.ts` |
| `/api/portfolio/track` | POST | `app/src/app/api/portfolio/track/route.ts` |
| `/api/portfolio/track-click` | POST | `app/src/app/api/portfolio/track-click/route.ts` |
| `/api/plans` | GET | `app/src/app/api/plans/route.ts` |
| `/api/packs` | GET | `app/src/app/api/packs/route.ts` |
| `/api/stats` | GET | `app/src/app/api/stats/route.ts` |

### Admin

| Route | Methodes | Description |
|-------|----------|-------------|
| `/api/admin/profiles` | GET | Liste avec search/filter/pagination |
| `/api/admin/profiles/[id]` | GET, PUT, DELETE | CRUD profil individuel |
| `/api/admin/profiles/[id]/suspend` | POST | Suspendre |
| `/api/admin/profiles/[id]/activate` | POST | Reactiver |
| `/api/admin/profiles/[id]/badge` | POST, DELETE | Badge verifie |
| `/api/admin/profiles/[id]/promote` | POST | Promouvoir admin |
| `/api/admin/waitlist` | GET | Liste waitlist |
| `/api/admin/waitlist/[id]/invite` | POST | Inviter |
| `/api/admin/plans` | GET, POST | CRUD plans |
| `/api/admin/plans/[id]` | GET, PUT, DELETE | Plan individuel |
| `/api/admin/plans/[id]/toggle` | POST | Activer/desactiver plan |
| `/api/admin/packs` | GET, POST | CRUD packs |
| `/api/admin/packs/[id]` | PUT, DELETE | Pack individuel |
| `/api/admin/payments` | GET | Liste paiements |
| `/api/admin/payments/[id]/review` | POST | Approuver/rejeter |
| `/api/admin/subscriptions` | GET | Liste abonnements |
| `/api/admin/subscriptions/[id]` | PATCH | Modifier abonnement |
| `/api/admin/referrals` | GET | Stats parrainage |
| `/api/admin/credits` | GET, POST | Credits (liste + attribution) |
| `/api/admin/payment-providers` | GET, PUT | Config paiement |

---

## 4. Bibliotheques / Utilitaires

| Fichier | Role |
|---------|------|
| `app/src/lib/types.ts` | Toutes les interfaces TypeScript |
| `app/src/lib/utils.ts` | TABLES, RESERVED_SUBDOMAINS, isValidSlug, helpers |
| `app/src/lib/plan-guard.ts` | Controle d'acces par plan + rate limiting |
| `app/src/lib/admin-guard.ts` | Guard admin pour les APIs |
| `app/src/lib/supabase/client.ts` | Client Supabase browser |
| `app/src/lib/supabase/server.ts` | Client Supabase server (RLS) |
| `app/src/lib/supabase/admin.ts` | Client Supabase admin (service role) |
| `app/src/proxy.ts` | Middleware routage par sous-domaine |

---

## 5. Migrations DB

| Migration | Tables concernees |
|-----------|------------------|
| `001_initial_schema.sql` | profiles, projects, experiences, waitlist, contact_messages |
| `003_admin_schema.sql` | +is_admin, is_suspended, plan, admin_notes, verified_badge, feature_flags, templates |
| `004_analytics_schema.sql` | portfolio_views, link_clicks |
| `011_payments_subscriptions.sql` | subscriptions, payments, referrals, credits, dev_requests, dev_quotes, dev_projects |
| `012_dynamic_plans.sql` | plans, packs, pack_purchases |

---

## 6. Tests

| Fichier | Couverture |
|---------|-----------|
| `app/src/__tests__/components/landing.test.tsx` | SocialProof, Hero, Features |
| `app/src/__tests__/components/admin-startups.test.tsx` | AdminStartupsTab |
| `app/src/__tests__/api/admin-startups.test.ts` | API admin startups |

> Couverture de tests tres faible pour le systeme dev. A renforcer.

---

*Index technique — Mars 2026*
