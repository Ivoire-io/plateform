# 🇨🇮 VISION 100% — ivoire.io : L'OS Digital de la Côte d'Ivoire

> **Tout faire de A à Z sans sortir de la plateforme.**  
> Ce document spécifie CHAQUE portail, CHAQUE page, CHAQUE fonctionnalité.  
> Simple. Minimaliste. Intuitif. Répond aux préoccupations réelles.  
> **Mis à jour** : 14 mars 2026

---

## TABLE DES MATIÈRES

1. [Architecture complète des portails](#1-architecture-complète-des-portails)
2. [ivoire.io — Landing page](#2-ivoireio--landing-page-accueil)
3. [devs.ivoire.io — Annuaire talents](#3-devsivoireio--annuaire-talents)
4. [slug.ivoire.io — Portfolios & Vitrines](#4-slugivoireio--portfolios--vitrines)
5. [startups.ivoire.io — Product Hunt local](#5-startupsivoireio--product-hunt-local)
6. [jobs.ivoire.io — Emploi & Freelance](#6-jobsivoireio--emploi--freelance)
7. [learn.ivoire.io — Éducation & Compétences](#7-learnivoireio--éducation--compétences)
8. [events.ivoire.io — Événements tech](#8-eventsivoireio--événements-tech)
9. [health.ivoire.io — S.O.S Santé](#9-healthivoireio--sos-santé)
10. [invest.ivoire.io — Investissement](#10-investivoireio--investissement)
11. [data.ivoire.io — Open Data & API](#11-dataivoireio--open-data--api)
12. [blog.ivoire.io — Blog & Contenus](#12-blogivoireio--blog--contenus)
13. [Système d'authentification Ivoire ID](#13-ivoire-id--authentification-unique)
14. [Notifications & Messagerie unifiée](#14-notifications--messagerie-unifiée)
15. [Système de paiement intégré](#15-système-de-paiement-intégré)
16. [Modèle économique détaillé](#16-modèle-économique-détaillé)
17. [Roadmap d'implémentation](#17-roadmap-dimplémentation)
18. [Schéma BDD complet](#18-schéma-bdd-complet)

---

## 1. ARCHITECTURE COMPLÈTE DES PORTAILS

```
ivoire.io                         ← Landing page / Manifeste
│
├── COMPTES & AUTH
│   └── Ivoire ID (SSO)          ← Un compte unique pour tout
│
├── TALENTS
│   ├── devs.ivoire.io            ← Annuaire développeurs
│   ├── [slug].ivoire.io          ← Portfolio individuel (10 templates)
│   └── hire.ivoire.io            ← Marketplace freelance (intégré jobs)
│
├── STARTUPS
│   └── startups.ivoire.io        ← Product Hunt local + classement
│
├── EMPLOI
│   └── jobs.ivoire.io            ← Offres CDI / CDD / freelance / stage
│
├── ÉDUCATION
│   └── learn.ivoire.io           ← Concours, quiz, parcours, mentorat
│
├── ÉVÉNEMENTS
│   └── events.ivoire.io          ← Hackathons, meetups, conférences
│
├── SERVICES
│   ├── health.ivoire.io          ← S.O.S Santé (urgences, pharmacies)
│   └── [futur] rent.ivoire.io    ← Logement
│
├── INVESTISSEMENT
│   └── invest.ivoire.io          ← Matching startups / investisseurs
│
├── DATA
│   ├── data.ivoire.io            ← Dashboard open data écosystème
│   └── api.ivoire.io             ← API Gateway REST/GraphQL
│
├── CONTENU
│   └── blog.ivoire.io            ← Articles, interviews, tutoriels
│
└── ADMIN
    └── admin.ivoire.io           ← Dashboard administration
```

### Principe fondamental

> **L'utilisateur ne quitte JAMAIS ivoire.io.**  
> Chercher un emploi → jobs.ivoire.io  
> Trouver un dev → devs.ivoire.io  
> Lancer sa startup → startups.ivoire.io  
> Se former → learn.ivoire.io  
> Trouver un investisseur → invest.ivoire.io  
> Organiser un hackathon → events.ivoire.io  
> Publier un article → blog.ivoire.io  
> Urgence santé → health.ivoire.io

---

## 2. ivoire.io — Landing Page (Accueil)

> **Status** : ✅ MVP implémenté  
> **Objectif** : Convertir le visiteur en inscrit

### Pages

| Page | URL | Rôle |
|---|---|---|
| Accueil | `ivoire.io` | Landing page + waitlist |
| Connexion | `ivoire.io/login` | Auth Supabase |
| Dashboard | `ivoire.io/dashboard` | Espace perso (conditionnel selon type) |
| 404 | `ivoire.io/*` | Profil non trouvé |

### Sections Landing (actuel + ajouts)

```
1. Navbar          — Logo, liens, CTA "Rejoindre"
2. Hero            — Titre + vérif dispo slug temps réel
3. Features        — 3 piliers (Talents, Startups, Services)
4. Aperçu          — Screenshot portfolio interactif
5. Portails        — [NOUVEAU] Grille visuelle des portails
6. Chiffres        — [NOUVEAU] Compteurs live (inscrits, startups, etc.)
7. Témoignages     — [NOUVEAU] Citations des premiers utilisateurs
8. Roadmap         — Timeline des phases
9. Waitlist        — Formulaire complet
10. Footer         — Liens, RS, légal
```

### Ajout — Section Portails

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Tout ivoire.io, au même endroit                             │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🧑‍💻        │ │ 🚀        │ │ 💼        │ │ 📚        │      │
│  │ Talents  │ │ Startups │ │ Emploi   │ │ Apprendre│      │
│  │ devs.    │ │ startups.│ │ jobs.    │ │ learn.   │      │
│  │ ivoire.io│ │ ivoire.io│ │ ivoire.io│ │ ivoire.io│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🎪        │ │ 🏥        │ │ 💰        │ │ 📊        │      │
│  │ Événem.  │ │ Santé    │ │ Investir │ │ Data     │      │
│  │ events.  │ │ health.  │ │ invest.  │ │ data.    │      │
│  │ ivoire.io│ │ ivoire.io│ │ ivoire.io│ │ ivoire.io│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. devs.ivoire.io — Annuaire Talents

> **Status** : ✅ MVP implémenté  
> **Objectif** : Trouver et contacter des développeurs

### Pages

| Page | URL | Rôle |
|---|---|---|
| Annuaire | `devs.ivoire.io` | Liste filtrée + recherche |
| Profil | `[slug].ivoire.io` | Portfolio individuel |

### Détail (spécification complète → voir [ANNUAIRE_DEVS.md](ANNUAIRE_DEVS.md))

### Améliorations vision finale

- **Recherche full-text** (nom, compétences, bio)
- **Filtres multi-critères** combinables
- **Carte de localisation** optionnelle (map des devs par ville)
- **Random spotlight** : "Développeur du jour" en bannière
- **Mode liste / grille** (toggle)
- **Favoris** : un recruteur peut sauvegarder des profils

---

## 4. [slug].ivoire.io — Portfolios & Vitrines

> **Status** : ✅ MVP implémenté (template Classic)  
> **Objectif** : Être la carte de visite digitale de chaque utilisateur

### 10 templates disponibles

Voir **[TEMPLATES_CATALOGUE.md](TEMPLATES_CATALOGUE.md)** pour les wireframes complets de chaque template.

| # | Template | Cible |
|---|---|---|
| 1 | Classic | Tout public |
| 2 | Minimal | Dev zen |
| 3 | Bento | Dev créatifs |
| 4 | Terminal | Dev backend |
| 5 | Magazine | Storytelling |
| 6 | Timeline | Profils seniors |
| 7 | Card Stack | Full-stack |
| 8 | Split | Design-forward |
| 9 | Startup Landing | Startups |
| 10 | Corporate | Entreprises |

### Personnalisation (tous templates)

- Couleur d'accent (8 presets + custom hex)
- Mode clair / sombre / auto
- Image de couverture (hero)
- Ordre des sections (drag & drop)
- Sections masquables
- Police (Inter / Geist / JetBrains Mono)
- Domaine personnalisé (CNAME vers slug.ivoire.io) — *Premium*

---

## 5. startups.ivoire.io — Product Hunt Local

> **Status** : 🔜 Planifié Phase 3  
> **Objectif** : Vitrine + classement des startups de CI

### Pages

| Page | URL | Rôle |
|---|---|---|
| Accueil | `startups.ivoire.io` | Classement du jour / de la semaine |
| Soumettre | `startups.ivoire.io/submit` | Formulaire de soumission |
| Fiche startup | `startups.ivoire.io/[slug]` | Détail + votes + commentaires |
| Archive | `startups.ivoire.io/archive` | Historique par semaine |
| Secteurs | `startups.ivoire.io/sectors` | Filtrage par secteur |

### Wireframe — Page d'accueil

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] startups        [Soumettre 🚀] [Se connecter]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🏆 Top Startups de la Semaine                              │
│  Semaine du 10 au 16 mars 2026                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🥇  1.  [Logo] PayCI                    ▲ 127       │  │
│  │           Paiement mobile simplifié                   │  │
│  │           Fintech · Abidjan · payci.ivoire.io        │  │
│  │           [💬 23 commentaires]                        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  🥈  2.  [Logo] LearnX                   ▲ 89        │  │
│  │           Plateforme d'apprentissage                  │  │
│  │           Edtech · Abidjan                            │  │
│  │           [💬 12 commentaires]                        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  🥉  3.  [Logo] FarmConnect              ▲ 67        │  │
│  │           Agritech connectée                          │  │
│  │           Agritech · Bouaké                           │  │
│  │           [💬 8 commentaires]                         │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │      4.  [Logo] HealthBox                ▲ 45        │  │
│  │      5.  [Logo] ShipCI                   ▲ 38        │  │
│  │      ...                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── FILTRER PAR SECTEUR ────────────────────────────────┐│
│  │  [Tous] [Fintech] [Edtech] [Agritech] [Healthtech]     ││
│  │  [Logistique] [E-commerce] [SaaS] [Autre]              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──── LANCÉ RÉCEMMENT ────────────────────────────────────┐│
│  │  [Logo] NouvelleStartup — "Soumis il y a 2h" [▲ Voter] ││
│  │  [Logo] AutreProjet     — "Soumis il y a 5h" [▲ Voter] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ivoire.io — L'OS Digital de la Côte d'Ivoire 🇨🇮            │
└──────────────────────────────────────────────────────────────┘
```

### Wireframe — Fiche Startup

```
┌──────────────────────────────────────────────────────────────┐
│  ← Retour                                        [▲ Voter]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────┐  PayCI                                           │
│  │ Logo  │  "Paiement mobile simplifié pour la CI"          │
│  │ 128px │                                                  │
│  └───────┘  Fintech · Abidjan · Fondé en 2024              │
│             ▲ 127 votes · 🏅 #1 cette semaine               │
│                                                              │
│  [ 🌐 Site web ]  [ 🔗 LinkedIn ]  [ 🐦 Twitter ]          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── LE PROBLÈME ────────────────────────────────────────┐│
│  │  Description du problème résolu...                      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──── LA SOLUTION ────────────────────────────────────────┐│
│  │  [Screenshot / démo du produit]                         ││
│  │  Description de la solution...                          ││
│  │  Technologies : [React Native] [Node.js] [PostgreSQL]   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──── L'ÉQUIPE ──────────────────────────────────────────┐ │
│  │  [Av] Jean D. — CEO    → jean.ivoire.io               │ │
│  │  [Av] Marie K. — CTO   → marie.ivoire.io              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── COMMENTAIRES (23) ─────────────────────────────────┐ │
│  │                                                        │ │
│  │  [Av] Ulrich K. — il y a 2h                           │ │
│  │  "Super concept, j'ai testé et c'est fluide !"       │ │
│  │  ↑ 5  ↓ 0  [Répondre]                                │ │
│  │                                                        │ │
│  │  [Av] Fatou D. — il y a 5h                            │ │
│  │  "Comment vous gérez la sécurité des transacs ?"      │ │
│  │  ↑ 3  ↓ 0  [Répondre]                                │ │
│  │    └── Réponse de Jean D. (fondateur) — il y a 4h    │ │
│  │        "Bonne question ! On utilise..."               │ │
│  │                                                        │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │  [Écrire un commentaire...]         [Publier]  │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Formulaire de soumission

```
┌──────────────────────────────────────────────────────────────┐
│  🚀 Soumettre une startup                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nom *              [________________________________]       │
│  Tagline *          [________________________________]       │
│                     (1 phrase, max 80 caractères)            │
│  Logo *             [Choisir une image]                      │
│  Secteur *          [Fintech ▾]                              │
│  Site web           [https://____________________]           │
│  Stade              [Idée ▾] / [MVP ▾] / [Lancé ▾] / [Croiss.]│
│  Ville              [Abidjan ▾]                              │
│                                                              │
│  Le problème *      [________________________________]       │
│                     [________________________________]       │
│  La solution *      [________________________________]       │
│                     [________________________________]       │
│  Screenshot         [Choisir une image]                      │
│  Technologies       [___________] [+ Ajouter]                │
│                                                              │
│  Équipe             (ajout depuis profils ivoire.io)         │
│  [🔍 Chercher un membre ivoire.io] ou [Ajouter manuellement]│
│                                                              │
│           [ Prévisualiser ]  [ 🚀 Soumettre pour review ]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. jobs.ivoire.io — Emploi & Freelance

> **Status** : 🔜 Planifié Phase 4  
> **Objectif** : Connecter recruteurs et talents sans quitter ivoire.io

### Pages

| Page | URL | Rôle |
|---|---|---|
| Accueil | `jobs.ivoire.io` | Liste d'offres + filtres |
| Détail offre | `jobs.ivoire.io/[id]` | Description complète |
| Publier | `jobs.ivoire.io/post` | Formulaire (recruteur) |
| Mes candidatures | `jobs.ivoire.io/my` | Suivi candidat |
| Mes offres | `jobs.ivoire.io/manage` | Gestion recruteur |

### Wireframe — Liste d'offres

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] jobs                   [Publier une offre 💼]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher un emploi, une technologie...       ]     │
│                                                              │
│  [Type ▾] [Techno ▾] [Ville ▾] [Salaire ▾] [Remote ▾]     │
│                                                              │
│  247 offres disponibles                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Logo] Développeur Flutter Senior        💼 CDI     │  │
│  │         Acme Corp · Abidjan                          │  │
│  │         800k — 1.2M FCFA/mois                         │  │
│  │         [Flutter] [Dart] [Firebase]                   │  │
│  │         Publié il y a 2 jours      [ Postuler → ]    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [Logo] Backend Engineer              💼 Remote      │  │
│  │         TechCI · Remote 🌍                            │  │
│  │         1M — 2M FCFA/mois                             │  │
│  │         [Go] [PostgreSQL] [Docker]                    │  │
│  │         Publié il y a 3 jours      [ Postuler → ]    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [Logo] Mission freelance React       🔧 Freelance  │  │
│  │         StartupXYZ · 3 mois                          │  │
│  │         Budget : 500k FCFA                           │  │
│  │         [React] [TypeScript] [Next.js]               │  │
│  │         Publié hier                [ Postuler → ]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [← Précédent]  1  2  3  ...  12  [Suivant →]              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Wireframe — Détail d'une offre

```
┌──────────────────────────────────────────────────────────────┐
│  ← Retour aux offres                                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │                       │  │                               │ │
│  │  CONTENU (70%)        │  │  SIDEBAR (30%)                │ │
│  │                       │  │                               │ │
│  │  Développeur Flutter  │  │  [ ✅ Postuler ]             │ │
│  │  Senior               │  │                               │ │
│  │                       │  │  💼 CDI                       │ │
│  │  [Logo] Acme Corp     │  │  📍 Abidjan                  │ │
│  │  Publié il y a 2j     │  │  💰 800k-1.2M FCFA          │ │
│  │                       │  │  🏠 Sur site                  │ │
│  │  ─────────────────    │  │  📅 Expire le 30/04/2026     │ │
│  │                       │  │                               │ │
│  │  Description du poste │  │  ──────────────               │ │
│  │  Lorem ipsum dolor    │  │                               │ │
│  │  sit amet...          │  │  Technologies :               │ │
│  │                       │  │  [Flutter] [Dart]             │ │
│  │  Responsabilités :    │  │  [Firebase] [CI/CD]           │ │
│  │  - Architecture       │  │                               │ │
│  │  - Code review        │  │  ──────────────               │ │
│  │  - Mentorat juniors   │  │                               │ │
│  │                       │  │  À propos de Acme Corp        │ │
│  │  Requis :             │  │  50-200 employés              │ │
│  │  - 3+ ans Flutter     │  │  Fintech · Abidjan            │ │
│  │  - TDD, CI/CD         │  │  → acme.ivoire.io            │ │
│  │                       │  │                               │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
│                                                              │
│  ┌──── OFFRES SIMILAIRES ────────────────────────────────┐  │
│  │  [3 cartes d'offres similaires]                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Candidature en 1 clic (Ivoire ID connecté)

```
┌──────────────────────────────────────────────────────────────┐
│  ✅ Postuler — Développeur Flutter Senior                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Votre profil ivoire.io sera envoyé au recruteur :          │
│                                                              │
│  [Av] Ulrich Kouamé                                         │
│       Lead Developer · Abidjan                              │
│       🔗 ulrich.ivoire.io                                   │
│                                                              │
│  Message de motivation (optionnel) :                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│       [ Annuler ]      [ ✅ Envoyer ma candidature ]        │
│                                                              │
│  ℹ️ Le recruteur verra votre profil complet, vos projets    │
│     et vos expériences sur votre portfolio ivoire.io.       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. learn.ivoire.io — Éducation & Compétences

> **Status** : 🔜 Planifié Phase 5  
> **Objectif** : Se former et progresser sans quitter ivoire.io

### Pages

| Page | URL | Rôle |
|---|---|---|
| Accueil | `learn.ivoire.io` | Catalogue parcours + quiz |
| Parcours | `learn.ivoire.io/paths` | Parcours d'apprentissage |
| Détail parcours | `learn.ivoire.io/paths/[slug]` | Leçons + progression |
| Quiz | `learn.ivoire.io/quiz` | Quiz rapides par techno |
| Mentorat | `learn.ivoire.io/mentors` | Trouver un mentor |
| Concours | `learn.ivoire.io/challenges` | Challenges de code |
| Classement | `learn.ivoire.io/leaderboard` | Ranking par XP |

### Wireframe — Accueil Learn

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] learn                  [Mon parcours] [🏆 Rank] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Apprends. Pratique. Progresse. 📚                          │
│  Ta progression est visible sur ton portfolio ivoire.io      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📌 PARCOURS RECOMMANDÉS (basés sur tes skills)             │
│                                                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │ 🎯 Flutter     │ │ 🎯 Go          │ │ 🎯 DevOps      │     │
│  │ Avancé        │ │ Débutant      │ │ Intermédiaire │     │
│  │ 12 leçons     │ │ 8 leçons      │ │ 10 leçons     │     │
│  │ ~6h           │ │ ~4h           │ │ ~5h           │     │
│  │ ████░░ 60%    │ │ ░░░░░░ 0%     │ │ ██░░░░ 20%    │     │
│  │ [Continuer →] │ │ [Commencer →] │ │ [Continuer →] │     │
│  └───────────────┘ └───────────────┘ └───────────────┘     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🏆 CHALLENGES ACTIFS                                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔥 Challenge de la semaine : "API REST en Go"       │  │
│  │     78 participants · Fin dans 3 jours               │  │
│  │     Prix : Badge "Go Master" + 500 XP                │  │
│  │     [ Participer → ]                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🧑‍🏫 TROUVER UN MENTOR                                      │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ [Av] Jean D.│ │ [Av] Marie  │ │ [Av] Yapi B.│          │
│  │ Flutter     │ │ React       │ │ DevOps      │          │
│  │ 5 ans exp.  │ │ 8 ans exp.  │ │ 6 ans exp.  │          │
│  │ 🟢 Dispo    │ │ 🟢 Dispo    │ │ 🔴 Occupé   │          │
│  │ [Demander →]│ │ [Demander →]│ │             │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                              │
│  ℹ️ Les mentors sont des devs ivoire.io avec 3+ ans d'exp.  │
│     La session de mentorat est gratuite (1h max).           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Parcours d'apprentissage (détail)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Tous les parcours                                         │
│                                                              │
│  🎯 Flutter Avancé                                          │
│  Par Jean Dupont (jean.ivoire.io) · 12 leçons · ~6h         │
│  ████████████░░░░░░░░ 60% complété                          │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ 1. Introduction à Flutter avancé          (terminé)     │
│  ✅ 2. State management avec Riverpod         (terminé)     │
│  ✅ 3. Animations custom                      (terminé)     │
│  ✅ 4. Architecture Clean                     (terminé)     │
│  ✅ 5. Tests unitaires avancés                (terminé)     │
│  ✅ 6. Tests d'intégration                    (terminé)     │
│  ▶️ 7. Performance & Profiling                (en cours)    │
│  ⬚ 8. Build & déploiement CI/CD                            │
│  ⬚ 9. Flutter Web avancé                                   │
│  ⬚ 10. Packages natifs (FFI)                               │
│  ⬚ 11. Projet final : App complète                         │
│  ⬚ 12. Quiz final + Certificat                             │
│                                                              │
│  ┌──── LEÇON 7 : Performance & Profiling ─────────────────┐│
│  │                                                         ││
│  │  [Contenu markdown rendu]                               ││
│  │  - Texte explicatif                                     ││
│  │  - Blocs de code syntaxiquement colorés                 ││
│  │  - Images / diagrammes                                  ││
│  │  - Liens vers la doc officielle                         ││
│  │                                                         ││
│  │  ┌─────────────────────────────────────────────┐       ││
│  │  │  📝 Exercice pratique                        │       ││
│  │  │  Optimise le widget suivant pour éviter      │       ││
│  │  │  les rebuilds inutiles...                    │       ││
│  │  │  [ Voir la solution ]                        │       ││
│  │  └─────────────────────────────────────────────┘       ││
│  │                                                         ││
│  │         [ ← Précédent ]  [ Marquer terminé ✅ ]        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Intégration Portfolio

Les badges / certifications gagnés sur learn.ivoire.io s'affichent automatiquement sur le portfolio :

```
Compétences
[Flutter] [Dart] [Go 🏅] [Firebase] [Clean Arch 🎓]

🎓 = Parcours complété
🏅 = Challenge gagné
```

---

## 8. events.ivoire.io — Événements Tech

> **Status** : 🔜 Planifié Phase 5  
> **Objectif** : Ne plus rater un événement tech en CI

### Pages

| Page | URL | Rôle |
|---|---|---|
| Calendrier | `events.ivoire.io` | Vue calendrier + liste |
| Détail | `events.ivoire.io/[slug]` | Info + inscription |
| Créer | `events.ivoire.io/create` | Formulaire organisateur |
| Mes événements | `events.ivoire.io/my` | Inscriptions + organisés |

### Wireframe — Calendrier

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] events            [Créer un événement 🎪]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Vue calendrier 📅] / [Vue liste 📋]       Mars 2026      │
│                                                              │
│  ┌──── CETTE SEMAINE ──────────────────────────────────────┐│
│  │                                                         ││
│  │  📅 Samedi 15 mars                                     ││
│  │  ┌────────────────────────────────────────────────────┐││
│  │  │  🎪 Flutter Meetup Abidjan #12                     │││
│  │  │  📍 Cocody, Espace Tekno · 14h-18h                │││
│  │  │  🎫 Gratuit · 45/60 places                        │││
│  │  │  Par : Jean D. (jean.ivoire.io)                    │││
│  │  │  [S'inscrire →]                                    │││
│  │  └────────────────────────────────────────────────────┘││
│  │                                                         ││
│  │  📅 Dimanche 16 mars                                   ││
│  │  ┌────────────────────────────────────────────────────┐││
│  │  │  🏆 Hackathon "Build for CI" (48h)                 │││
│  │  │  📍 En ligne · 09h samedi → 09h lundi             │││
│  │  │  🎫 Gratuit · Prix: 500k FCFA + incubation        │││
│  │  │  Par : ivoire.io                                    │││
│  │  │  [S'inscrire en équipe →]                          │││
│  │  └────────────────────────────────────────────────────┘││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──── À VENIR ────────────────────────────────────────────┐│
│  │  22 mars — Workshop React avancé (Abidjan)             ││
│  │  29 mars — Demo Day Startups Q1 (En ligne)             ││
│  │  5 avril — DevFest Abidjan 2026 (Cocody)              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  Types : [Tous] [Meetup] [Hackathon] [Workshop] [Conférence]│
│  Lieu : [Tous] [Abidjan] [En ligne] [Bouaké]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Formulaire création événement

```
┌──────────────────────────────────────────────────────────────┐
│  🎪 Créer un événement                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nom *              [________________________________]       │
│  Type *             [Meetup ▾] / [Hackathon] / [Workshop]   │
│  Date début *       [JJ/MM/AAAA]  Heure [HH:MM]            │
│  Date fin           [JJ/MM/AAAA]  Heure [HH:MM]            │
│  Lieu *             [Adresse ou "En ligne"]                  │
│  Lien visio         [https://meet.google.com/___]           │
│  Image de couverture [Choisir une image]                    │
│  Description *      [________________________________]       │
│  Nombre de places   [___] (laisser vide = illimité)         │
│  Prix               [Gratuit ▾] ou [____ FCFA]              │
│  Tags technologies  [___________] [+ Ajouter]               │
│                                                              │
│       [ Prévisualiser ]  [ 🎪 Publier l'événement ]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. health.ivoire.io — S.O.S Santé

> **Status** : 🔜 Planifié Phase 5 (intégration de S.O.S Santé existant)  
> **Objectif** : Urgences, pharmacies de garde, infos santé

### Pages

| Page | URL | Rôle |
|---|---|---|
| Accueil | `health.ivoire.io` | Urgences + recherche |
| Pharmacies | `health.ivoire.io/pharmacies` | Pharmacies de garde |
| Hôpitaux | `health.ivoire.io/hospitals` | Carte + liste |
| Urgences | `health.ivoire.io/urgences` | Numéros d'urgence |
| Guide | `health.ivoire.io/guide` | Premiers secours |

### Wireframe — Accueil S.O.S Santé

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] 🏥 S.O.S santé                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── URGENCES ──────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  🚨 SAMU :        185                  [ 📞 Appeler ] │ │
│  │  🚒 Pompiers :    180                  [ 📞 Appeler ] │ │
│  │  🚔 Police :      110 / 111            [ 📞 Appeler ] │ │
│  │  🆘 Croix-Rouge : 01 44 44 44          [ 📞 Appeler ] │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── PHARMACIES DE GARDE (ce soir) ────────────────────┐  │
│  │                                                       │  │
│  │  📍 Votre position : Cocody, Abidjan                  │  │
│  │                                                       │  │
│  │  🟢 Pharmacie du Plateau — 1.2 km                    │  │
│  │     Bd de la République · 📞 21 XX XX XX             │  │
│  │     [ 🗺️ Itinéraire ]                                │  │
│  │                                                       │  │
│  │  🟢 Pharmacie Les 2 Plateaux — 2.8 km               │  │
│  │     Rue des Jardins · 📞 21 XX XX XX                 │  │
│  │     [ 🗺️ Itinéraire ]                                │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── HÔPITAUX PROCHES ────────────────────────────────┐   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │         CARTE (OpenStreetMap)                 │    │   │
│  │  │         📍 📍 📍                              │    │   │
│  │  │                                              │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │                                                      │   │
│  │  CHU de Cocody — 3.1 km     [🗺️] [📞]              │   │
│  │  Polyclinique Farah — 4.5 km [🗺️] [📞]             │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──── GUIDE PREMIERS SECOURS ────────────────────────────┐ │
│  │  [Malaise] [Brûlure] [Fracture] [Morsure] [Noyade]   │ │
│  │  [Choc électrique] [Hémorragie] [Étouffement]        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. invest.ivoire.io — Investissement

> **Status** : 🔜 Planifié Phase 5  
> **Objectif** : Connecter startups et investisseurs de manière transparente

### Pages

| Page | URL | Rôle |
|---|---|---|
| Accueil | `invest.ivoire.io` | Vue marché + deals |
| Startups | `invest.ivoire.io/startups` | Startups cherchant des fonds |
| Investisseurs | `invest.ivoire.io/investors` | Profils investisseurs (BA, VC) |
| Deal room | `invest.ivoire.io/deals/[id]` | Espace privatif négociation |
| Mon espace | `invest.ivoire.io/my` | Mes deals / mon portfolio |

### Wireframe — Accueil Invest

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] invest                    [Se connecter 💰]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Investir dans la tech ivoirienne 🇨🇮                       │
│                                                              │
│  ┌──── CHIFFRES ────────────────────────────────────────┐  │
│  │   34 startups · 12 investisseurs · 2.3M $ levés      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── STARTUPS EN LEVÉE ────────────────────────────────┐ │
│  │                                                        │ │
│  │  [Logo] PayCI · Fintech                               │ │
│  │  Recherche : 100k $ (Pré-seed)                        │ │
│  │  Engagé : 45k $ (45%)  [████████░░░░░░░░░░]           │ │
│  │  ▲ 127 votes · 🏅 #1 startups.ivoire.io              │ │
│  │  [ Voir le deal → ]                                   │ │
│  │                                                        │ │
│  │  [Logo] FarmConnect · Agritech                        │ │
│  │  Recherche : 200k $ (Seed)                            │ │
│  │  Engagé : 80k $ (40%)  [████████░░░░░░░░░░]           │ │
│  │  [ Voir le deal → ]                                   │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── INVESTISSEURS ACTIFS ──────────────────────────────┐ │
│  │                                                        │ │
│  │  [Av] Mamadou T.  — Business Angel                    │ │
│  │       Secteurs : Fintech, SaaS                        │ │
│  │       Ticket : 10k-50k $                              │ │
│  │       5 investissements réalisés                      │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Tu es startup ?  [ 🚀 Soumettre mon deal ]                 │
│  Tu es investisseur ? [ 💰 Créer mon profil ]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. data.ivoire.io — Open Data & API

> **Status** : 🔜 Planifié Phase 6  
> **Objectif** : Rendre l'écosystème tech CI transparent et accessible

### Pages

| Page | URL | Rôle |
|---|---|---|
| Dashboard | `data.ivoire.io` | Statistiques visuelles |
| API Docs | `data.ivoire.io/docs` | Documentation API REST |
| Datasets | `data.ivoire.io/datasets` | Données téléchargeables |

### Wireframe — Dashboard Data

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] data                  [API Docs 📖] [Datasets] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  L'écosystème tech ivoirien en chiffres 📊                  │
│  Données en temps réel, ouvertes et gratuites               │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🧑‍💻 1 247  │ │ 🚀 34    │ │ 💼 247   │ │ 🎪 12    │      │
│  │ Devs     │ │ Startups │ │ Offres   │ │ Events   │      │
│  │ +12%     │ │ +3       │ │ actives  │ │ ce mois  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
│  ┌──── TECHNOLOGIES LES PLUS POPULAIRES ─────────────────┐ │
│  │                                                        │ │
│  │  Flutter    ████████████████████████  342 devs         │ │
│  │  React      ██████████████████        289 devs         │ │
│  │  Python     █████████████████         267 devs         │ │
│  │  JavaScript ████████████████          254 devs         │ │
│  │  Go         ██████████                156 devs         │ │
│  │  Laravel    █████████                 134 devs         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── RÉPARTITION PAR VILLE ─────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌───────────────────────────────────────────────┐    │ │
│  │  │          CARTE INTERACTIVE (CI)                │    │ │
│  │  │      📍 Abidjan (78%)                         │    │ │
│  │  │           📍 Bouaké (8%)                      │    │ │
│  │  │        📍 Yamoussoukro (5%)                   │    │ │
│  │  └───────────────────────────────────────────────┘    │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── CROISSANCE ────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Inscriptions mensuelles (12 derniers mois)           │ │
│  │  ▂▃▅▆▇▆▅▇█▇██  (graphique barres)                    │ │
│  │  M A M J J A S O N D J F M                            │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── API ───────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  GET api.ivoire.io/v1/profiles                        │ │
│  │  GET api.ivoire.io/v1/startups                        │ │
│  │  GET api.ivoire.io/v1/jobs                            │ │
│  │  GET api.ivoire.io/v1/stats                           │ │
│  │                                                        │ │
│  │  Gratuit : 100 requêtes/jour                          │ │
│  │  Pro : illimité — 10$/mois                            │ │
│  │                                                        │ │
│  │  [ 📖 Voir la documentation API complète ]            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. blog.ivoire.io — Blog & Contenus

> **Status** : 🔜 Planifié Phase 5  
> **Objectif** : SEO + contenu + storytelling communautaire

### Pages

| Page | URL | Rôle |
|---|---|---|
| Accueil | `blog.ivoire.io` | Articles récents |
| Article | `blog.ivoire.io/[slug]` | Contenu complet |
| Catégories | `blog.ivoire.io/categories` | Filtrage |
| Rédiger | `blog.ivoire.io/write` | Éditeur markdown |

### Types de contenu

| Type | Qui rédige | Exemple |
|---|---|---|
| **Portrait** | Équipe ivoire.io | "Rencontrez Fatou, dev Flutter à Abidjan" |
| **Tutoriel** | Développeurs (communauté) | "Déployer une app Flutter sur ivoire.io" |
| **Startup Spotlight** | Startups | "Comment PayCI a levé 100k$ via ivoire.io" |
| **Actualité** | Équipe | "Lancement de jobs.ivoire.io" |
| **Guide** | Communauté | "Les 10 meilleures ressources Flutter en français" |

### Wireframe — Accueil Blog

```
┌──────────────────────────────────────────────────────────────┐
│  [ivoire.io] blog               [Catégories] [✍️ Rédiger]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── ARTICLE À LA UNE ──────────────────────────────────┐│
│  │  ┌──────────────────────────────────────────────┐      ││
│  │  │           IMAGE DE COUVERTURE                 │      ││
│  │  │              (pleine largeur)                 │      ││
│  │  └──────────────────────────────────────────────┘      ││
│  │  [Portrait]                                             ││
│  │  Rencontrez Ulrich Kouamé, Lead Dev à Abidjan          ││
│  │  Comment il utilise ivoire.io pour...                   ││
│  │  Par ivoire.io · il y a 2 jours · 5 min de lecture     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──── RÉCENTS ────────────────────────────────────────────┐│
│  │                                                         ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ││
│  │  │  [Image]      │  │  [Image]      │  │  [Image]      │ ││
│  │  │  [Tutoriel]   │  │  [Startup]    │  │  [Actualité]  │ ││
│  │  │  Déployer une │  │  PayCI lève   │  │  Nouveau :    │ ││
│  │  │  app Flutter  │  │  100k$ via    │  │  jobs.ivoire  │ ││
│  │  │  sur...       │  │  ivoire.io    │  │  .io est live │ ││
│  │  │  3 min        │  │  4 min        │  │  2 min        │ ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘ ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Éditeur de rédaction

```
┌──────────────────────────────────────────────────────────────┐
│  ✍️ Rédiger un article                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Titre *         [________________________________]          │
│  Catégorie *     [Tutoriel ▾]                                │
│  Tags            [Flutter ✕] [Deploy ✕] [+ Ajouter]         │
│  Image couverture [Choisir une image]                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [B] [I] [H1] [H2] [Code] [Link] [Image] [Quote]    │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                        │ │
│  │  (Éditeur Markdown WYSIWYG)                           │ │
│  │                                                        │ │
│  │  ## Introduction                                      │ │
│  │                                                        │ │
│  │  Dans cet article, je vais vous montrer comment...    │ │
│  │                                                        │ │
│  │  ```dart                                              │ │
│  │  void main() {                                        │ │
│  │    runApp(MyApp());                                    │ │
│  │  }                                                    │ │
│  │  ```                                                  │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ 👁️ Prévisualiser ] [ 📝 Brouillon ] [ 🚀 Publier ]     │
│                                                              │
│  ℹ️ L'article sera relié à votre profil ivoire.io.          │
│     Les articles sont modérés avant publication.            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. IVOIRE ID — Authentification Unique

> **SSO (Single Sign-On)** pour tout l'écosystème ivoire.io

### Méthodes de connexion

| Méthode | Status | Détail |
|---|---|---|
| Email + mot de passe | ✅ Implémenté | Via Supabase Auth |
| GitHub OAuth | ✅ Implémenté | Import auto projets |
| LinkedIn OAuth | 🔜 | Import auto expériences |
| Google OAuth | 🔜 | Populaire en CI |
| Téléphone (SMS OTP) | 🔜 | Essentiel pour adoption |
| "Se connecter avec Ivoire ID" | 🔜 Phase 6 | SDK tiers |

### Flux d'inscription

```
┌──────────────────────────────────────────────────────────────┐
│  Créer mon Ivoire ID                                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [ 🐙 Continuer avec GitHub ]                               │
│  [ 🔗 Continuer avec LinkedIn ]                              │
│  [ 🔵 Continuer avec Google ]                                │
│                                                              │
│  ──────────── ou ────────────                                │
│                                                              │
│  Nom complet *     [________________________________]        │
│  Email *           [________________________________]        │
│  Mot de passe *    [________________________________]        │
│                                                              │
│  Je suis *         ( ) Développeur                           │
│                    ( ) Fondateur / Startup                    │
│                    ( ) Entreprise                             │
│                    ( ) Autre                                  │
│                                                              │
│  Slug souhaité *   [________].ivoire.io                      │
│                    ✅ Disponible !                            │
│                                                              │
│  [ 🚀 Créer mon compte ]                                    │
│                                                              │
│  Déjà inscrit ? [Se connecter]                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Un compte, tout ivoire.io

```
Avec mon Ivoire ID (ulrich@ivoire.io), j'accède à :

✅ Mon portfolio (ulrich.ivoire.io)
✅ Le dashboard de mon profil
✅ Les offres sur jobs.ivoire.io
✅ Les votes sur startups.ivoire.io
✅ Mon parcours sur learn.ivoire.io
✅ Les événements sur events.ivoire.io
✅ L'investissement sur invest.ivoire.io
✅ La rédaction sur blog.ivoire.io
✅ Les données sur data.ivoire.io
✅ Les urgences sur health.ivoire.io
```

---

## 14. Notifications & Messagerie Unifiée

### Centre de notifications (accessible depuis n'importe quel portail)

```
┌──────────────────────────────────────────────────────────────┐
│  🔔 Notifications                    [Tout marquer comme lu] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📨 Nouveau message de Acme Corp        il y a 5 min  [●]  │
│     "Bonjour, nous avons vu votre profil..."                │
│                                                              │
│  💼 Nouvelle offre correspondant à vos skills  il y a 1h   │
│     "Développeur Flutter Senior — Abidjan"                  │
│                                                              │
│  ▲ Votre startup PayCI a reçu 15 votes  il y a 2h          │
│     "PayCI est maintenant #2 de la semaine !"               │
│                                                              │
│  🎪 Rappel : Flutter Meetup #12 demain à 14h                │
│     "N'oubliez pas votre inscription !"                     │
│                                                              │
│  📊 Rapport hebdo de votre portfolio     il y a 1 jour     │
│     "45 visites cette semaine (+12%)"                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Messagerie interne (DM entre utilisateurs)

```
┌────────────────────┬─────────────────────────────────────────┐
│  Conversations      │  Acme Corp                              │
│                     │                                          │
│  ● Acme Corp   (1)│  ┌──────────────────────────────────┐   │
│    "Bonjour, no..."│  │ [Av] Acme Corp — il y a 5 min    │   │
│                     │  │ Bonjour Ulrich, nous avons vu    │   │
│  Jean Dupont       │  │ votre portfolio et vos projets    │   │
│    "Merci pour..."  │  │ Flutter nous intéressent.         │   │
│                     │  │ Seriez-vous disponible pour un    │   │
│  Marie Koné        │  │ entretien cette semaine ?         │   │
│    "Le meetup é..." │  └──────────────────────────────────┘   │
│                     │                                          │
│                     │  ┌────────────────────────────────────┐│
│                     │  │ [Écrire un message...]  [Envoyer] ││
│                     │  └────────────────────────────────────┘│
└────────────────────┴─────────────────────────────────────────┘
```

---

## 15. Système de Paiement Intégré

> Pas besoin de sortir de ivoire.io pour payer.

### Méthodes de paiement (adaptées à la CI)

| Méthode | Fournisseur | Usage |
|---|---|---|
| Mobile Money (Orange/MTN/Moov) | CinetPay / FedaPay | Paiements locaux |
| Carte bancaire (Visa/Mastercard) | Stripe | International |
| PayPal | PayPal | Diaspora |

### Ce qui est payant

| Fonctionnalité | Prix | Paiement |
|---|---|---|
| Portfolio Premium (dev) | 2 500 FCFA/mois (~5$) | Récurrent |
| Vitrine Entreprise | 15 000 FCFA/mois (~30$) | Récurrent |
| Offre d'emploi sponsorisée | 5 000 FCFA / offre | Unitaire |
| Accès API Pro | 5 000 FCFA/mois (~10$) | Récurrent |
| Billetterie événement | Commission 5% | Sur transaction |
| Domaine personnalisé (CNAME) | 5 000 FCFA/mois | Récurrent |

### Wireframe — Upgrade Premium

```
┌──────────────────────────────────────────────────────────────┐
│  ⭐ Passer en Premium                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │  📦 GRATUIT          │  │  ⭐ PREMIUM                  │  │
│  │                      │  │  2 500 FCFA / mois (~5$)    │  │
│  │  ✅ Portfolio perso   │  │                              │  │
│  │  ✅ 10 templates      │  │  Tout Gratuit +             │  │
│  │  ✅ Projets illimités │  │  ✅ Statistiques avancées    │  │
│  │  ✅ Formulaire contact│  │  ✅ Badge vérifié ✓          │  │
│  │  ❌ Statistiques      │  │  ✅ Domaine personnalisé    │  │
│  │  ❌ Badge vérifié     │  │  ✅ Priorité dans l'annuaire│  │
│  │  ❌ Domaine custom    │  │  ✅ Pas de footer ivoire.io │  │
│  │  ❌ Priorité annuaire │  │  ✅ Analytics export CSV     │  │
│  │                      │  │                              │  │
│  │  [Actuel]            │  │  [ ⭐ Choisir Premium ]      │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                              │
│  Payer avec :                                                │
│  [📱 Mobile Money]  [💳 Carte bancaire]  [PayPal]           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 16. Modèle Économique Détaillé

### Phase par phase

| Phase | Timing | Revenu principal | Estimation |
|---|---|---|---|
| Phase 1-2 | Mois 1-3 | Gratuit (acquisition) | 0$ |
| Phase 3 | Mois 3-4 | Dev Premium (5$/mois) | 500$/mois |
| Phase 4 | Mois 4-6 | + Entreprises (30$/mois) + Jobs | 2 000$/mois |
| Phase 5 | Mois 6-12 | + API + Billetterie + Marketplace | 5-10k$/mois |
| Phase 6 | An 2+ | + Expansion régionale + Partenariats | 20k+$/mois |

### Objectifs financiers

```
Année 1 : 5 000 - 10 000 $/mois récurrent (MRR)
Année 2 : 20 000 - 50 000 $/mois
Année 3 : >1 milliard FCFA de valorisation
```

---

## 17. Roadmap d'Implémentation

```
PHASE 1 — FONDATIONS (Mois 1)                    ✅ FAIT
├── Landing page ivoire.io
├── Auth Supabase (Ivoire ID v1)
├── Portfolio [slug].ivoire.io (template Classic)
├── Dashboard développeur (profil, projets, expériences)
├── Annuaire devs.ivoire.io
└── Formulaire contact + waitlist

PHASE 2 — ENRICHISSEMENT (Mois 2)                🔜 EN COURS
├── 10 templates portfolio
├── Dashboard startup + entreprise + autre
├── Sélecteur de template
├── Personnalisation couleur / mode / police
├── Dashboard admin
└── Auth GitHub + Google OAuth

PHASE 3 — STARTUPS (Mois 3)
├── startups.ivoire.io (soumission, votes, classement)
├── Fiche startup détaillée
├── Système de commentaires
├── Lien équipe ↔ profils devs
└── Badge "Lancé sur ivoire.io"

PHASE 4 — EMPLOI & MONÉTISATION (Mois 4-6)
├── jobs.ivoire.io (offres, candidatures 1-clic)
├── Messagerie interne
├── Centre de notifications
├── Premium dev + Entreprise
├── Intégration paiement (CinetPay + Stripe)
└── Dashboard entreprise complet (talents, offres)

PHASE 5 — ÉCOSYSTÈME (Mois 6-12)
├── learn.ivoire.io (parcours, quiz, mentorat)
├── events.ivoire.io (calendrier, billetterie)
├── health.ivoire.io (intégration S.O.S Santé)
├── blog.ivoire.io (articles, portraits)
├── invest.ivoire.io (matching, deal rooms)
└── Badges / certifications intégrées au portfolio

PHASE 6 — SCALE (An 2+)
├── data.ivoire.io (open data, API gateway)
├── api.ivoire.io (REST + GraphQL)
├── App mobile (Flutter)
├── "Se connecter avec Ivoire ID" (SDK tiers)
├── Expansion UEMOA
└── Levée de fonds
```

---

## 18. SCHÉMA BDD COMPLET

### Tables principales (préfixe `ivoireio_`)

```
ivoireio_profiles           ← Utilisateurs (devs, startups, entreprises)
ivoireio_projects           ← Projets de portfolios
ivoireio_experiences        ← Expériences professionnelles
ivoireio_waitlist           ← Liste d'attente

ivoireio_startups           ← Fiches startups (startups.ivoire.io)
ivoireio_startup_votes      ← Votes sur les startups
ivoireio_startup_comments   ← Commentaires sur les startups
ivoireio_startup_members    ← Membres d'équipe

ivoireio_jobs               ← Offres d'emploi
ivoireio_applications       ← Candidatures
ivoireio_saved_profiles     ← Profils sauvegardés (favoris recruteur)

ivoireio_messages           ← Messagerie interne
ivoireio_notifications      ← Centre de notifications
ivoireio_contact_messages   ← Formulaires contact publics

ivoireio_events             ← Événements
ivoireio_event_registrations ← Inscriptions événements

ivoireio_courses            ← Parcours d'apprentissage
ivoireio_lessons            ← Leçons individuelles
ivoireio_user_progress      ← Progression utilisateur
ivoireio_challenges         ← Challenges de code
ivoireio_badges             ← Badges / certifications

ivoireio_health_pharmacies  ← Pharmacies de garde
ivoireio_health_hospitals   ← Hôpitaux / centres de santé

ivoireio_investments        ← Deals investissement
ivoireio_investor_profiles  ← Profils investisseurs

ivoireio_articles           ← Articles blog
ivoireio_article_categories ← Catégories

ivoireio_subscriptions      ← Abonnements premium
ivoireio_payments           ← Historique paiements

ivoireio_reports            ← Signalements modération
ivoireio_admin_logs         ← Logs d'administration
```

### Nouvelles colonnes pour `ivoireio_profiles`

```sql
ALTER TABLE ivoireio_profiles ADD COLUMN template VARCHAR(20) DEFAULT 'classic';
ALTER TABLE ivoireio_profiles ADD COLUMN accent_color VARCHAR(7) DEFAULT '#FF6B00';
ALTER TABLE ivoireio_profiles ADD COLUMN theme_mode VARCHAR(5) DEFAULT 'dark';
ALTER TABLE ivoireio_profiles ADD COLUMN font VARCHAR(20) DEFAULT 'inter';
ALTER TABLE ivoireio_profiles ADD COLUMN cover_url TEXT;
ALTER TABLE ivoireio_profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;
ALTER TABLE ivoireio_profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
ALTER TABLE ivoireio_profiles ADD COLUMN phone VARCHAR(20);
ALTER TABLE ivoireio_profiles ADD COLUMN section_order TEXT[] DEFAULT '{profile,skills,projects,experiences,contact}';
ALTER TABLE ivoireio_profiles ADD COLUMN hidden_sections TEXT[] DEFAULT '{}';
```

---

## PRINCIPES DE DESIGN (tous portails)

| Principe | Application |
|---|---|
| **Simple** | Max 3 actions par page. Pas de surcharge visuelle. |
| **Minimaliste** | Fond sombre, orange accent, espaces blancs généreux |
| **Intuitif** | Tout est à 1-2 clics. Pas de documentation nécessaire. |
| **Mobile-first** | 70% du trafic CI est mobile. Tout doit marcher sur un écran 375px. |
| **Rapide** | SSR/SSG Next.js. Core Web Vitals < 2.5s LCP. Optimistic UI. |
| **Accessible** | Contraste WCAG AA. Labels form. Navigation clavier. |
| **Localisation** | Français par défaut. Adapté au contexte CI (FCFA, villes CI, Mobile Money). |
| **Offline-first** | Service Worker pour health.ivoire.io (urgences toujours accessibles). |

---

## NAVIGATION GLOBALE

> Barre commune présente sur TOUS les portails. Contexte = sous-domaine actif.

```
┌──────────────────────────────────────────────────────────────┐
│  [logo] ivoire.io / [portail]                                │
│                                                              │
│  [Portails ▾]  [🔍]  [🔔 3]  [Avatar ▾]                    │
│                                                              │
│  Menu Portails :                                             │
│  ┌──────────────────────────┐                               │
│  │  🧑‍💻 Talents (devs)       │                               │
│  │  🚀 Startups             │                               │
│  │  💼 Emploi (jobs)        │                               │
│  │  📚 Apprendre (learn)    │                               │
│  │  🎪 Événements (events)  │                               │
│  │  🏥 Santé (health)       │                               │
│  │  💰 Investir (invest)    │                               │
│  │  📊 Data                 │                               │
│  │  ✍️ Blog                  │                               │
│  └──────────────────────────┘                               │
│                                                              │
│  Menu Avatar :                                               │
│  ┌──────────────────────────┐                               │
│  │  👤 Mon profil           │                               │
│  │  ⚙️ Paramètres           │                               │
│  │  🔗 Mon portfolio        │                               │
│  │  ⭐ Premium              │                               │
│  │  ──────────────          │                               │
│  │  ⬅️ Déconnexion          │                               │
│  └──────────────────────────┘                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```
