# STRATEGIE DE VIABILITE IVOIRE.IO — ANALYSE 360°

> Document de reference pour la survie et la croissance du projet.
> Genere a partir de l'analyse complete du codebase, des couts reels et du marche ivoirien.
> Date : 21 mars 2026

---

## TABLE DES MATIERES

1. [Etat des lieux reel de l'application](#1-etat-des-lieux-reel)
2. [Couts reels detailles](#2-couts-reels-detailles)
3. [Strategie de tarification](#3-strategie-de-tarification)
4. [Fonctionnalites gratuites vs payantes](#4-fonctionnalites-gratuites-vs-payantes)
5. [Systeme de filleuls et croissance virale](#5-systeme-de-filleuls)
6. [Communautes et partenariats](#6-communautes-et-partenariats)
7. [Reduction des couts](#7-reduction-des-couts)
8. [Scenarios de rentabilite](#8-scenarios-de-rentabilite)
9. [Plan d'action mois par mois](#9-plan-action)
10. [Controle total depuis l'admin](#10-controle-admin)
11. [Risques et mitigations](#11-risques)
12. [Resume executif](#12-resume)

---

## 1. ETAT DES LIEUX REEL

### Ce qui existe et fonctionne

| Module | Etat | Detaille |
|--------|------|----------|
| Landing page | 100% | Waitlist, slug check, social proof |
| Dashboard Dev | 100% | 9 tabs, 13 API routes |
| Dashboard Startup | 90% | 14 tabs dont Project Builder |
| Dashboard Admin | 95% | 14 tabs, 22 API routes |
| Portails publics | Devs 100%, Startups beta | Annuaires avec filtrages |
| Project Builder | 85% | 10 API routes, 3 providers IA |
| Templates portfolio | 100% | 3 templates actifs (3 free) |
| Base de donnees | 100% | 20+ tables, RLS configure |
| Feature flags | 100% | Controle granulaire on/off/beta |

### Ce qui N'existe PAS encore (critique pour la viabilite)

| Manquant | Impact |
|----------|--------|
| Systeme de paiement (Wave/OM/Stripe) | **BLOQUANT** — aucun revenu possible |
| Table `subscriptions` en BDD | Pas de gestion d'abonnements |
| Middleware de controle d'acces par plan | Les features "premium" sont accessibles a tous |
| Tracking des couts IA par utilisateur | Impossible de savoir qui coute combien |
| Cache des generations IA | Chaque regeneration coute a nouveau |
| Systeme de parrainage | Pas de croissance virale |

---

## 2. COUTS REELS DETAILLES

### 2.1 Infrastructure fixe mensuelle

| Poste | Cout/mois | Notes |
|-------|-----------|-------|
| Railway (hosting) | ~35 USD (23 000 FCFA) | Plan Starter, scale auto |
| Supabase | 0 USD | Free tier (500 MB, 50k rows) |
| Cloudflare | 0 USD | Free tier (DNS + CDN) |
| Domaine ivoire.io | ~3 USD/mois (~2 000 FCFA) | 40 USD/an amorti |
| Resend (email) | 0 USD | Free tier (100 emails/jour) |
| **TOTAL INFRA** | **~38 USD (~25 000 FCFA)** | |

> Note : le chiffre "100 USD" souvent cite est exagere. Avec Railway starter + free tiers, on est plus proche de 38 USD.
> A 500+ utilisateurs, Supabase passera au plan Pro (25 USD/mois). Total = ~63 USD (~41 000 FCFA).

### 2.2 Cout IA par generation de projet (une seule fois)

Voici le cout reel, appel par appel, base sur les prix API actuels :

#### OpenAI (gpt-4o-mini) — Textes courts

| Tache | Tokens input | Tokens output | Cout |
|-------|-------------|--------------|------|
| Taglines (3) | ~400 | ~150 | $0.0001 |
| Description courte | ~300 | ~100 | $0.0001 |
| Noms de projet (5) | ~350 | ~150 | $0.0001 |
| Personas (3) | ~400 | ~300 | $0.0001 |
| Interview (8 questions) | ~2400 | ~800 | $0.0005 |
| Description longue | ~400 | ~300 | $0.0001 |
| **Sous-total OpenAI** | | | **$0.001 (~0.65 FCFA)** |

> Prix gpt-4o-mini : $0.15/1M input, $0.60/1M output. C'est quasi gratuit.

#### Anthropic (claude-sonnet-4-6) — Documents longs

| Tache | Tokens input | Tokens output | Cout |
|-------|-------------|--------------|------|
| Pitch deck (10 slides) | ~800 | ~4096 | $0.053 |
| Cahier des charges | ~600 | ~4096 | $0.052 |
| Business plan | ~700 | ~4096 | $0.052 |
| One-pager | ~600 | ~2048 | $0.027 |
| Roadmap 12 mois | ~500 | ~2048 | $0.026 |
| CGU | ~500 | ~4096 | $0.050 |
| Analyse concurrents + web | ~600 | ~4096 | $0.065 |
| Verif OAPI + web | ~400 | ~1000 | $0.016 |
| Amelioration texte (x3) | ~1200 | ~3000 | $0.042 |
| **Sous-total Anthropic** | | | **$0.383 (~250 FCFA)** |

> Prix claude-sonnet-4-6 : $3/1M input, $15/1M output. C'est le poste principal.
> **ATTENTION** : les appels avec `web_search` (concurrents, OAPI) coutent plus cher car chaque recherche web est facturee separement par Anthropic.

#### crun.ai (nanobanana-pro) — Logos

| Tache | Cout unitaire | Quantite | Cout total |
|-------|--------------|----------|-----------|
| Logo variation | ~$0.08 | 3 | $0.24 |
| **Sous-total logos** | | | **$0.24 (~157 FCFA)** |

#### Domain check (WHOIS API)

| Tache | Cout |
|-------|------|
| Verification domaine | ~$0.001 (~0.65 FCFA) |

### 2.3 COUT TOTAL — UNE GENERATION COMPLETE

| Composant | Cout USD | Cout FCFA |
|-----------|----------|-----------|
| OpenAI (textes courts) | $0.001 | 0.65 |
| Anthropic (documents) | $0.383 | 250 |
| crun.ai (logos x3) | $0.240 | 157 |
| WHOIS | $0.001 | 0.65 |
| **TOTAL par projet** | **$0.625** | **~408 FCFA** |

> Le cout correct est **~408 FCFA** par projet complet, pas 310 FCFA.
> L'ecart vient des appels web_search (competitors, OAPI) qui n'etaient pas comptes avant.

### 2.4 Cout par fonctionnalite individuelle

C'est CA la cle pour definir le gratuit vs payant :

| Fonctionnalite | Cout reel | Classification |
|----------------|-----------|---------------|
| Nom + taglines + desc courte | ~1 FCFA | Negligeable |
| Description longue | ~1 FCFA | Negligeable |
| Personas (3) | ~1 FCFA | Negligeable |
| Interview IA (8 questions) | ~1 FCFA | Negligeable |
| **Logo (3 variations)** | **157 FCFA** | **Cher** |
| **Pitch deck** | **35 FCFA** | Moyen |
| **Cahier des charges** | **34 FCFA** | Moyen |
| **Business plan** | **34 FCFA** | Moyen |
| **One-pager** | **18 FCFA** | Moyen |
| Roadmap | ~17 FCFA | Moyen |
| CGU | ~33 FCFA | Moyen |
| **Analyse concurrents + web** | **42 FCFA** | Moyen-cher |
| Verif OAPI + web | ~10 FCFA | Faible |
| Amelioration texte (x3) | ~27 FCFA | Moyen |
| Export PDF | 0 FCFA | Local |
| Timestamp SHA-256 | 0 FCFA | Local |
| Verification domaine | ~1 FCFA | Negligeable |
| Score de projet | 0 FCFA | Local |

**Revelation** : les taches OpenAI coutent quasiment rien. Ce qui coute c'est :
1. Les 3 logos crun.ai (157 FCFA = 38% du total)
2. Les documents Anthropic (250 FCFA = 61% du total)

---

## 3. STRATEGIE DE TARIFICATION

### 3.1 Philosophie

Le marche ivoirien a des realites precises :
- Un etudiant n'a pas 5 000 FCFA/mois a depenser recurremment
- Un professionnel/entrepreneur accepte de payer SI la valeur est immediate et tangible
- Un forfait unique est TOUJOURS plus facile a vendre qu'un abonnement mensuel
- Le prix d'un cafe a Abidjan est ~500 FCFA. Le prix d'un transport aller est ~300 FCFA
- Un petit dejeuner complet coute ~2 000 FCFA
- Un consultant facturerait un business plan a 200 000 - 500 000 FCFA

### 3.2 Grille tarifaire recommandee

#### OFFRE 1 — GRATUIT (Decouverte)

| Ce qui est inclus | Pourquoi gratuit |
|-------------------|-----------------|
| Inscription + profil basique | Acquisition utilisateur |
| Dashboard (overview, profil, template free) | Familiarisation |
| Project Builder Mode A/B/C | Le processus guide |
| Nom + taglines + desc courte generees par IA | Cout = 1 FCFA |
| Personas generees | Cout = 1 FCFA |
| Interview IA complete | Cout = 1 FCFA |
| 1 proposition de logo (pas 3) | Cout = 52 FCFA |
| Score de projet | Cout = 0 |
| Verification domaine | Cout = 1 FCFA |
| Total gratuit = max ~56 FCFA de cout IA |

**Limite** : 100 premieres startups gratuites (jauge visible publiquement).

#### OFFRE 2 — STARTER (Forfait unique)

**Prix : 5 000 FCFA** (paiement unique, pas d'abonnement)

| Ce qui est ajoute | Valeur percue |
|-------------------|---------------|
| Logo HD (3 variations) | Normalement 50 000 FCFA chez un designer |
| Pitch deck genere (10 slides) | Normalement 150 000 FCFA chez un consultant |
| One-pager executif | Normalement 50 000 FCFA |
| Analyse concurrents avec recherche web | Introuvable en Afrique de l'Ouest |
| Verification OAPI/RCCM | Normalement 25 000 FCFA en cabinet |
| Timestamp certifie (preuve de conception) | Unique a ivoire.io |
| Export PDF tous documents | |
| 3 regenerations max | Pour affiner |
| Acces 1 template premium au choix | |

**Cout reel pour toi** : ~340 FCFA. **Marge : 4 660 FCFA (93%)**

#### OFFRE 3 — PRO (Forfait annuel)

**Prix : 35 000 FCFA/an** (equiv. ~2 917 FCFA/mois)

| Ce qui est ajoute par rapport a Starter | Valeur percue |
|----------------------------------------|---------------|
| Tous les templates premium (6) | |
| Cahier des charges technique complet | 200 000 FCFA chez un consultant |
| Business plan complet | 300 000 FCFA chez un consultant |
| CGU generees (OHADA) | 150 000 FCFA chez un avocat |
| Roadmap 12 mois | |
| Regenerations illimitees | |
| Module fundraising (gestion levee) | |
| Module recrutement (offres d'emploi) | |
| Badge "Verifie" sur le profil | Credibilite |
| Visibilite prioritaire dans l'annuaire | |
| Support prioritaire WhatsApp | |

**Cout reel** : ~408 FCFA (1ere generation) + ~100 FCFA par regeneration. **Marge : >97%**

#### OFFRE 4 — ENTERPRISE

**Prix : 150 000 FCFA/an** (equiv. 12 500 FCFA/mois)

| Ce qui est ajoute | Pour qui |
|-------------------|----------|
| Tout de Pro | |
| Template Corporate exclusif | |
| Logo personnalise avec iterations | |
| Sous-domaine custom (startup.ivoire.io) | |
| API Access (open data) | |
| Support dedie | |
| Mise en avant homepage | |

### 3.3 Pourquoi cette grille fonctionne

```
ETUDIANT avec une idee
  → Gratuit (0 FCFA) → decouvre la plateforme
  → Frustration : logo basse resolution, pas de pitch deck
  → Conversion naturelle vers Starter (5 000 FCFA = prix d'un repas)

PORTEUR DE PROJET serieux
  → Starter (5 000 FCFA) → a son dossier basique
  → Frustration : pas de cahier des charges pour le dev, pas de business plan
  → Conversion vers Pro (35 000 FCFA = prix de 2 diners)

STARTUP en activite
  → Pro (35 000 FCFA/an) → dossier complet
  → Besoin de recruter, lever des fonds, portfolio pro
  → Conversion vers Enterprise (150 000 FCFA/an)
```

---

## 4. FONCTIONNALITES GRATUITES VS PAYANTES — DETAIL

### 4.1 Matrice complete

| Fonctionnalite | Gratuit | Starter (5k) | Pro (35k/an) | Enterprise (150k/an) | Decision justifiee |
|----------------|---------|---------------|--------------|---------------------|-------------------|
| **IDENTITE** | | | | | |
| Nom + suggestions IA | OUI | OUI | OUI | OUI | Cout ~0, acquisition |
| Taglines (3) | OUI | OUI | OUI | OUI | Cout ~0 |
| Description courte | OUI | OUI | OUI | OUI | Cout ~0 |
| Description longue | OUI | OUI | OUI | OUI | Cout ~0 |
| Logo (1 variation, basse res) | OUI | OUI | OUI | OUI | 52 FCFA, d'appel |
| Logo HD (3 variations) | NON | OUI | OUI | OUI | 157 FCFA, **declencheur d'achat** |
| Verification domaine | OUI | OUI | OUI | OUI | Cout ~0 |
| **VISION** | | | | | |
| Personas (3) | OUI | OUI | OUI | OUI | Cout ~0 |
| Interview IA | OUI | OUI | OUI | OUI | Cout ~0, engagement |
| Analyse concurrents web | NON | OUI | OUI | OUI | 42 FCFA, web search payant |
| Verif OAPI/RCCM | NON | OUI | OUI | OUI | 10 FCFA |
| **DOCUMENTS** | | | | | |
| Score de projet | OUI | OUI | OUI | OUI | Cout 0, motivation |
| Pitch deck (10 slides) | NON | OUI | OUI | OUI | 35 FCFA, **declencheur d'achat** |
| One-pager executif | NON | OUI | OUI | OUI | 18 FCFA |
| Cahier des charges | NON | NON | OUI | OUI | 34 FCFA, valeur tres haute |
| Business plan | NON | NON | OUI | OUI | 34 FCFA, valeur tres haute |
| CGU (OHADA) | NON | NON | OUI | OUI | 33 FCFA |
| Roadmap 12 mois | NON | NON | OUI | OUI | 17 FCFA |
| Export PDF | NON | OUI (limites) | OUI (tous) | OUI (tous) | Cout 0, **declencheur d'achat** |
| Timestamp certifie | NON | OUI | OUI | OUI | Cout 0, valeur juridique |
| **REGENERATIONS** | | | | | |
| Regeneration textes courts | 1 fois | 3 fois | Illimite | Illimite | Maitrise des couts |
| Regeneration documents | NON | 3 fois | Illimite | Illimite | |
| Regeneration logo | NON | 1 fois | 3 fois | Illimite | Logo = poste couteux |
| Amelioration texte IA | NON | OUI | OUI | OUI | |
| **DASHBOARD** | | | | | |
| Overview + profil | OUI | OUI | OUI | OUI | Base |
| Templates free (3) | OUI | OUI | OUI | OUI | |
| Templates premium (+1 choix) | NON | OUI | OUI | OUI | |
| Tous templates premium (6) | NON | NON | OUI | OUI | |
| Template Corporate | NON | NON | NON | OUI | |
| Projets portfolio | 3 max | 10 | Illimite | Illimite | |
| Messages | OUI | OUI | OUI | OUI | |
| Statistiques basiques | OUI | OUI | OUI | OUI | |
| Stats avancees (referrers, geo) | NON | NON | OUI | OUI | |
| **EQUIPE & PRODUITS** | | | | | |
| Gestion equipe | 3 membres | 5 membres | Illimite | Illimite | |
| Gestion produits | 1 produit | 3 produits | Illimite | Illimite | |
| Publication sur portail public | NON | OUI | OUI | OUI | |
| **FUNDRAISING & EMPLOI** | | | | | |
| Module fundraising | NON | NON | OUI | OUI | Valeur haute |
| Gestion investisseurs | NON | NON | OUI | OUI | |
| Documents fundraising | NON | NON | OUI | OUI | |
| Offres d'emploi | 1 draft | 1 active | Illimite | Illimite | |
| **VISIBILITE** | | | | | |
| Profil dans annuaire | OUI | OUI | OUI | OUI | |
| Badge "Verifie" | NON | NON | OUI | OUI | |
| Visibilite prioritaire | NON | NON | OUI | OUI | |
| Mise en avant homepage | NON | NON | NON | OUI | |

### 4.2 Les 5 declencheurs d'achat (par ordre de puissance)

1. **Le logo HD** — Le porteur voit un apercu flou. Il veut la version nette. 5 000 FCFA pour debloquer le logo + tout le starter pack. C'est une evidence.

2. **Le pitch deck PDF** — Le porteur a son score de projet a 30%. Il voit "Pitch Deck" grise. S'il veut presenter son projet a un investisseur, un incubateur, ou meme sa famille, il a besoin de ce document. 5 000 FCFA.

3. **Le cahier des charges** — Le porteur veut faire developper son app. Sans cahier des charges, aucun dev serieux ne commence. C'est le pont direct vers l'offre Pro (35 000 FCFA) ou vers un service de dev externalise.

4. **Le business plan** — Pour toute demarche de financement (banque, fond d'investissement, concours startup), c'est obligatoire. Le porteur qui en est la passe en Pro.

5. **L'export PDF** — Gratuit = tout est dans l'app. Payant = tu telecharges, tu imprimes, tu envoies. Le moment ou le porteur veut sortir du digital vers le monde reel, il paye.

---

## 5. SYSTEME DE FILLEULS ET CROISSANCE VIRALE

### 5.1 Programme de parrainage

**Mecanisme** : Chaque utilisateur (gratuit ou payant) a un lien de parrainage unique.

| Action du filleul | Recompense parrain | Recompense filleul |
|-------------------|-------------------|-------------------|
| Inscription gratuite | +1 regeneration gratuite | Rien (deja gratuit) |
| Achat Starter (5 000 FCFA) | **1 000 FCFA de credit** OU 1 mois Pro offert | **500 FCFA de reduction** (paie 4 500) |
| Achat Pro (35 000 FCFA) | **5 000 FCFA de credit** OU upgrade Enterprise 1 mois | **5 000 FCFA de reduction** (paie 30 000) |

**Credits** : Les credits s'accumulent et sont utilisables pour :
- Acheter un forfait (Starter ou Pro)
- Debloquer des regenerations supplementaires
- Pas de cash-out (evite les abus)

**Pourquoi ca marche** :
- En Cote d'Ivoire, le bouche-a-oreille est le canal #1 de confiance
- Un etudiant qui parraine 5 amis qui passent en Starter gagne 5 000 FCFA de credit = son propre Starter gratuit
- Un entrepreneur qui parraine 7 amis en Pro gagne 35 000 FCFA = son propre Pro gratuit

### 5.2 Schema de base de donnees pour le parrainage

```sql
-- Table de parrainage
CREATE TABLE ivoireio_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES ivoireio_profiles(id) NOT NULL,
  referred_id UUID REFERENCES ivoireio_profiles(id) NOT NULL,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending/converted/rewarded
  reward_type VARCHAR(20), -- credit/upgrade/regeneration
  reward_amount INTEGER, -- en FCFA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_id)
);

-- Credits utilisateur
CREATE TABLE ivoireio_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES ivoireio_profiles(id) NOT NULL,
  amount INTEGER NOT NULL, -- en FCFA, positif = gain, negatif = utilisation
  source VARCHAR(30) NOT NULL, -- referral/purchase/promo/admin
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter le code de parrainage au profil
ALTER TABLE ivoireio_profiles ADD COLUMN referral_code VARCHAR(20) UNIQUE;
ALTER TABLE ivoireio_profiles ADD COLUMN referred_by UUID REFERENCES ivoireio_profiles(id);
```

### 5.3 Autres leviers de viralite

| Levier | Mecanisme | Cout |
|--------|-----------|------|
| **Partage de score** | "Mon projet est a 72% sur ivoire.io" avec lien | 0 FCFA |
| **Portfolio public** | Chaque slug.ivoire.io est une pub gratuite | 0 FCFA |
| **Badge "Dossier Complet"** | Partage sur LinkedIn/WhatsApp | 0 FCFA |
| **Classement startups** | "Top 10 startups du mois" avec votes | 0 FCFA |
| **Concours mensuel** | "Meilleur projet du mois = 1 mois Pro offert" | 35 000 FCFA/mois |

---

## 6. COMMUNAUTES ET PARTENARIATS

### 6.1 Communautes tech ivoiriennes a cibler

| Communaute | Taille estimee | Approche |
|------------|---------------|----------|
| Abidjan Tech Community | 2000+ | Co-branding, speaker events |
| Google Developer Group Abidjan | 1500+ | Workshops Project Builder |
| Facebook Developer Circle CI | 1000+ | Posts sponsorises |
| Startup Weekend Abidjan | 500+/evenement | Sponsor outil officiel |
| Incubateurs (Y'ello Startup, Orange Fab) | 50-100/batch | Partenariat institutionnel |
| Universites (INP-HB, Polytechnique, ESATIC) | 5000+ etudiants tech | Offre campus |

### 6.2 Partenariat incubateurs — Modele "White Label"

**Proposition** : ivoire.io devient l'outil officiel de constitution de dossier startup pour les incubateurs.

| Pour l'incubateur | Pour ivoire.io |
|-------------------|---------------|
| Outil gratuit pour leurs startups | Acquisition en masse (30-100 startups/batch) |
| Dashboard de suivi des projets | Conversion organique vers Pro/Enterprise |
| Rapports de progression (scores) | Credibilite et legitimite |
| Branding co-marque | Donnees sur l'ecosysteme |

**Prix incubateur** : 500 000 FCFA/an pour 50 comptes Pro. Soit 10 000 FCFA/compte vs 35 000 en individuel. L'incubateur economise 1 250 000 FCFA. Toi tu gagnes 500 000 FCFA d'un coup.

### 6.3 Partenariat universites — Offre Campus

| Offre | Details |
|-------|---------|
| Prix pour etudiants | 2 000 FCFA forfait Starter (au lieu de 5 000) |
| Verification | Email @universite.ci ou carte etudiante |
| Limite | 200 comptes campus par universite/an |
| Avantage universite | Dashboard de suivi entrepreneurial |

### 6.4 Partenariat telcos (Wave, Orange Money)

**Phase 2** (quand le volume justifie) :
- Integration paiement Wave/Orange Money comme seul mode de paiement
- Negocier des frais reduits (1.5% au lieu de 3%) en echange de volume
- Co-marketing : "Payez votre dossier startup via Wave"

---

## 7. REDUCTION DES COUTS

### 7.1 Optimisations IA immediates (implementables cette semaine)

| Optimisation | Economie | Effort |
|-------------|----------|--------|
| **Cache logos 30 jours** | -50% couts logo si regeneration identique | 2h de dev |
| **Passer a claude-haiku-4-5 pour textes courts** | -80% sur les textes courts (deja presque gratuits) | 30min |
| **Limiter web_search a 3 au lieu de 5** pour concurrents | -40% sur analyse concurrents | 5min |
| **Generer 1 logo au lieu de 3 en gratuit** | -66% cout logo gratuit | 1h |
| **Cacher les resultats d'interview 24h** | Eviter re-generation si meme reponses | 1h |
| **Rate limiting par user** | Empecher les abus (max 5 generations/jour) | 1h |

### 7.2 Optimisations infrastructure

| Optimisation | Economie | Quand |
|-------------|----------|-------|
| **Vercel au lieu de Railway** | 0 USD (free tier hobby) vs 35 USD | Maintenant |
| **Passer a Supabase Pro** seulement a 500+ rows | Retarder 25 USD/mois | Plus tard |
| **Images logos en Supabase Storage** | Eviter S3/CDN externe | Maintenant |
| **Serverless functions** (deja avec Next.js) | Pas de serveur idle a payer | Deja fait |

### 7.3 Substitutions de modeles IA

| Tache actuelle | Modele actuel | Alternative | Economie |
|---------------|--------------|-------------|----------|
| Textes courts | gpt-4o-mini | gpt-4o-mini | Deja optimal |
| Documents longs | claude-sonnet-4-6 | **claude-haiku-4-5** | **-80% sur les docs** |
| Logos | nanobanana-pro (crun.ai) | Ideogram / Flux (si moins cher) | A tester |
| Web search | Claude + web_search | API Google Custom Search | Potentiellement -50% |

**ATTENTION** : passer a Haiku pour les documents degradera la qualite. A tester avant de deployer. La qualite du pitch deck et du business plan est un argument de vente majeur. Si la qualite baisse, la valeur percue baisse, et la conversion aussi.

**Recommandation** : garder Sonnet pour pitch deck et business plan. Passer Haiku pour CGU, roadmap, amelioration texte.

### 7.4 Cout optimise apres optimisations

| Composant | Avant | Apres | Economie |
|-----------|-------|-------|----------|
| OpenAI | 0.65 FCFA | 0.65 FCFA | 0% |
| Anthropic (docs critiques sur Sonnet) | 250 FCFA | ~150 FCFA | -40% |
| crun.ai (1 logo gratuit, 3 payants) | 157 FCFA | 52 FCFA (gratuit) / 157 FCFA (payant) | -66% pour gratuit |
| Web search | inclus | 3 recherches au lieu de 5 | -40% |
| **TOTAL gratuit** | ~408 FCFA | **~56 FCFA** | **-86%** |
| **TOTAL Starter** | ~408 FCFA | **~340 FCFA** | -17% |
| **TOTAL Pro** | ~408 FCFA | **~360 FCFA** | -12% |

---

## 8. SCENARIOS DE RENTABILITE

### 8.1 Hypotheses

| Parametre | Valeur |
|-----------|--------|
| Infra fixe (optimisee) | 25 000 FCFA/mois (Vercel free + Supabase free + domaine) |
| Cout IA gratuit | 56 FCFA/startup |
| Cout IA Starter | 340 FCFA/startup |
| Cout IA Pro | 360 FCFA/startup |
| Frais paiement mobile | 3% du montant |

### 8.2 Scenario A — Lancement conservateur (6 premiers mois)

| Mois | Gratuits | Starter (5k) | Pro (35k/an) | Revenu | Couts | Resultat |
|------|----------|-------------|-------------|--------|-------|----------|
| M1 | 30 | 0 | 0 | 0 | 26 680 | -26 680 |
| M2 | 40 | 5 | 0 | 25 000 | 27 920 | -2 920 |
| M3 | 20 | 10 | 2 | 120 000 | 29 040 | **+90 960** |
| M4 | 10 | 12 | 3 | 165 000 | 29 560 | **+135 440** |
| M5 | 0 (cap 100 atteint) | 15 | 4 | 215 000 | 30 100 | **+184 900** |
| M6 | 0 | 20 | 5 | 275 000 | 31 200 | **+243 800** |
| **TOTAL 6 mois** | 100 | 62 | 14 | **800 000** | **174 500** | **+625 500** |

> **Point mort** : mois 3 (avec seulement 10 Starters et 2 Pro)
> **Investissement initial a couvrir** : ~30 000 FCFA (M1+M2)
> C'est tenable meme sans economies personnelles importantes.

### 8.3 Scenario B — Croissance moderee (12 mois)

Apres les 100 gratuits :

| Periode | Starters cumules | Pro cumules | Revenu mensuel moyen | Resultat mensuel |
|---------|-----------------|------------|---------------------|-----------------|
| M1-M3 | 15 | 2 | 48 333 | +18 333 |
| M4-M6 | 47 | 12 | 141 667 | +111 667 |
| M7-M9 | 90 | 24 | 196 667 | +166 667 |
| M10-M12 | 150 | 40 | 255 000 | +225 000 |
| **Total annee 1** | | | | **+6 265 000 FCFA** |

> Soit environ **520 000 FCFA/mois de revenu net moyen**.
> **~785 EUR/mois** — suffisant pour couvrir les frais et se remunerer modestement.

### 8.4 Scenario C — Avec partenariat incubateur (bonus)

1 partenariat incubateur = +500 000 FCFA d'un coup.
2 partenariats en 12 mois = +1 000 000 FCFA supplementaires.

### 8.5 Le vrai accelerateur : le dev externalise

Quand un porteur de projet a son cahier des charges genere par ivoire.io, la question naturelle est : "Qui va me developper ca ?"

| Service | Prix | Marge (si sous-traite) | Marge (si tu fais toi-meme) |
|---------|------|----------------------|----------------------------|
| Landing page startup | 200 000 FCFA | 100 000 FCFA (50%) | 200 000 FCFA (100%) |
| MVP Web app | 800 000 FCFA | 400 000 FCFA | 800 000 FCFA |
| App Mobile | 1 500 000 FCFA | 750 000 FCFA | 1 500 000 FCFA |
| E-commerce | 500 000 FCFA | 250 000 FCFA | 500 000 FCFA |

Si 5% des porteurs Pro commandent un dev (2 projets sur 40 Pro la premiere annee) :
- 2 x 800 000 FCFA = **1 600 000 FCFA de revenu supplementaire**

---

## 9. PLAN D'ACTION MOIS PAR MOIS

### Mois 0 — Preparatifs (1 semaine)

- [ ] Implementer le systeme de paiement (Wave CI + Orange Money via CinetPay)
- [ ] Creer la table `ivoireio_subscriptions` en BDD
- [ ] Implementer le middleware de controle d'acces par plan
- [ ] Ajouter le compteur "X/100 places gratuites restantes" sur la landing
- [ ] Configurer les limites gratuit/Starter/Pro dans `ivoireio_platform_config`
- [ ] Mettre en cache les logos generes (Supabase Storage)
- [ ] Ajouter le rate limiting IA (5 generations/jour/user)

### Mois 1 — Lancement beta (acces 100 gratuits)

- [ ] Ouvrir les inscriptions (100 places gratuites)
- [ ] Communiquer sur WhatsApp, groupes tech CI, LinkedIn
- [ ] Collecter les feedbacks utilisateurs
- [ ] Premiere conversion Starter attendue : 0-3

### Mois 2 — Premiere monetisation

- [ ] Activer le paywall sur logo HD, pitch deck, export PDF
- [ ] Lancer le programme de parrainage
- [ ] Contacter 3 incubateurs pour partenariat
- [ ] Objectif : 5-10 Starters vendus

### Mois 3 — Fermeture du gratuit + scale

- [ ] Cap 100 gratuits atteint → fermer les inscriptions gratuites
- [ ] Communiquer : "Les 100 places gratuites sont prises"
- [ ] Tout nouveau porteur commence en Starter minimum
- [ ] Lancer l'offre Pro
- [ ] Objectif : 10-15 Starters + 2-3 Pro

### Mois 4-6 — Consolidation

- [ ] Premier partenariat incubateur signe
- [ ] Offre campus lancee (1-2 universites)
- [ ] Premier service de dev externalise vendu
- [ ] Optimiser les taux de conversion gratuit → Starter (cible : 15%)
- [ ] Objectif : 100 000+ FCFA de revenu mensuel recurrent

### Mois 7-12 — Croissance

- [ ] 3+ partenariats incubateurs
- [ ] Portail jobs.ivoire.io lance (offres payantes pour entreprises)
- [ ] Catalogue de services dev structure
- [ ] Objectif : 250 000+ FCFA de revenu mensuel

---

## 10. CONTROLE TOTAL DEPUIS L'ADMIN

### 10.1 Ce qui doit etre configurable dans l'admin

Tout ce qui affecte la viabilite doit etre modifiable SANS toucher au code :

#### Table `ivoireio_platform_config` — Cles a ajouter

```
# PLANS ET PRIX
plan_starter_price_xof          = 5000
plan_pro_price_xof              = 35000
plan_enterprise_price_xof       = 150000
plan_student_price_xof          = 2000
free_slots_total                = 100
free_slots_remaining            = 100

# LIMITES GRATUIT
free_max_logo_variations        = 1
free_max_regenerations          = 1
free_max_projects               = 3
free_max_team_members           = 3
free_max_products               = 1
free_max_jobs                   = 1
free_logo_resolution            = low

# LIMITES STARTER
starter_max_logo_variations     = 3
starter_max_regenerations       = 3
starter_max_projects            = 10
starter_max_team_members        = 5
starter_max_products            = 3
starter_max_jobs                = 1
starter_templates_allowed       = classic,minimal,startup,bento

# LIMITES PRO
pro_max_regenerations           = unlimited
pro_max_projects                = unlimited
pro_max_team_members            = unlimited
pro_max_products                = unlimited
pro_max_jobs                    = unlimited

# IA BUDGETS
ai_budget_monthly_usd           = 50
ai_max_generations_per_day      = 5
ai_cache_duration_hours         = 720
ai_web_search_max_per_call      = 3

# PARRAINAGE
referral_reward_starter_xof     = 1000
referral_reward_pro_xof         = 5000
referral_discount_starter_xof   = 500
referral_discount_pro_xof       = 5000
referral_enabled                = true

# PAIEMENT
payment_provider                = cinetpay
payment_wave_enabled            = true
payment_orange_money_enabled    = true
payment_stripe_enabled          = false
```

### 10.2 Nouveau tab admin recommande : "Plans & Monetisation"

Ce tab doit permettre de :
1. **Modifier les prix** de chaque offre en temps reel
2. **Ajuster les limites** (nombre de regenerations, logos, projets)
3. **Ouvrir/fermer les places gratuites** (bouton on/off + compteur)
4. **Voir le MRR en temps reel** (pas des donnees mockees)
5. **Configurer les recompenses de parrainage**
6. **Activer/desactiver un provider de paiement**
7. **Creer des codes promo** (reduction X% sur Starter/Pro)
8. **Voir les logs de paiement** (qui a paye quoi, quand)

### 10.3 Nouveau tab admin : "Couts IA"

Ce tab (deja partiellement present dans ai-providers-tab) doit ajouter :
1. **Cout reel par utilisateur** (combien chaque user a coute en IA)
2. **Cout par type de tache** (aggrege : combien le pitch deck coute ce mois)
3. **Budget restant** vs budget max mensuel
4. **Alertes** quand on approche 80% du budget
5. **Top 10 des utilisateurs les plus couteux** (detecter les abus)

---

## 11. RISQUES ET MITIGATIONS

| Risque | Probabilite | Impact | Mitigation |
|--------|------------|--------|------------|
| Personne ne paye apres le gratuit | Moyen | Critique | Gratuit suffisamment frustrant (logo flou, pas de PDF). 5 000 FCFA = prix accessible |
| Trop de gratuits, pas assez de payants | Faible | Eleve | Cap a 100 gratuits. Jauge visible. FOMO |
| Abus IA (un user regenere 100 fois) | Moyen | Modere | Rate limiting + tracking par user |
| Cout Anthropic augmente | Faible | Modere | Fallback Haiku ou OpenAI. Config admin |
| Paiement mobile money echoue souvent | Moyen | Modere | Support multiple (Wave + OM + Stripe). Retry automatique |
| Concurrent copie le concept | Faible | Faible | First mover advantage + communaute |
| Reglementation donnees | Faible | Modere | CGU OHADA deja generees. Conformite ARTCI |
| Serveur tombe en panne | Faible | Eleve | Hosting managed (Railway/Vercel). Pas de self-hosting |
| **Manque de motivation** (toi) | **Eleve** | **Critique** | **Compteur de revenus visible. Objectifs mensuels clairs. Premier client = dopamine** |

---

## 12. RESUME EXECUTIF

### La realite en 10 phrases

1. L'application est a 85-90% terminee. Il manque le systeme de paiement et le controle d'acces par plan.

2. Le cout IA reel est de **56 FCFA par projet gratuit** (apres optimisations) et **360 FCFA par projet complet**. Ce n'est pas l'IA qui va te ruiner.

3. L'infrastructure coute **25 000 FCFA/mois** (pas 65 000 comme souvent cite). Avec les free tiers, c'est tenable.

4. **100 places gratuites couvrent la phase d'acquisition** pour un cout total IA de 5 600 FCFA. C'est le prix de 2 repas a Abidjan.

5. Le forfait Starter a **5 000 FCFA** est un prix psychologiquement accessible avec une marge de 93%. Il faut **5 Starters pour couvrir l'infra mensuelle**.

6. Le forfait Pro a **35 000 FCFA/an** est le vrai moteur de revenus recurrents. **28 Pro couvrent 12 mois de fonctionnement**.

7. Le systeme de parrainage transforme chaque utilisateur en vendeur. Un porteur qui parraine 5 amis Starters gagne son propre forfait gratuitement.

8. Les partenariats incubateurs (500 000 FCFA/an) et les services de dev externalise (800 000+ FCFA/projet) sont les accelerateurs reels.

9. Tout doit etre configurable depuis l'admin : prix, limites, places gratuites, budgets IA, parrainage.

10. **Si tu implementes le paiement cette semaine et ouvres les 100 places gratuites la semaine prochaine, tu peux etre rentable au mois 3.**

### Les 3 actions cette semaine

1. **Integrer CinetPay** (Wave CI + Orange Money) — c'est le seul bloquant reel
2. **Ajouter la table subscriptions + middleware plan** — pour bloquer les features payantes
3. **Lancer les 100 inscriptions gratuites** — la premiere source de conversion

### Chiffre cle a retenir

**5 ventes Starter par mois = survie.
2 ventes Pro par mois = croissance.
1 projet dev externalise par trimestre = confort.**

Tu n'as pas besoin de milliers d'utilisateurs. Tu as besoin de 5 vrais clients.
