# Dashboard Startup V2 — Documentation d'Implémentation
> ivoire.io — 21 mars 2026

---

## 1. RÉSUMÉ DE L'IMPLÉMENTATION

### Fichiers créés (12 nouveaux)

| Fichier | Description |
|---|---|
| `lib/ai/openai.ts` | Provider OpenAI GPT-5-4-mini — fonctions IA (taglines, descriptions, classification, interview, personas, noms) |
| `lib/ai/score.ts` | Algorithme de score de complétude projet (5 catégories pondérées) |
| `components/dashboard/project-builder-tab.tsx` | Composant Project Builder complet — 3 modes (A/B/C) avec 4 étapes chacun |
| `api/project-builder/generate/route.ts` | API génération IA (tagline, description, personas, noms, problème) |
| `api/project-builder/interview/route.ts` | API analyse de réponse d'entretien IA |
| `api/project-builder/improve/route.ts` | API amélioration de texte existant |
| `api/project-builder/classify/route.ts` | API classification automatique de fichiers |
| `api/project-builder/score/route.ts` | API calcul du score projet |

### Fichiers modifiés (6)

| Fichier | Modifications |
|---|---|
| `dashboard-shell.tsx` | Ajout tab "Project Builder" + badge "NEW" dans sidebar startup, nouveau type Tab, import ProjectBuilderTab |
| `overview-tab.tsx` | Ajout Score Projet (barre de progression + catégories), CTA Project Builder, actions rapides adaptatives (startup vs dev) |
| `startup-tab.tsx` | Boutons IA (Sparkles/Wand2) sur tagline, description, problème — amélioration via GPT-5-4-mini. Largeur étendue à max-w-4xl |
| `team-tab.tsx` | Remplacement complet — CRUD équipe fonctionnel (ajout/modif/suppression membres via Sheet) avec grille responsive |
| `products-tab.tsx` | Remplacement complet — CRUD produits fonctionnel (nom, description, tech stack, liens, catégorie, votes) |
| `fundraising-tab.tsx` | Remplacement complet — Tracker de levée de fonds (statut, investisseurs, documents, barre de progression animée) |

---

## 2. DÉTAIL DES FONCTIONNALITÉS

### 2.1 Project Builder — 3 Modes

#### Mode A — Upload & Intégration
- **Étape 1** : Upload drag & drop + classification IA automatique (logo, pitch deck, business plan, etc.)
- **Étape 2** : Audit IA avec scores par catégorie (identité, vision, technique, financier)
- **Étape 3** : Détection des gaps prioritaires avec boutons "Générer IA"
- **Étape 4** : Récapitulatif final + téléchargement du dossier

#### Mode B — Construction guidée
- **Étape 1** : Entretien de découverte IA (8 questions) — interface chat immersive avec avatar bot/user
- **Étape 2** : Upload des éléments existants (logo, notes, domaine, photos)
- **Étape 3** : Génération & validation de chaque document
- **Étape 4** : Projet finalisé + horodatage

#### Mode C — Génération complète
- **Étape 1** : Saisie libre de l'idée + secteur + pays
- **Étape 2** : Génération progressive (11 éléments) avec barre de progression animée
- **Étape 3** : Vérifications légales (OAPI, RCCM, domaines .ci/.io/.com)
- **Étape 4** : Projet prêt + téléchargements + prochaines étapes

### 2.2 Score de complétude

| Catégorie | Poids | Éléments évalués |
|---|:---:|---|
| Identité | 25% | Nom, tagline, logo, domaine, description courte |
| Vision | 25% | Problème, solution, personas, concurrents, modèle éco |
| Technique | 20% | Cahier des charges, MVP défini, stack, roadmap |
| Financier | 20% | Business plan, prévisionnel, one-pager |
| Protection | 10% | Horodatage, OAPI, CGU |

**Seuils** : Rouge (0-30%) → Orange (31-59%) → Jaune (60-79%) → Vert clair (80-94%) → Vert (95-100%)

### 2.3 Intégration IA

| Fonction | Provider | Modèle |
|---|---|---|
| Taglines (3 suggestions) | OpenAI | gpt-5-4-mini |
| Description courte | OpenAI | gpt-5-4-mini |
| Suggestion de problème | OpenAI | gpt-5-4-mini |
| Noms de projet (5) | OpenAI | gpt-5-4-mini |
| Classification fichiers | OpenAI | gpt-5-4-mini |
| Analyse interview | OpenAI | gpt-5-4-mini |
| Amélioration texte | OpenAI | gpt-5-4-mini |
| Personas cibles (3) | OpenAI | gpt-5-4-mini |
| Description longue | OpenAI | gpt-5-4-mini |

**System prompt** : Contexte Côte d'Ivoire, OHADA, FCFA, Mobile Money, CEDEAO intégré dans chaque appel.

### 2.4 Tabs fonctionnels (ex-placeholders)

#### Équipe
- Grille responsive (1/2/3 colonnes)
- CRUD membres : nom, rôle, email, LinkedIn, profil ivoire.io
- Sheet slide-over pour ajout/modification
- Dialog de confirmation pour suppression
- 4 membres mock pour démo

#### Produits
- Grille responsive (1/2 colonnes)
- CRUD produits : nom, description, catégorie, tech stack, liens, votes, date
- Categories : App mobile, API, SaaS, Autre
- Publication toggle pour startups.ivoire.io
- 2 produits mock pour démo

#### Levée de fonds
- Statut de levée (Oui/Non/Ne pas afficher)
- Type de levée : Pré-seed → Série B+
- Barre de progression animée avec montant visé/levé
- CRUD investisseurs : nom, montant, statut (Confirmé/En négociation/Refusé)
- Section documents (Pitch deck, Business plan, One-pager)
- Privacy notices

---

## 3. DESIGN — PRINCIPES APPLIQUÉS

- **Full-screen** : Suppression de toutes les contraintes `max-w-2xl`, utilisation de `w-full` et `max-w-4xl`/`max-w-5xl`
- **Design system** : Utilisation cohérente de `var(--color-orange)`, `var(--color-surface)`, `var(--color-border)`
- **Immersif** : Cartes avec bordures subtiles, hover states avec shadow, transitions fluides, badges de statut
- **Responsive** : Grilles adaptatives (1→2→3→4 colonnes selon le viewport)
- **Thème** : Support dark/light mode via next-themes
- **Toast** : Notifications sonner pour chaque action CRUD

---

## 4. VARIABLES D'ENVIRONNEMENT REQUISES

```env
# OpenAI (requis pour le Project Builder)
OPENAI_API_KEY=sk-...

# Optionnel — override du modèle par défaut
OPENAI_MODEL_TEXT_SHORT=gpt-5-4-mini
```

---

## 5. SUGGESTIONS & AMÉLIORATIONS

### Priorité haute

1. **Persistance des données Équipe/Produits/Levée de fonds**
   - Actuellement client-side uniquement (mock data)
   - Créer les tables Supabase : `ivoireio_team_members`, `ivoireio_products`, `ivoireio_fundraising`
   - Ajouter les API routes CRUD correspondantes

2. **Intégration Claude Sonnet 4.6 pour les documents longs**
   - Le Project Builder utilise actuellement GPT-5-4-mini pour tout
   - La spec prévoit Claude Sonnet 4.6 pour : pitch deck, cahier des charges, business plan, analyse concurrents
   - Ajouter le SDK Anthropic et le routing par type de tâche

3. **Intégration crun.ai/nanobanana pro pour la génération de logos**
   - Actuellement non implémenté
   - Connecter l'API crun.ai pour les 3 propositions de logo (SVG + PNG)

4. **Export PDF réel**
   - Les boutons de téléchargement (Pitch deck PDF, One-pager, Cahier des charges) sont des placeholders
   - Implémenter via Puppeteer ou un service de rendu PDF côté serveur

### Priorité moyenne

5. **Horodatage cryptographique**
   - SHA-256 du projet finalisé → enregistrement en base + certificat PDF
   - La spec est détaillée, il faut l'implémenter

6. **Vérification de domaine WHOIS**
   - Actuellement simulé (domaines .ci/.io/.com avec statuts mockés)
   - Intégrer l'API WHOIS pour des vérifications réelles

7. **Vérification OAPI / RCCM**
   - Actuellement simulé
   - Implémenter via web search (Claude + web_search) pour vérifier la disponibilité du nom

8. **Jobs Tab — Connecter aux données réelles**
   - Actuellement en mock data
   - Créer la table `ivoireio_job_listings` et connecter

### Priorité basse

9. **Paiement Premium**
   - Plusieurs tabs mentionnent le plan Premium (5 000 FCFA/mois)
   - Intégrer un système de paiement (Stripe ou Mobile Money via PayDunya/CinetPay)

10. **Voice input dans l'entretien (Mode B)**
    - La spec mentionne Web Speech API pour l'oral
    - Ajouter un bouton micro avec transcription en temps réel

11. **Admin — Configuration Providers IA**
    - La spec prévoit une page admin pour configurer les providers sans déploiement
    - À créer dans le dashboard admin existant

12. **Configuration admin Project Builder**
    - Dashboard admin pour gérer les providers IA, budgets, logs, coûts
    - Routing dynamique des tâches IA

---

## 6. ARCHITECTURE DES FICHIERS

```
app/src/
├── app/
│   └── api/
│       └── project-builder/
│           ├── generate/route.ts     ← Génération IA
│           ├── interview/route.ts    ← Analyse entretien
│           ├── improve/route.ts      ← Amélioration texte
│           ├── classify/route.ts     ← Classification fichiers
│           └── score/route.ts        ← Calcul score projet
├── components/
│   └── dashboard/
│       ├── project-builder-tab.tsx   ← Composant principal (3 modes × 4 étapes)
│       ├── dashboard-shell.tsx       ← Shell mis à jour (sidebar + routing)
│       ├── overview-tab.tsx          ← Score projet + CTA adaptatif
│       ├── startup-tab.tsx           ← Boutons IA sur tagline/description/problème
│       ├── team-tab.tsx              ← CRUD équipe (full)
│       ├── products-tab.tsx          ← CRUD produits (full)
│       └── fundraising-tab.tsx       ← Tracker levée de fonds (full)
└── lib/
    └── ai/
        ├── openai.ts                 ← Provider OpenAI GPT-5-4-mini
        └── score.ts                  ← Algorithme de score projet
```

---

## 7. ÉTAT DU BUILD

- **TypeScript** : 0 nouvelles erreurs (1 erreur pré-existante dans les tests, non liée)
- **Dépendances ajoutées** : `openai` (SDK officiel)
- **Compatibilité** : Next.js 16.1.6, React 19.2.3, Tailwind CSS v4, shadcn/ui v4.0.7
