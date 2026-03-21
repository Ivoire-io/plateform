# ivoire.io — Roadmap d'implementation

> L'OS Digital de la Cote d'Ivoire
> Objectif : permettre a autant de projets que possible de passer de l'idee a l'entreprise reelle.

---

## Vue d'ensemble

| Phase | Semaines | Priorite | Description |
|-------|----------|----------|-------------|
| 1 | S1-S2 | CRITIQUE | BDD + Paiement manuel + Abonnements |
| 2 | S3-S4 | CRITIQUE | PayPal + Optimisation IA (cache, tracking, migration web search) |
| 3 | S5-S6 | HAUTE | UI Dashboard paiement + Admin reel (plus de mock) |
| 4 | S7 | HAUTE | Systeme de parrainage |
| 5 | S8-S10 | MOYENNE | Dev Outsourcing marketplace |
| 6 | S11 | HAUTE | Feature gating enforcement complet |
| 7 | S12+ | MOYENNE | Autres types users (dev, enterprise, investor) |
| 8 | Futur | BASSE | Wave / Orange Money |

---

## Phase 1 — Base de donnees + Paiement manuel (Semaines 1-2)

### Objectif
Mettre en place l'infrastructure de paiement et d'abonnement pour commencer a generer des revenus.

### Tables creees (Migration 011)

| Table | Description |
|-------|-------------|
| `ivoireio_subscriptions` | Plan actif par user (plan, status, dates, methode paiement) |
| `ivoireio_payments` | Historique paiements (proof_url pour manuel, paypal_order_id) |
| `ivoireio_referrals` | Liens parrain-filleul, status, recompense |
| `ivoireio_credits` | Balance credits (gain/depense, source) |
| `ivoireio_ai_usage` | Log chaque appel IA (tokens, cout, provider, cache hit) |
| `ivoireio_ai_cache` | Cache resultats IA avec TTL |
| `ivoireio_dev_requests` | Demandes dev des startups |
| `ivoireio_dev_quotes` | Devis admin pour dev outsourcing |
| `ivoireio_dev_projects` | Projets dev en cours (milestones, progression) |

### Modifications existantes
- ALTER `ivoireio_profiles` : ajout `referral_code`, `referred_by`, extension plan CHECK (`free/starter/pro/enterprise/student`)
- Storage bucket prive : `ivoireio-payment-proofs`
- RLS policies pour toutes les tables
- Seed `platform_config` avec pricing, providers, limites par plan

### API Routes
- `GET/POST /api/dashboard/subscription` — Lire/creer abonnement
- `POST /api/dashboard/subscription/cancel` — Annuler
- `GET/POST /api/dashboard/payments` — Historique + creer paiement manuel
- `POST /api/dashboard/payments/upload-proof` — Upload preuve (JPEG/PNG/PDF, max 5MB)

### Admin
- `GET /api/admin/subscriptions` — Lister avec filtres
- `PATCH /api/admin/subscriptions/[id]` — Modifier plan/status
- `POST /api/admin/payments/[id]/review` — Approuver/refuser paiement manuel

### Flux paiement manuel
1. User choisit "Virement bancaire" → affiche coordonnees depuis `platform_config`
2. User upload preuve de paiement → stocke dans bucket `ivoireio-payment-proofs`
3. Payment cree avec status `pending` → Subscription creee `pending`
4. Admin voit dans tab Paiements → Approuver/Refuser avec notes
5. Sur approbation : Payment→`completed`, Subscription→`active`, `profile.plan` mis a jour
6. Decrementation `free_slots` dans `platform_config`

### Livrables
- [ ] Migration SQL appliquee
- [ ] API routes fonctionnelles
- [ ] Test : upload preuve → admin approuve → plan change

---

## Phase 2 — PayPal + Optimisation IA (Semaines 3-4)

### PayPal Business
- Support EUR uniquement (XOF non supporte par PayPal)
- Conversion au taux fixe : 1 EUR = 655,957 XOF (parite CFA-EUR)
- Pas de SDK serveur — API REST v2 directe avec `fetch()` + Basic Auth
- Script JS SDK cote client pour popup PayPal

### Flux PayPal
1. User POST `create-order` → backend cree commande PayPal REST v2 → retourne `order_id` + `approve_url`
2. Frontend redirige vers PayPal → user approuve dans popup
3. User revient → frontend POST `capture-order` → backend capture le paiement
4. Payment cree, Subscription activee, `profile.plan` mis a jour

### API Routes PayPal
- `POST /api/dashboard/payments/paypal/create-order`
- `POST /api/dashboard/payments/paypal/capture-order`
- `POST /api/paypal/webhook` (backup, verification signature)

### Optimisation IA

#### Migration web search Anthropic → OpenAI
- **Pourquoi** : Anthropic facture les recherches web separement. OpenAI `gpt-4o-mini` avec `web_search_preview` est moins cher.
- `competitors` et `oapi_check` migres vers OpenAI Responses API
- Nouveau fichier : `lib/ai/openai-websearch.ts`
- Router mis a jour : ces 2 taches pointent vers `"openai"`

#### AI Tracking
- `lib/ai/tracker.ts` : log chaque appel (tokens, cout USD/FCFA, provider, model)
- Dashboard admin : total mois, par provider, par tache, top 10 users
- Taux : 1 USD = 655 FCFA

#### AI Cache
- Cache SHA-256 par (task + input hash)
- TTL configurable par tache (24h pour taglines, 720h pour cahier des charges)
- Nettoyage automatique des entrees expirees

#### Rate Limiting
- In-memory par userId contre les limites du plan
- Auto-cleanup toutes les heures

### Variables d'environnement
```
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxx
```

### Livrables
- [ ] PayPal sandbox fonctionnel (create → approve → capture)
- [ ] Cache IA operationnel (verifier qu'un 2e appel identique ne coute rien)
- [ ] Dashboard admin AI usage visible

---

## Phase 3 — UI Dashboard + Admin reel (Semaines 5-6)

### Dashboard utilisateur (nouveaux onglets)
- **Abonnement** : selection de plan, methode de paiement (manuel/PayPal/credits), historique
- **Parrainage** : code parrainage, lien partageable, stats, partage WhatsApp

### Admin (rewrite complet)
- **Paiements** : pipeline review (pending → approve/reject), preuves, notes
- **Couts IA** : total mois, par provider, par tache, top 10 users
- **Parrainage** : metriques, liste referrals
- **Providers paiement** : activer/desactiver manuel/PayPal, coordonnees bancaires
- **Abonnements** : rewrite sans mock data, donnees reelles

### Composants crees
| Composant | Description |
|-----------|-------------|
| `subscription-tab.tsx` | Plans, paiement, historique |
| `manual-payment-form.tsx` | Formulaire virement + upload preuve |
| `paypal-checkout.tsx` | Bouton PayPal + capture |
| `referral-tab.tsx` | Code, lien, stats, WhatsApp |
| `upgrade-dialog.tsx` | Dialog reutilisable selection plan |
| `payments-tab.tsx` (admin) | Pipeline revue paiements |
| `ai-usage-tab.tsx` (admin) | Dashboard couts IA |
| `referrals-tab.tsx` (admin) | Metriques parrainage |
| `payment-providers-tab.tsx` (admin) | Config providers |

### Livrables
- [ ] User peut choisir un plan et payer (manuel ou PayPal)
- [ ] Admin peut approuver/refuser les paiements
- [ ] Dashboard IA affiche les couts reels

---

## Phase 4 — Systeme de parrainage (Semaine 7)

### Fonctionnement
1. Chaque user recoit un code parrainage unique (8 caracteres, auto-genere)
2. URL partageable : `https://ivoire.io?ref=CODE`
3. Quand un filleul s'inscrit avec le code :
   - Referral cree avec status `pending`
   - Sur conversion (filleul active un plan payant) : referral → `converted`
   - Recompense :
     - Filleul Starter → parrain recoit +1 000 FCFA credits
     - Filleul Pro → parrain recoit +5 000 FCFA credits
4. Credits utilisables pour payer un abonnement

### API Routes
- `GET /api/dashboard/referral` — Code, URL, stats, balance
- `POST /api/dashboard/referral` — Appliquer un code parrainage
- `GET /api/dashboard/credits` — Balance + historique
- `GET /api/admin/referrals` — Stats globales
- `GET/POST /api/admin/credits` — Voir + attribution manuelle

### Livrables
- [ ] Code genere automatiquement
- [ ] Partage WhatsApp fonctionnel
- [ ] Credits credites sur conversion
- [ ] Paiement par credits operationnel

---

## Phase 5 — Dev Outsourcing marketplace (Semaines 8-10)

### Concept
Apres avoir genere un cahier des charges avec le Project Builder, une startup peut :
1. **Recruter directement** des devs sur le portail `devs.ivoire.io`
2. **Confier le projet a ivoire.io** pour gestion complete (devis, equipe, milestones)

### Flux startup
1. Startup cree une demande dev (titre, description, ref cahier charges, budget, timeline)
2. IA analyse et suggere les roles necessaires (frontend, backend, mobile, devops, design, etc.)
3. Startup choisit type de paiement : `one_shot`, `installments`, `partnership`
4. Soumission a ivoire.io

### Flux admin (pipeline)
1. Admin recoit les demandes → status `submitted`
2. Admin cree un devis (montant, echeancier, equipe, tech stack)
3. Startup accepte/refuse le devis
4. Si accepte : projet dev cree avec milestones
5. Admin suit la progression, marque les milestones termines
6. Paiement par milestone

### Types de paiement
- **One shot** : paiement unique a la livraison
- **Installments** : echeancier en N versements (defini dans le devis)
- **Partnership** : ivoire.io prend un % du CA en echange d'un tarif reduit

### API Routes

#### Dashboard (startup)
- `GET/POST /api/dashboard/dev-requests`
- `GET/PATCH /api/dashboard/dev-requests/[id]`
- `POST /api/dashboard/dev-requests/[id]/suggest-roles` (IA)
- `GET /api/dashboard/dev-projects`

#### Admin
- `GET /api/admin/dev-requests` + `PATCH /api/admin/dev-requests/[id]`
- `GET/POST /api/admin/dev-quotes` + `PATCH /api/admin/dev-quotes/[id]`
- `GET /api/admin/dev-projects` + `PATCH /api/admin/dev-projects/[id]`

### Livrables
- [ ] Startup peut creer une demande dev
- [ ] IA suggere les roles techniques
- [ ] Admin peut creer un devis et gerer le pipeline
- [ ] Suivi par milestones

---

## Phase 6 — Feature gating enforcement (Semaine 11)

### Plan Guard (`lib/plan-guard.ts`)
Middleware qui verifie :
1. L'utilisateur est authentifie
2. Son plan est suffisant pour la feature demandee
3. Ses limites ne sont pas depassees (projets, generations IA/jour, etc.)

### Matrice des plans

| Feature | Free | Student | Starter | Pro | Enterprise |
|---------|------|---------|---------|-----|------------|
| Projets max | 5 | 10 | 15 | ∞ | ∞ |
| Templates | 3 gratuits | gratuits+1 | gratuits+1 | tous | tous+corporate |
| Pitch Deck | - | - | ✓ | ✓ | ✓ |
| Cahier des charges | - | - | - | ✓ | ✓ |
| Business Plan | - | - | - | ✓ | ✓ |
| One Pager | - | - | ✓ | ✓ | ✓ |
| CGU | - | - | - | ✓ | ✓ |
| Roadmap | - | - | - | ✓ | ✓ |
| Analyse concurrents | - | - | ✓ | ✓ | ✓ |
| Verification OAPI | - | - | ✓ | ✓ | ✓ |
| Logo (variations) | 1 | 2 | 3 | 5 | 10 |
| Stats avancees | - | - | - | ✓ | ✓ |
| Export PDF | - | - | - | ✓ | ✓ |
| Badge verifie | - | - | - | ✓ | ✓ |
| Fundraising | - | - | - | ✓ | ✓ |
| Dev outsourcing | - | - | - | ✓ | ✓ |
| Generations IA/jour | 5 | 10 | 20 | 50 | ∞ |

### Application
- Chaque route API du Project Builder verifie via `planGuard()`
- Template tab verifie `isPremium` (tout plan != free)
- Dashboard conditionne l'affichage des features

### Livrables
- [ ] Toutes les routes IA protegees par plan guard
- [ ] Rate limiting actif
- [ ] Erreurs 403 claires avec message d'upgrade

---

## Phase 7 — Autres types d'utilisateurs (Semaines 12+)

### Developpeurs
- Portfolio builder ameliore
- Skill assessment et badges de competences
- Disponibilite pour recrutement (calendrier)
- Matching avec demandes dev des startups
- Stats de profil (vues par entreprises, clicks)

### Entreprises
- Profil entreprise multi-utilisateurs
- Multi-job posting avec analytics
- Dashboard recrutement (candidatures, pipeline)
- Recherche avancee dans l'annuaire devs
- Bulk messaging (contacts directs)

### Investisseurs (futur)
- Deal flow et decouverte de startups Pro
- Portfolio tracking
- Contacts directs avec fondateurs
- Due diligence tools
- Statistiques marche ivoirien

### Pricing par type

| Type | Plans disponibles |
|------|------------------|
| Developpeur | Free, Student, Starter, Pro |
| Startup | Free, Starter, Pro, Enterprise |
| Entreprise | Starter, Pro, Enterprise |
| Investisseur (futur) | Pro, Enterprise |

---

## Phase 8 — Wave / Orange Money (Futur)

### Wave Money
- API Wave business pour paiements mobiles
- Flux : initier paiement → user confirme sur Wave → webhook callback → activation
- Monnaie : XOF natif (pas de conversion)
- Populaire en CI pour les petits montants

### Orange Money
- API Orange Money CI
- Meme flux que Wave
- USSD fallback pour utilisateurs sans smartphone

### Pre-requis
- Compte business Wave et Orange Money
- Certificats API et cles
- Serveur webhook accessible publiquement

### Livrables
- [ ] Wave fonctionnel en production
- [ ] Orange Money fonctionnel en production
- [ ] Reconciliation automatique des paiements

---

## Pricing

### Grille tarifaire

| Plan | Prix | Frequence | Cible |
|------|------|-----------|-------|
| **Free** | 0 FCFA | - | Tout le monde |
| **Student** | 2 000 FCFA | /mois | Etudiants |
| **Starter** | 5 000 FCFA | unique | Premiers pas |
| **Pro** | 35 000 FCFA | /an | Usage serieux |
| **Enterprise** | 150 000 FCFA | /an | Grandes structures |

### Projections (6 mois)

| Scenario | Users payants | MRR | Marge |
|----------|--------------|-----|-------|
| Pessimiste | 20 | 100 000 FCFA | ~50 000 FCFA |
| Realiste | 60 | 350 000 FCFA | ~220 000 FCFA |
| Optimiste | 150 | 900 000 FCFA | ~650 000 FCFA |

### Objectif seuil de rentabilite
- Couts infra : ~65 000 FCFA/mois
- Couts IA : ~50 FCFA/generation (apres cache)
- **Seuil** : ~15-20 abonnes payants (mix Starter/Pro)

---

## Metriques cles a suivre

| Metrique | Cible M3 | Cible M6 | Cible M12 |
|----------|----------|----------|-----------|
| Utilisateurs totaux | 200 | 500 | 1 500 |
| Taux conversion Free→Payant | 5% | 8% | 12% |
| MRR | 100K FCFA | 350K FCFA | 1M FCFA |
| Cout IA moyen/user/mois | < 200 FCFA | < 150 FCFA | < 100 FCFA |
| Taux cache IA | > 30% | > 50% | > 60% |
| Referrals actifs | 10 | 40 | 100 |
| Projets dev outsourcing | 2 | 8 | 20 |

---

## Architecture technique

```
app/
├── src/
│   ├── lib/
│   │   ├── plan-guard.ts          # Controle acces par plan
│   │   ├── rate-limit.ts          # Rate limiting in-memory
│   │   ├── ai/
│   │   │   ├── tracker.ts         # AI usage tracking + cache
│   │   │   ├── openai-websearch.ts # Web search via OpenAI
│   │   │   ├── openai.ts          # Generations courtes
│   │   │   ├── anthropic.ts       # Documents longs
│   │   │   └── router.ts          # Aiguillage provider
│   │   ├── supabase/
│   │   │   ├── server.ts          # Client RLS
│   │   │   ├── client.ts          # Client browser
│   │   │   └── admin.ts           # Client admin (service role)
│   │   ├── types.ts               # Tous les types
│   │   └── utils.ts               # TABLES, helpers
│   ├── app/
│   │   ├── api/
│   │   │   ├── dashboard/
│   │   │   │   ├── subscription/   # CRUD abonnement
│   │   │   │   ├── payments/       # Paiements + PayPal
│   │   │   │   ├── referral/       # Parrainage
│   │   │   │   ├── credits/        # Credits
│   │   │   │   └── dev-requests/   # Demandes dev
│   │   │   ├── admin/
│   │   │   │   ├── subscriptions/  # Gestion abonnements
│   │   │   │   ├── payments/       # Review paiements
│   │   │   │   ├── ai-usage/       # Dashboard IA
│   │   │   │   ├── referrals/      # Stats parrainage
│   │   │   │   ├── credits/        # Attribution credits
│   │   │   │   ├── dev-requests/   # Pipeline demandes
│   │   │   │   ├── dev-quotes/     # Devis
│   │   │   │   └── dev-projects/   # Projets dev
│   │   │   └── paypal/
│   │   │       └── webhook/        # Webhook PayPal
│   │   └── admin/                  # Pages admin
│   └── components/
│       ├── dashboard/
│       │   ├── subscription-tab.tsx
│       │   ├── referral-tab.tsx
│       │   ├── dev-outsourcing-tab.tsx
│       │   ├── manual-payment-form.tsx
│       │   ├── paypal-checkout.tsx
│       │   └── upgrade-dialog.tsx
│       └── admin/tabs/
│           ├── payments-tab.tsx
│           ├── ai-usage-tab.tsx
│           ├── referrals-tab.tsx
│           ├── payment-providers-tab.tsx
│           └── dev-pipeline-tab.tsx
└── supabase/
    └── migrations/
        └── 011_payments_subscriptions_referrals_ai_devmarket.sql
```

---

## Checklist de verification

### Pre-deploiement
- [ ] Migration 011 appliquee sans erreur
- [ ] Variables d'environnement PayPal configurees
- [ ] `npm run build` passe sans erreur TypeScript
- [ ] RLS policies testees

### Tests fonctionnels
- [ ] Paiement manuel : upload preuve → admin approuve → plan change
- [ ] PayPal sandbox : create → approve → capture → plan change
- [ ] Plan guard : user free tente pitch_deck → 403
- [ ] Cache IA : generer un document → re-demander → pas de cout IA
- [ ] Parrainage : creer code → partager → filleul s'inscrit → referral cree
- [ ] Dev outsourcing : demande → devis admin → acceptation → projet cree
- [ ] Credits : gain par parrainage → utiliser pour payer un plan

### Performance
- [ ] Cache IA > 30% de hit rate apres 1 semaine
- [ ] Temps de reponse API < 500ms (hors generation IA)
- [ ] Upload preuve < 5MB enforce

---

*Derniere mise a jour : Mars 2026*
