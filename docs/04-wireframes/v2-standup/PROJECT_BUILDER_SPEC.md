# 📘 PROJECT BUILDER — Spécification Fonctionnelle
> Module ivoire.io — Version 1.0 — 21 mars 2026

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble du module](#1-vue-densemble-du-module)
2. [Architecture IA — Providers & Routing](#2-architecture-ia--providers--routing)
3. [Fonctionnalités détaillées par étape](#3-fonctionnalités-détaillées-par-étape)
4. [Champs & données collectées](#4-champs--données-collectées)
5. [Documents générés — Specs complètes](#5-documents-générés--specs-complètes)
6. [Score de complétude — Algorithme](#6-score-de-complétude--algorithme)
7. [Horodatage & protection](#7-horodatage--protection)
8. [Configuration admin — Gestion des providers](#8-configuration-admin--gestion-des-providers)

---

## 1. Vue d'ensemble du module

### Rôle
Le Project Builder est le **point d'entrée de la plateforme ivoire.io**. Il précède l'accès au dashboard complet et a pour mission de transformer n'importe quel porteur — qu'il ait une idée brute ou un dossier complet — en un projet structuré, présentable et protégé.

### Résultat garanti à la sortie
Quel que soit le mode choisi, le porteur repart avec :
- Un nom de projet validé (vérification OAPI + réseaux sociaux)
- Un nom de domaine vérifié (.ci, .io, .africa, .com)
- Un logo en haute résolution (PNG 512px + SVG vectoriel)
- Une description courte (150 car.) et longue (1 000 car.)
- Un pitch deck 10 slides
- Une analyse de concurrents (CI + monde)
- Un horodatage certifié ivoire.io (preuve de création datée)
- Un score de complétude du dossier projet

### Trois modes d'entrée

| Mode | Profil porteur | Durée estimée |
|---|---|---|
| A — Upload & Intégration | Il a déjà logo, pitch, domaine, documents | 5–10 min |
| B — Construction guidée | Il a l'idée + quelques éléments partiels | 15–25 min |
| C — Génération complète | Il a juste une idée en tête | 10–15 min (dont 2–3 min de génération IA) |

---

## 2. Architecture IA — Providers & Routing

### Principe de routing
Les providers IA sont configurés depuis le **dashboard admin ivoire.io**. Chaque tâche est assignée à un provider selon le meilleur rapport qualité/coût/spécialisation. Le routing est modifiable à tout moment sans changer le code applicatif.

### Providers intégrés (mars 2026)

#### 🎨 Génération de logos — nanobanana pro via crun.ai
- **Provider** : nanobanana pro
- **Endpoint** : `https://crun.ai/` (API propriétaire)
- **Usage** : Génération de logos, icônes, chartes graphiques
- **Format de sortie** : PNG 512px × 512px + SVG vectoriel
- **Nombre de propositions** : 3 par défaut (configurable admin : 1–6)
- **Input** : nom du projet + secteur + couleurs souhaitées + style
- **Prompt type** :
  ```
  Create a professional logo for a startup named "{project_name}"
  in the {sector} sector targeting {country}.
  Style: {style_preference} (modern / minimal / bold / tech)
  Colors: {color_preferences}
  Output: transparent background, SVG + PNG 512px
  ```
- **Particularité** : Adapté pour les noms en langues africaines et les projets CI

#### 📝 Génération de textes — GPT-4o mini (OpenAI)
- **Modèle** : `gpt-4o-mini` (mai 2024, toujours actif mars 2026)
- **Usage prioritaire** : Volumes importants, textes courts, suggestions rapides
  - Taglines et slogans (multiple propositions)
  - Descriptions courtes (150 car.)
  - Personas cibles (format carte)
  - Questions de l'entretien de découverte
  - Classification automatique des fichiers uploadés
  - Suggestions de noms de projet (5 alternatives)
- **Avantage** : Coût très bas (~$0.00015/1K tokens input), idéal pour les générations multiples
- **Contexte ivoire.io** : Instructions système incluent toujours le contexte Afrique de l'Ouest + OHADA + Côte d'Ivoire

#### 📄 Génération de documents qualité — Claude Sonnet 4.6 (Anthropic)
- **Modèle** : `claude-sonnet-4-6` (mars 2026)
- **Usage prioritaire** : Documents longs nécessitant cohérence et qualité
  - Pitch deck complet (contenu des 10 slides)
  - Cahier des charges technique
  - Business plan structuré
  - Analyse de concurrents argumentée
  - Prévisionnel financier commenté
  - One-pager exécutif
  - Description longue du projet (1 000 car.)
  - CGU et politique de confidentialité (template adapté OHADA)
  - Reformulation et amélioration de textes existants
- **Avantage** : Meilleure cohérence sur les longs documents, raisonnement structuré
- **Contexte** : System prompt spécifique incluant droit OHADA, marché CI, réalités économiques ivoiriennes

#### 🔍 Recherche web & vérifications — Claude Sonnet 4.6 avec web_search
- **Usage** :
  - Analyse concurrents (recherche live marché CI + international)
  - Vérification de disponibilité nom (OAPI, RCCM, réseaux sociaux)
  - Veille sectorielle (tendances marché)
  - Identification de risques légaux ou IP
- **Source de données** : Web search en temps réel (données fraîches au 21 mars 2026 et au-delà)

### Tableau de routing par fonctionnalité

| Fonctionnalité | Provider | Modèle | Justification |
|---|---|---|---|
| Génération logo | crun.ai | nanobanana pro | Spécialisé image/logo |
| Tagline (3 propositions) | OpenAI | gpt-4o-mini | Coût bas, volume |
| Description courte | OpenAI | gpt-4o-mini | Texte court, rapide |
| Description longue | Anthropic | claude-sonnet-4-6 | Cohérence, qualité |
| Questions entretien IA | OpenAI | gpt-4o-mini | Dynamique, conversationnel |
| Analyse réponses entretien | Anthropic | claude-sonnet-4-6 | Compréhension profonde |
| Pitch deck (contenu) | Anthropic | claude-sonnet-4-6 | Document long structuré |
| Cahier des charges | Anthropic | claude-sonnet-4-6 | Technique, précis |
| Business plan | Anthropic | claude-sonnet-4-6 | Long, structuré |
| Personas cibles | OpenAI | gpt-4o-mini | Format carte, rapide |
| Analyse concurrents | Anthropic + web | claude-sonnet-4-6 | Recherche live + analyse |
| Vérif. nom OAPI/RCCM | Anthropic + web | claude-sonnet-4-6 | Recherche live |
| Vérif. disponibilité domaine | API WHOIS | — | API dédiée (pas IA) |
| Classification fichiers | OpenAI | gpt-4o-mini | Classification simple |
| Amélioration texte existant | Anthropic | claude-sonnet-4-6 | Réécriture qualité |
| CGU / mentions légales | Anthropic | claude-sonnet-4-6 | Précision légale |
| Roadmap 12 mois | Anthropic | claude-sonnet-4-6 | Structuré, cohérent |
| Suggestions noms projet | OpenAI | gpt-4o-mini | Multiples options, rapide |
| One-pager | Anthropic | claude-sonnet-4-6 | Synthèse qualité |

### Fallback & résilience
- Si un provider est indisponible, le système bascule automatiquement sur le provider de secours configuré en admin
- Les générations sont mises en cache 24h (évite les doubles facturations sur régénération à l'identique)
- Un log de chaque appel IA est conservé en base (provider, modèle, tokens, coût estimé, timestamp)

---

## 3. Fonctionnalités détaillées par étape

### MODE A — Étape 1 : Upload & Classification

**Ce que fait le système :**
1. Accepte les fichiers en drag & drop ou sélection (PDF, DOCX, PNG, JPG, SVG, MP4, ZIP, TXT, XLS)
2. Analyse le nom du fichier et son contenu (OCR léger pour les PDF) via gpt-4o-mini
3. Classe automatiquement dans une catégorie : Logo / Pitch deck / Business plan / Cahier des charges / Charte / Équipe / Autre
4. Affiche la classification avec possibilité de correction manuelle
5. Détecte et extrait le nom de domaine s'il est mentionné dans les fichiers

**Règles de classification IA (prompt) :**
```
Analyse ce fichier et classe-le dans l'une des catégories suivantes :
logo | pitch_deck | business_plan | cahier_charges | charte_graphique
| document_equipe | analyse_marche | document_juridique | autre

Réponds uniquement en JSON : {"category": "...", "confidence": 0.0-1.0, "reason": "..."}
```

---

### MODE A — Étape 2 : Audit IA

**Ce que fait le système :**
1. Parcourt tous les fichiers classifiés
2. Pour chaque catégorie de document, évalue la présence et la complétude
3. Génère un score par catégorie (0–100%) et un score global
4. Lance en parallèle une analyse de concurrents (web search)
5. Identifie les gaps prioritaires selon la matrice Niveau 1–4

**Structure du rapport d'audit (JSON interne) :**
```json
{
  "identity": {
    "score": 90,
    "items": {
      "logo": true,
      "tagline": false,
      "charte": true,
      "nom_domaine": "à vérifier"
    }
  },
  "vision": {
    "score": 55,
    "items": {
      "pitch_deck": true,
      "personas": false,
      "concurrents": false,
      "modele_economique": "partiel"
    }
  },
  "technique": { "score": 30, ... },
  "financier": { "score": 70, ... },
  "global_score": 61,
  "gaps_prioritaires": ["tagline", "personas", "cahier_charges", "concurrents"]
}
```

---

### MODE B — Étape 1 : Entretien de découverte IA

**8 questions posées par l'IA (gpt-4o-mini) :**

| # | Question | Donnée extraite |
|---|---|---|
| 1 | Quel problème concret ton projet résout-il ? | `problem_statement` |
| 2 | Qui est exactement la personne qui a ce problème ? | `target_persona` |
| 3 | Comment ton projet résout ce problème ? | `solution` |
| 4 | Comment tu comptes gagner de l'argent ? | `business_model` |
| 5 | Qui fait déjà quelque chose de similaire ? | `known_competitors` |
| 6 | Qui es-tu ? Quelle est ton expérience dans ce domaine ? | `founder_profile` |
| 7 | De quoi as-tu besoin pour avancer ? | `current_needs` |
| 8 | As-tu déjà un nom, un domaine, une idée de logo ? | `existing_assets` |

**Comportement de l'IA :**
- L'IA reformule les réponses et demande confirmation avant de passer à la question suivante
- Si une réponse est trop vague, elle relance avec une question de précision
- L'entretien peut se faire à l'oral (Web Speech API) ou à l'écrit
- À la fin, l'IA génère un résumé structuré soumis à validation avant génération

---

### MODE C — Étape 2 : Génération complète

**Ordre de génération (pour afficher la progression en temps réel) :**

1. Nom du projet (5 alternatives) — gpt-4o-mini — ~3 sec
2. Tagline (3 alternatives) — gpt-4o-mini — ~2 sec
3. Description courte — gpt-4o-mini — ~3 sec
4. Description longue — claude-sonnet-4-6 — ~8 sec
5. Personas cibles (3 profils) — gpt-4o-mini — ~5 sec
6. Modèle économique — claude-sonnet-4-6 — ~6 sec
7. Analyse concurrents (web search) — claude-sonnet-4-6 — ~15 sec
8. Logo (3 propositions) — nanobanana pro via crun.ai — ~20 sec
9. Pitch deck (10 slides) — claude-sonnet-4-6 — ~20 sec
10. Cahier des charges — claude-sonnet-4-6 — ~25 sec
11. Roadmap 12 mois — claude-sonnet-4-6 — ~10 sec
12. Vérification domaine (WHOIS API) — ~2 sec
13. Vérification OAPI / RCCM (web search) — claude-sonnet-4-6 — ~10 sec

**Total estimé : 2–3 minutes** (parallélisation des étapes indépendantes)

---

## 4. Champs & données collectées

### Données projet (table `projects`)

| Champ | Type | Source | Obligatoire |
|---|---|---|---|
| `project_id` | UUID | Système | Auto |
| `user_id` | UUID | Auth | Auto |
| `mode` | ENUM (A/B/C) | Porteur | ✅ |
| `name` | VARCHAR(100) | Porteur / IA | ✅ |
| `tagline` | VARCHAR(80) | Porteur / IA | ✅ |
| `description_short` | VARCHAR(150) | Porteur / IA | ✅ |
| `description_long` | TEXT (1 000 car.) | Porteur / IA | ✅ |
| `sector` | ENUM | Porteur | ✅ |
| `country_target` | VARCHAR[] | Porteur | ✅ |
| `problem_statement` | TEXT | Porteur / IA | ✅ |
| `solution` | TEXT | Porteur / IA | ✅ |
| `business_model` | TEXT | Porteur / IA | ⚠️ Recommandé |
| `target_personas` | JSON[] | IA | ⚠️ Recommandé |
| `domain_name` | VARCHAR(255) | Porteur / IA | ⚠️ Recommandé |
| `domain_status` | ENUM (available/taken/reserved) | Système | Auto |
| `logo_url` | VARCHAR | IA / Upload | ✅ |
| `logo_svg_url` | VARCHAR | IA | ⚠️ Recommandé |
| `color_primary` | HEX | IA / Porteur | ⚠️ Recommandé |
| `color_secondary` | HEX | IA / Porteur | ⚠️ Recommandé |
| `competitors` | JSON[] | IA | ⚠️ Recommandé |
| `oapi_status` | ENUM | Système | Auto |
| `score_global` | INT (0–100) | Système | Auto |
| `score_identity` | INT (0–100) | Système | Auto |
| `score_vision` | INT (0–100) | Système | Auto |
| `score_technique` | INT (0–100) | Système | Auto |
| `score_financier` | INT (0–100) | Système | Auto |
| `timestamp_hash` | VARCHAR | Système | Auto (horodatage) |
| `created_at` | TIMESTAMP | Système | Auto |
| `finalized_at` | TIMESTAMP | Système | Auto |

### Données documents (table `project_documents`)

| Champ | Type | Valeurs |
|---|---|---|
| `document_id` | UUID | Auto |
| `project_id` | UUID | Ref |
| `type` | ENUM | pitch_deck / cahier_charges / business_plan / one_pager / analyse_concurrents / logo / charte / roadmap / previsionnel / cgu / statuts |
| `source` | ENUM | uploaded / generated_ai / co_built |
| `provider` | VARCHAR | crun_ai / openai / anthropic / upload |
| `model` | VARCHAR | nanobanana-pro / gpt-4o-mini / claude-sonnet-4-6 |
| `file_url` | VARCHAR | URL stockage |
| `file_format` | VARCHAR | PDF / DOCX / PNG / SVG / XLSX |
| `generated_at` | TIMESTAMP | Auto |
| `tokens_used` | INT | Pour facturation interne |
| `validated_by_user` | BOOLEAN | Validation porteur |

---

## 5. Documents générés — Specs complètes

### Pitch deck — 10 slides (claude-sonnet-4-6)

**Structure imposée :**

| Slide | Titre | Contenu généré |
|---|---|---|
| 1 | Couverture | Nom + logo + tagline + date |
| 2 | Le problème | Problem statement en 3 points max + statistiques marché CI |
| 3 | Notre solution | Description solution + différenciateur clé |
| 4 | Démonstration | Mockup / screenshot du produit (placeholder si absent) |
| 5 | Marché adressable | TAM / SAM / SOM estimés pour le marché CI et régional |
| 6 | Modèle économique | Comment on gagne de l'argent — flux de revenus |
| 7 | Concurrents | Tableau comparatif 3–5 concurrents vs notre solution |
| 8 | Équipe | Fondateurs + compétences clés |
| 9 | Traction | Métriques actuelles ou plan de lancement si pré-traction |
| 10 | Ask investisseur | Montant recherché + utilisation des fonds + contact |

**Output** : Contenu structuré JSON → rendu en PDF via template ivoire.io (Puppeteer)

---

### Cahier des charges (claude-sonnet-4-6)

**Sections générées :**

1. Contexte et objectifs du projet
2. Périmètre fonctionnel (liste des fonctionnalités MVP)
3. Périmètre non-fonctionnel (performance, sécurité, accessibilité)
4. Architecture technique recommandée (stack proposé selon le secteur)
5. Maquettes fonctionnelles (description textuelle des écrans principaux)
6. Contraintes spécifiques (offline, mobile-first, paiements Mobile Money CI)
7. Planning de développement estimé (phases + durées)
8. Budget de développement indicatif en FCFA et EUR

**Output** : DOCX structuré avec styles ivoire.io

---

### Analyse concurrents (claude-sonnet-4-6 + web search)

**Structure :**

1. Contexte du marché (CI + Afrique de l'Ouest + global)
2. Tableau comparatif (nom / pays / modèle / forces / faiblesses / tarif)
3. Analyse des opportunités de différenciation
4. Risques concurrentiels identifiés
5. Recommandations stratégiques

**Sources consultées en temps réel :**
- Sites officiels des concurrents identifiés
- Crunchbase Africa (startups levées de fonds)
- Appstores (ratings, téléchargements)
- LinkedIn (taille des équipes)
- Rapports sectoriels publics (GSMA, Partech Africa, etc.)

---

### Logo — nanobanana pro via crun.ai

**Input envoyé à l'API :**
```json
{
  "project_name": "StockFacile",
  "sector": "e-commerce",
  "country": "Côte d'Ivoire",
  "style": "modern-minimal",
  "colors": ["primary", "secondary"],
  "background": "transparent",
  "variations": 3,
  "output_formats": ["svg", "png_512", "png_192", "png_64"]
}
```

**Output attendu :**
- 3 propositions logo (SVG + PNG multi-tailles)
- Pour chaque proposition : palette de couleurs extraite automatiquement
- Le porteur choisit, peut demander des variantes, ou uploader son propre logo

---

## 6. Score de complétude — Algorithme

### Pondération par catégorie

| Catégorie | Poids global | Éléments |
|---|:---:|---|
| Identité | 25% | Nom(5) + Tagline(5) + Logo(8) + Domaine(5) + Description courte(2) |
| Vision | 25% | Problème(5) + Solution(5) + Personas(5) + Concurrents(5) + Modèle éco(5) |
| Technique | 20% | Cahier des charges(10) + MVP défini(5) + Stack(3) + Roadmap(2) |
| Financier | 20% | Business plan(8) + Prévisionnel(7) + One-pager(5) |
| Protection | 10% | Horodatage(5) + OAPI(3) + CGU(2) |

### Calcul
```
score_categorie = Σ(points_element_present) / Σ(points_element_total) × 100
score_global = Σ(score_categorie × poids_categorie)
```

### Seuils d'affichage

| Score | Statut affiché | Couleur | CTA |
|---|---|---|---|
| 0–30% | Démarrage | Rouge | "Lance le Project Builder" |
| 31–59% | En construction | Orange | "Continue le Project Builder" |
| 60–79% | Presque prêt | Jaune | "Quelques éléments manquants" |
| 80–94% | Prêt | Vert clair | "Visible pour les investisseurs" |
| 95–100% | Complet | Vert | "Dossier complet ✅" |

---

## 7. Horodatage & protection

### Principe
À la finalisation du Project Builder, le système génère une **empreinte cryptographique** du dossier projet. C'est une preuve datée que ce projet existait sous cette forme à ce moment précis.

### Mécanisme technique

```
1. Collecte des données projet au moment de la finalisation
2. Sérialisation JSON canonique (tri alphabétique des clés)
3. Hachage SHA-256 du JSON sérialisé
4. Enregistrement en base : { hash, timestamp_utc, project_id, user_id }
5. Génération d'un certificat PDF téléchargeable (optionnel)
```

### Ce que ça prouve
- Que le porteur a décrit ce projet à ivoire.io à cette date précise
- Que le contenu (nom, description, logo, documents) était tel que décrit
- Cela ne remplace pas un dépôt légal (OAPI, RCCM) mais constitue une preuve de bonne foi datée

### Affichage porteur
```
🔒 Projet horodaté le 21 mars 2026 à 14:32 UTC
   Hash : sha256:3f2a8c...d91e
   [ 📄 Télécharger le certificat ]
```

---

## 8. Configuration admin — Gestion des providers

### Interface dashboard admin

Le dashboard admin d'ivoire.io expose une page **"Providers IA"** qui permet de configurer le routing sans déploiement.

```
┌──────────────────────────────────────────────────────────────┐
│  Admin — Configuration Providers IA                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── PROVIDER : TEXTE COURT ─────────────────────────┐   │
│  │  Provider actif   [ OpenAI ▾ ]                      │   │
│  │  Modèle           [ gpt-4o-mini ▾ ]                 │   │
│  │  Fallback         [ claude-sonnet-4-6 ▾ ]           │   │
│  │  Clé API          [••••••••••••••••••]  [ Tester ]  │   │
│  │  Budget max/mois  [ 50 USD ]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──── PROVIDER : TEXTE LONG / DOCUMENTS ─────────────┐    │
│  │  Provider actif   [ Anthropic ▾ ]                   │    │
│  │  Modèle           [ claude-sonnet-4-6 ▾ ]           │    │
│  │  Fallback         [ OpenAI — gpt-4o-mini ▾ ]        │    │
│  │  Clé API          [••••••••••••••••••]  [ Tester ]  │    │
│  │  Budget max/mois  [ 200 USD ]                       │    │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──── PROVIDER : IMAGES / LOGOS ──────────────────────┐   │
│  │  Provider actif   [ crun.ai ▾ ]                     │   │
│  │  Modèle           [ nanobanana-pro ▾ ]              │   │
│  │  Fallback         [ Aucun — désactiver si KO ]      │   │
│  │  Clé API          [••••••••••••••••••]  [ Tester ]  │   │
│  │  Logos / mois     [ 500 ]  (limite volume)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──── PROVIDER : RECHERCHE WEB ───────────────────────┐   │
│  │  Provider actif   [ Anthropic + web_search ▾ ]      │   │
│  │  Modèle           [ claude-sonnet-4-6 ▾ ]           │   │
│  │  Recherches / jour [ 1 000 ]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──── LOGS & COÛTS ───────────────────────────────────┐   │
│  │  Ce mois : 127 USD dépensés / 450 USD budget        │   │
│  │  Appels IA : 4 832  |  Erreurs : 12  |  Cache : 38% │   │
│  │  [ 📊 Voir rapport détaillé ]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│                    [ 💾 Enregistrer la configuration ]       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Variables d'environnement requises

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL_TEXT_SHORT=gpt-4o-mini
OPENAI_MODEL_TEXT_LONG=gpt-4o-mini

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL_DOCUMENTS=claude-sonnet-4-6
ANTHROPIC_MODEL_SEARCH=claude-sonnet-4-6

# crun.ai (nanobanana pro)
CRUN_API_KEY=...
CRUN_API_URL=https://crun.ai/
CRUN_MODEL=nanobanana-pro

# WHOIS (vérification domaine)
WHOIS_API_KEY=...
WHOIS_API_URL=https://api.whoisjson.com/v1/

# Stockage fichiers
S3_BUCKET=ivoire-io-projects
S3_REGION=eu-west-1
```

### Routing dynamique (pseudocode)

```typescript
async function getAIProvider(task: AITask): Promise<AIProvider> {
  const config = await AdminConfig.getProviders();

  const routing: Record<AITask, string> = {
    text_short:     config.text_short.active,   // gpt-4o-mini
    text_long:      config.text_long.active,    // claude-sonnet-4-6
    image_logo:     config.image.active,        // nanobanana-pro via crun.ai
    web_search:     config.search.active,       // claude-sonnet-4-6
    classification: config.text_short.active,  // gpt-4o-mini
  };

  return buildProvider(routing[task], config);
}
```

---

## ANNEXE — Contexte système IA (system prompts de base)

### Contexte commun injecté dans tous les appels

```
Tu es un assistant spécialisé dans l'accompagnement de startups
en Côte d'Ivoire et en Afrique de l'Ouest.

Contexte :
- Plateforme : ivoire.io (écosystème startup ivoirien)
- Droit applicable : OHADA (Organisation pour l'Harmonisation
  du Droit des Affaires en Afrique)
- Monnaies : FCFA (XOF) en priorité, USD/EUR en secondaire
- Paiements locaux : Mobile Money (Orange Money, Wave, MTN MoMo)
- Langues : Français (principal), Dioula, Baoulé (à connaître)
- Marché cible primaire : Abidjan, puis Côte d'Ivoire entière,
  puis CEDEAO
- Réalités locales : fort taux de non-bancarisation (60%+),
  pénétration mobile élevée (85%+), marché majoritairement informel

Ton rôle : générer des contenus adaptés à cette réalité,
pas des copies de modèles occidentaux transposés.
```
