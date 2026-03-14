# 📐 WIREFRAMES — Dashboards ivoire.io (Index)

> **Date** : 14 mars 2026  
> **Types couverts** : Développeur · Startup · Entreprise · Autre · Admin  
> **URL** : `ivoire.io/dashboard` (authentifié, rendu conditionnel selon `profile.type`)

---

## DOCUMENTS DÉTAILLÉS (spécifications 100%)

| Document | Contenu |
|---|---|
| [DASHBOARD_DEVELOPER.md](DASHBOARD_DEVELOPER.md) | Dashboard développeur complet (vue d'ensemble, profil, projets, expériences, messages, stats, paramètres, template) |
| [DASHBOARD_STARTUP.md](DASHBOARD_STARTUP.md) | Dashboard startup complet (vue d'ensemble, startup, équipe, produits, analytics, pitch deck, paramètres, template) |
| [DASHBOARD_ENTERPRISE.md](DASHBOARD_ENTERPRISE.md) | Dashboard entreprise complet (vue d'ensemble, entreprise, offres, talents, messages, analytics, paramètres, template) |
| [DASHBOARD_OTHER.md](DASHBOARD_OTHER.md) | Dashboard autre profil (profil simplifié, liens, template) |
| [DASHBOARD_ADMIN.md](DASHBOARD_ADMIN.md) | Dashboard admin complet (stats, utilisateurs, waitlist, modération, analytics plateforme, config) |
| [TEMPLATES_CATALOGUE.md](TEMPLATES_CATALOGUE.md) | 10 templates de pages publiques (Classic, Minimal, Bento, Terminal, Magazine, Timeline, Card Stack, Split, Startup Landing, Corporate) |
| [../05-technique/VISION_OS_DIGITAL_COMPLET.md](../05-technique/VISION_OS_DIGITAL_COMPLET.md) | Vision complète de l'OS Digital (tous les portails : jobs, learn, events, health, invest, data, blog + Ivoire ID, paiements, BDD, roadmap) |
| [../05-technique/STRATEGIE_PLATEFORME.md](../05-technique/STRATEGIE_PLATEFORME.md) | Stratégie plateforme (valeur ajoutée vs concurrence, Hub Central, pipeline recrutement end-to-end, UX unifiée, framework anti-hors-sujet) |

---

## TABLE DES MATIÈRES (résumé)

1. [Dashboard Développeur](#1-dashboard-développeur-type-developer)
2. [Dashboard Startup](#2-dashboard-startup-type-startup)
3. [Dashboard Entreprise](#3-dashboard-entreprise-type-enterprise)
4. [Dashboard Autre (Autre profil)](#4-dashboard-autre-type-other)
5. [Dashboard Admin](#5-dashboard-admin-rôle-admin)
6. [Navigation commune](#6-navigation--sidebar-commune)

---

## STRUCTURE COMMUNE (Shell)

```
┌──────────────┬──────────────────────────────────────────────┐
│              │  TOPBAR                                       │
│   SIDEBAR    │  ┌──────────────────────────────────────────┐│
│              │  │ [☰] Titre de la section active     [🔔] ││
│  [logo]      │  └──────────────────────────────────────────┘│
│  ivoire.io   │                                              │
│──────────────│  CONTENU PRINCIPAL                           │
│              │  ┌──────────────────────────────────────────┐│
│  [Avatar]    │  │                                          ││
│  Nom User    │  │         Zone de contenu                  ││
│  email       │  │                                          ││
│              │  │                                          ││
│──────────────│  └──────────────────────────────────────────┘│
│  Navigation  │                                              │
│  (variable   │                                              │
│  selon type) │                                              │
│              │                                              │
│──────────────│                                              │
│  [🔗 Portfolio│                                              │
│  / Vitrine]  │                                              │
│  [⬅️ Logout] │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 1. Dashboard Développeur (`type: developer`)

> **État actuel** : ✅ Implémenté dans `dashboard-shell.tsx`  
> **URL publique** : `[slug].ivoire.io`

### Sidebar — Navigation

```
📌 Navigation
├── 👤  Mon Profil          ← actif par défaut
├── 💼  Projets
└── 🕐  Expériences

📌 Footer sidebar
├── 🔗  Voir mon portfolio  (→ slug.ivoire.io)
└── ⬅️  Déconnexion
```

### Onglet 1 — Mon Profil

```
┌──────────────────────────────────────────────────────────────┐
│  Mon Profil                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── PHOTO DE PROFIL ──────────────────────────────────┐  │
│  │                                                        │  │
│  │   ┌──────────┐                                        │  │
│  │   │          │   [Changer la photo]                   │  │
│  │   │  Avatar  │   (JPG, PNG, WebP — max 2Mo)           │  │
│  │   │  128px   │                                        │  │
│  │   └──────────┘                                        │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── INFORMATIONS PERSONNELLES ────────────────────────┐  │
│  │                                                        │  │
│  │  Nom complet        [_________________________]       │  │
│  │  Titre / Rôle       [_________________________]       │  │
│  │                     ex: Lead Developer                │  │
│  │  Ville              [_________________________]       │  │
│  │                     ex: Abidjan                       │  │
│  │  Bio                                                  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ (texte libre, 4 lignes)                        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── LIENS SOCIAUX ─────────────────────────────────────┐  │
│  │                                                        │  │
│  │  GitHub     [https://github.com/__________]           │  │
│  │  LinkedIn   [https://linkedin.com/in/______]          │  │
│  │  Twitter    [https://twitter.com/___________]         │  │
│  │  Site web   [https://____________________]            │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── COMPÉTENCES ───────────────────────────────────────┐  │
│  │                                                        │  │
│  │  [Flutter ✕] [Dart ✕] [Firebase ✕] [+Ajouter]        │  │
│  │                                                        │  │
│  │  [____________________________] [+ Ajouter]           │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── DISPONIBILITÉ ──────────────────────────────────────┐  │
│  │                                                        │  │
│  │  [●] Disponible pour des missions / recrutement       │  │
│  │  [ ] Non disponible                                    │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                          [ 💾 Enregistrer les modifications ] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 2 — Projets

```
┌──────────────────────────────────────────────────────────────┐
│  Projets                              [ + Nouveau projet ]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⣿  [Image]  Nom du projet              [✏️] [🗑️]  │   │
│  │        Description courte...                         │   │
│  │        [Flutter] [Firebase] [Dart]                   │   │
│  │        🔗 GitHub · 🌐 Démo                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⣿  [Image]  Deuxième projet            [✏️] [🗑️]  │   │
│  │        ...                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  (drag & drop pour réordonner — poignée ⣿ à gauche)        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

FORMULAIRE (Sheet latéral — ajout/édition) :
┌──────────────────────────────────────────────────────────────┐
│  Nouveau projet                                       [ ✕ ]  │
├──────────────────────────────────────────────────────────────┤
│  Nom du projet     [________________________________]        │
│  Description       [________________________________]        │
│                    [________________________________]        │
│  Image             [Choisir un fichier]                      │
│                    (max 5Mo — JPG/PNG/WebP)                  │
│  Stack tech        [___________] [+ Ajouter]                 │
│                    [React ✕] [TypeScript ✕]                  │
│  Lien GitHub       [https://github.com/___________]         │
│  Lien Démo         [https://___________________]            │
│                                                              │
│             [ Annuler ]  [ 💾 Enregistrer ]                  │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 3 — Expériences

```
┌──────────────────────────────────────────────────────────────┐
│  Expériences                       [ + Nouvelle expérience ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⣿  Lead Developer — Acme Corp        [✏️] [🗑️]   │   │
│  │     Jan 2024 → Présent                               │   │
│  │     Description du poste...                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⣿  Flutter Dev — StartupCI            [✏️] [🗑️]   │   │
│  │     Juin 2022 → Déc 2023                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘

FORMULAIRE (Sheet latéral) :
┌──────────────────────────────────────────────────────────────┐
│  Nouvelle expérience                                  [ ✕ ]  │
├──────────────────────────────────────────────────────────────┤
│  Poste / Rôle      [________________________________]        │
│  Entreprise        [________________________________]        │
│  Date de début     [MM/AAAA]                                 │
│  Date de fin       [MM/AAAA]   [●] Poste actuel             │
│  Description       [________________________________]        │
│                    [________________________________]        │
│                                                              │
│             [ Annuler ]  [ 💾 Enregistrer ]                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard Startup (`type: startup`)

> **État** : 🔜 Planifié Mois 3 (startups.ivoire.io)  
> **URL publique vitrine** : `[slug].ivoire.io` (fiche startup)

### Sidebar — Navigation

```
📌 Navigation
├── 🏠  Vue d'ensemble      ← actif par défaut
├── 🚀  Ma Startup
├── 👥  Équipe
├── 💡  Projets & Produits
└── 📊  Statistiques        (premium)

📌 Footer sidebar
├── 🔗  Voir ma vitrine    (→ slug.ivoire.io)
├── ⭐  Passer en Premium
└── ⬅️  Déconnexion
```

### Onglet 1 — Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│  Vue d'ensemble                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  👁️ 234          │  │  🔗 12           │  │  ⭐ 47      │ │
│  │  Visites profil  │  │  Clics liens    │  │  Favoris    │ │
│  │  ce mois         │  │  ce mois        │  │  total      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                              │
│  ┌──── COMPLÉTION DU PROFIL ─────────────────────────────┐ │
│  │                                                        │ │
│  │  Profil complété à 65%                                │ │
│  │  [████████████░░░░░░░░░░░░]                            │ │
│  │                                                        │ │
│  │  ✅ Infos de base      ✅ Logo                        │ │
│  │  ✅ Description        ❌ Équipe (0 membre)           │ │
│  │  ❌ Liens réseaux      ❌ Produit ajouté              │ │
│  │                                                        │ │
│  │  [ Compléter mon profil → ]                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── ACTIONS RAPIDES ───────────────────────────────────┐ │
│  │                                                        │ │
│  │  [ ✏️ Modifier ma startup ]  [ 👥 Ajouter un membre ] │ │
│  │  [ 💡 Ajouter un produit  ]  [ 📣 Partager ma fiche ] │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 2 — Ma Startup

```
┌──────────────────────────────────────────────────────────────┐
│  Ma Startup                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── IDENTITÉ ──────────────────────────────────────────┐ │
│  │                                                        │ │
│  │   ┌──────────┐   Nom de la startup                    │ │
│  │   │          │   [________________________________]   │ │
│  │   │  LOGO    │                                        │ │
│  │   │  128px   │   Tagline (1 phrase)                   │ │
│  │   └──────────┘   [________________________________]   │ │
│  │   [Changer logo]                                      │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── DESCRIPTION ───────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Secteur d'activité  [Fintech ▾]                      │ │
│  │  Stade               [Pré-seed ▾]                     │ │
│  │  Ville               [Abidjan ▾]                      │ │
│  │  Année de création   [2024]                           │ │
│  │  Nombre d'employés   [1-10 ▾]                         │ │
│  │                                                        │ │
│  │  Description longue                                   │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ (texte libre, 8 lignes)                        │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── LIENS ─────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Site web       [https://____________________]        │ │
│  │  Product Hunt   [https://producthunt.com/____]        │ │
│  │  LinkedIn       [https://linkedin.com/company/___]   │ │
│  │  Twitter/X      [https://twitter.com/___________]    │ │
│  │  GitHub         [https://github.com/___________]     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── RECHERCHE EN COURS ────────────────────────────────┐ │
│  │                                                        │ │
│  │  ☑ Cherche des co-fondateurs                         │ │
│  │  ☑ Cherche des développeurs                          │ │
│  │  ☐ Cherche des investisseurs                         │ │
│  │  ☐ Cherche des clients / early adopters              │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                          [ 💾 Enregistrer les modifications ] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 3 — Équipe

```
┌──────────────────────────────────────────────────────────────┐
│  Équipe                                  [ + Ajouter membre ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Avatar]  Jean Dupont                  [✏️] [🗑️]  │   │
│  │            Co-fondateur & CTO                        │   │
│  │            🔗 linkedin.com/in/jean  · GitHub         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Avatar]  Marie Koné                   [✏️] [🗑️]  │   │
│  │            Head of Design                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 Les membres liés à un profil ivoire.io s'affichent      │
│     avec leur avatar et leur lien portfolio automatiquement. │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 4 — Projets & Produits

```
┌──────────────────────────────────────────────────────────────┐
│  Produits & Projets               [ + Ajouter un produit ]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Image]  MonApp CI                     [✏️] [🗑️]  │   │
│  │           Mobile banking pour la CI                  │   │
│  │           [React Native] [Node.js]                   │   │
│  │           🌐 monapp.ci  · 🍎 App Store · 🤖 PlayStore│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 5 — Statistiques (Premium 🔒)

```
┌──────────────────────────────────────────────────────────────┐
│  Statistiques                                    [⭐ Premium] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔒  Cette fonctionnalité est réservée aux membres    │  │
│  │      Premium.                                         │  │
│  │                                                       │  │
│  │  Avec Premium, accédez à :                           │  │
│  │  ✓ Visites de profil (courbe 30 jours)               │  │
│  │  ✓ Clics sur vos liens                               │  │
│  │  ✓ Pays des visiteurs                                │  │
│  │  ✓ Entreprises qui ont consulté votre profil         │  │
│  │                                                       │  │
│  │          [ ⭐ Passer en Premium — 5$/mois ]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard Entreprise (`type: enterprise`)

> **État** : 🔜 Planifié Mois 4  
> **URL publique** : `[slug].ivoire.io` (vitrine entreprise certifiée)

### Sidebar — Navigation

```
📌 Navigation
├── 🏠  Vue d'ensemble
├── 🏢  Mon Entreprise
├── 💼  Offres d'emploi
├── 🔍  Recherche de talents
├── 📨  Messages reçus
└── 📊  Analytics            (inclus dans Enterprise)

📌 Footer sidebar
├── 🔗  Voir ma vitrine     (→ slug.ivoire.io)
├── 🏅  Badge certifié ✓
└── ⬅️  Déconnexion
```

### Onglet 1 — Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│  Vue d'ensemble                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │  💼 3              │  │  👁️ 1 204         │  │  📨 8    │ │
│  │  Offres actives    │  │  Visites ce mois │  │  Messages│ │
│  └───────────────────┘  └──────────────────┘  └──────────┘ │
│                                                              │
│  ┌──── DERNIERS TALENTS VUS ───────────────────────────────┐ │
│  │                                                        │ │
│  │  [Avatar] Ulrich K.  — Flutter Dev  ⭐ Recommandé     │ │
│  │  [Avatar] Fatou D.   — React Dev    🟢 Disponible     │ │
│  │  [Avatar] Yapi B.    — DevOps       🟢 Disponible     │ │
│  │                                                        │ │
│  │  [ Voir tous les talents → ]                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── MES OFFRES D'EMPLOI ───────────────────────────────┐ │
│  │                                                        │ │
│  │  Développeur Flutter  —  Abidjan  —  🟢 Active       │ │
│  │  Data Engineer        —  Remote   —  🟢 Active       │ │
│  │  Designer UI/UX        —  Abidjan  —  ⭕ Expirée     │ │
│  │                                                        │ │
│  │  [ + Publier une offre ]                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 2 — Mon Entreprise

```
┌──────────────────────────────────────────────────────────────┐
│  Mon Entreprise                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── IDENTITÉ ──────────────────────────────────────────┐ │
│  │  [Logo 128px]   Nom entreprise [_________________]    │ │
│  │  [Changer]      Secteur        [Fintech ▾]            │ │
│  │                 Taille         [50-200 employés ▾]    │ │
│  │                 Année création [2018]                 │ │
│  │                 Ville          [Abidjan]              │ │
│  │                 🏅 Badge certifié ivoire.io           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── DESCRIPTION ───────────────────────────────────────┐ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ Description de l'entreprise (10 lignes)        │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │  Site web     [https://____________________]         │ │
│  │  LinkedIn     [https://linkedin.com/company/___]    │ │
│  │  Twitter/X    [https://twitter.com/____________]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── TECHNOLOGIES UTILISÉES ────────────────────────────┐ │
│  │  [Flutter ✕] [Python ✕] [AWS ✕]  [+ Ajouter]         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                          [ 💾 Enregistrer les modifications ] │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 3 — Offres d'emploi

```
┌──────────────────────────────────────────────────────────────┐
│  Offres d'emploi                       [ + Publier une offre] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Développeur Flutter         🟢 Active   [✏️] [🗑️] │   │
│  │  Abidjan · CDI · 800k-1.2M FCFA                     │   │
│  │  Publié il y a 3 jours · 12 candidats               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  FORMULAIRE (Sheet latéral) :                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Titre du poste    [______________________]          │   │
│  │  Type              [CDI ▾] / [CDD ▾] / [Freelance ▾]│   │
│  │  Localisation      [Abidjan] / [Remote] / [Hybride] │   │
│  │  Salaire           [De ______] [à ______] FCFA      │   │
│  │  Compétences req.  [___________] [+ Ajouter]        │   │
│  │  Description       [_________________________]      │   │
│  │  Date limite       [JJ/MM/AAAA]                     │   │
│  │                                                      │   │
│  │     [ Annuler ]     [ 💾 Publier l'offre ]          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 4 — Recherche de talents

```
┌──────────────────────────────────────────────────────────────┐
│  Recherche de Talents                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher par nom, compétence...             ]      │
│                                                              │
│  Filtres : [Techno ▾] [Ville ▾] [Disponible ▾] [Trier ▾]   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Avatar]  Ulrich Kouamé    🟢 Disponible           │   │
│  │            Lead Developer · Abidjan                  │   │
│  │            [Flutter] [Dart] [Firebase]               │   │
│  │            [ 🔗 Voir portfolio ] [ 📩 Contacter ]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  (Liste paginée — 20 profils par page)                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Dashboard Autre (`type: other`)

> **Usage** : fondateurs non-tech, community managers, étudiants, etc.  
> **Dashboard simplifié** — pas de projets/expériences, profil généraliste.

### Sidebar — Navigation

```
📌 Navigation
├── 👤  Mon Profil          ← actif par défaut
└── 🔗  Ma Présence en ligne

📌 Footer sidebar
├── 🔗  Voir mon profil public
└── ⬅️  Déconnexion
```

### Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  Mon Profil                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── PHOTO ─────────────────────────────────────────────┐ │
│  │   [Avatar 128px]   [ Changer la photo ]               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── INFORMATIONS ──────────────────────────────────────┐ │
│  │  Nom complet   [________________________________]      │ │
│  │  Titre / Rôle  [________________________________]      │ │
│  │               ex: Community Manager, Étudiant...       │ │
│  │  Ville         [________________________________]      │ │
│  │  Bio           [________________________________]      │ │
│  │                [________________________________]      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── LIENS ─────────────────────────────────────────────┐ │
│  │  LinkedIn  [https://linkedin.com/in/______]            │ │
│  │  Twitter   [https://twitter.com/___________]           │ │
│  │  Site web  [https://____________________]              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── CENTRES D'INTÉRÊT ─────────────────────────────────┐ │
│  │  [Tech ✕] [Design ✕] [Marketing ✕]  [+ Ajouter]      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                          [ 💾 Enregistrer les modifications ] │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Dashboard Admin (rôle: `admin`)

> **Accès** : `admin.ivoire.io/dashboard` (sous-domaine réservé)  
> **Authentification** : Supabase Auth + vérification `is_admin = true` dans profil  
> **SÉCURITÉ** : RLS strict côté Supabase — aucun endpoint admin accessible sans token service_role

### Sidebar Admin — Navigation

```
📌 Vue générale
├── 📊  Dashboard général

📌 Utilisateurs
├── 👥  Tous les profils
├── ⏳  Waitlist
└── 🚫  Comptes suspendus

📌 Contenu
├── 🚀  Startups listées
├── 💼  Offres d'emploi
└── 📨  Messages de contact

📌 Modération
├── 🔍  Signalements
└── ✅  Validation de profils

📌 Plateforme
├── ⚙️  Configuration
├── 📈  Analytics
└── 💳  Abonnements (Premium)

📌 Footer sidebar
└── ⬅️  Déconnexion
```

### Onglet 1 — Dashboard Général

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard Admin                                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ 👥 1 247     │ │ 🚀 34        │ │ ⏳ 89              │  │
│  │ Profils auth.│ │ Startups     │ │ Waitlist           │  │
│  │ +12 ce mois  │ │ +3 ce mois   │ │ À convertir        │  │
│  └──────────────┘ └──────────────┘ └────────────────────┘  │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ 💼 6         │ │ 📨 23        │ │ 🚨 2               │  │
│  │ Offres jobs  │ │ Messages     │ │ Signalements        │  │
│  │ actives      │ │ non lus      │ │ en attente         │  │
│  └──────────────┘ └──────────────┘ └────────────────────┘  │
│                                                              │
│  ┌──── INSCRIPTIONS (30 derniers jours) ────────────────┐   │
│  │                                                      │   │
│  │  ▂▃▅▇▆▃▂▄▆▇█▇▅▄▃▂▃▅▆▇▆▄▃▂▃▅▇▆▃  (courbe)          │   │
│  │  Jan ──────────────────────── Mar                   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──── ACTIVITÉ RÉCENTE ─────────────────────────────────┐  │
│  │                                                       │  │
│  │  🟢  ulrich.ivoire.io  —  Profil créé  — il y a 2h  │  │
│  │  🟢  fatou.ivoire.io   —  Profil créé  — il y a 5h  │  │
│  │  🔵  TechCI            —  Startup ajoutée —  hier   │  │
│  │  🟡  jean@test.ci      —  Waitlist inscrit — hier   │  │
│  │  🔴  spammer@mail.com  —  Compte signalé  — hier    │  │
│  │                                                       │  │
│  │  [ Voir tout le log d'activité → ]                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 2 — Gestion des Profils

```
┌──────────────────────────────────────────────────────────────┐
│  Tous les profils                         [ + Exporter CSV ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher par nom, email, slug...           ]       │
│  Filtre : [Tous ▾] [developer ▾] [startup ▾] [enterprise ▾] │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Avatar │ Nom             │ Email          │ Type    │ Statut │ Actions │
│  ├─────────┼─────────────────┼────────────────┼─────────┼────────┼─────────┤
│  │  [img]  │ Ulrich Kouamé   │ ul@mail.ci     │ dev     │ ✅ actif│ ⚙️ 🚫 │
│  │  [img]  │ Fatou Diallo    │ fa@mail.ci     │ dev     │ ✅ actif│ ⚙️ 🚫 │
│  │  [img]  │ TechCI          │ tech@ci.com    │ startup │ ✅ actif│ ⚙️ 🚫 │
│  │  [img]  │ Spam Account    │ sp@spam.biz    │ other   │ 🚫 susp │ ✅ 🗑️ │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Page 1 / 104   [ ← ]  1  2  3  ...  104  [ → ]            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 3 — Waitlist

```
┌──────────────────────────────────────────────────────────────┐
│  Waitlist                                                    │
│  89 inscrits en attente d'activation                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Nom            │ Email          │ Slug désiré │ Type │ Date │ Actions │
│  ├─────────────────┼────────────────┼─────────────┼──────┼──────┼─────────┤
│  │  Jean Koné      │ je@mail.ci     │ jean        │ dev  │ 13/3 │ [✅ Activer] │
│  │  Acme Corp      │ hr@acme.ci     │ acme        │ ent. │ 12/3 │ [✅ Activer] │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [ ✅ Inviter tous (batch) ]  [ 📧 Envoyer email de rappel ] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 4 — Modération / Signalements

```
┌──────────────────────────────────────────────────────────────┐
│  Modération & Signalements                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🚨  spammer@mail.com  signalé par 2 utilisateurs   │   │
│  │      Motif : "Contenu trompeur"                     │   │
│  │      [ 👁️ Voir profil ]  [ 🚫 Suspendre ]  [ ✅ OK ]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──── VALIDATION DE PROFILS ENTREPRISE ─────────────────┐  │
│  │                                                       │  │
│  │  Ces entreprises ont demandé le badge certifié 🏅 :  │  │
│  │                                                       │  │
│  │  [Logo]  Acme Corp  —  Documents fournis             │  │
│  │          [ 👁️ Voir documents ] [ 🏅 Certifier ] [ 🗑️]│  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 5 — Analytics Plateforme

```
┌──────────────────────────────────────────────────────────────┐
│  Analytics Plateforme                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Période : [7 jours ▾] / [30 jours ▾] / [3 mois ▾]         │
│                                                              │
│  ┌──── TRAFIC GLOBAL ─────────────────────────────────────┐ │
│  │  Visiteurs uniques : 5 234  (+12% vs mois dernier)    │ │
│  │  Pages vues        : 18 402                            │ │
│  │  Rebond            : 34%                               │ │
│  │                                                        │ │
│  │  Top pages :                                           │ │
│  │  1. ivoire.io          — 3 402 visites                │ │
│  │  2. devs.ivoire.io     — 1 889 visites                │ │
│  │  3. ulrich.ivoire.io   —   445 visites                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── ABONNEMENTS PREMIUM ───────────────────────────────┐ │
│  │  Abonnés actifs : 23   MRR : 115 $/mois               │ │
│  │  Nouveaux ce mois : 5  Churns : 1                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Onglet 6 — Configuration

```
┌──────────────────────────────────────────────────────────────┐
│  Configuration Plateforme                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── INSCRIPTIONS ──────────────────────────────────────┐ │
│  │  Mode d'inscription                                   │ │
│  │  [●] Sur invitation (waitlist)                        │ │
│  │  [ ] Ouvert à tous                                    │ │
│  │                                                        │ │
│  │  Email de bienvenue    [●] Activé  [ ] Désactivé      │ │
│  │  Email de contact      [●] Activé  [ ] Désactivé      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── SLUGS RÉSERVÉS ────────────────────────────────────┐ │
│  │  www, mail, api, admin, app, devs, startups,          │ │
│  │  jobs, learn, health, data, events, invest,           │ │
│  │  blog, docs, status                                   │ │
│  │                                                        │ │
│  │  [ + Ajouter un slug réservé ]                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── TARIFS PREMIUM ────────────────────────────────────┐ │
│  │  Dev Premium    [5] $/mois                             │ │
│  │  Enterprise     [30] $/mois                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                          [ 💾 Enregistrer la configuration ] │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Navigation / Sidebar Commune

### Règles de rendu conditionnel

```typescript
// Logique de sélection du dashboard selon le type de profil
switch (profile.type) {
  case "developer":   → DashboardDeveloper  (tabs: profil, projets, expériences)
  case "startup":     → DashboardStartup    (tabs: overview, startup, équipe, produits, stats)
  case "enterprise":  → DashboardEnterprise (tabs: overview, entreprise, offres, talents, messages)
  case "other":       → DashboardOther      (tabs: profil)
  default:            → DashboardOther
}

// Admin : vérification séparée
if (isAdmin) → DashboardAdmin  (accessible sur admin.ivoire.io)
```

### Éléments communs à TOUS les dashboards

| Élément | Détail |
|---|---|
| Logo **ivoire.io** | Lien vers la landing page |
| Avatar + nom + email | Sidebar header, lecture seule |
| Bouton **Voir ma vitrine** | Ouvre `slug.ivoire.io` nouvelle fenêtre |
| Bouton **Déconnexion** | `supabase.auth.signOut()` + redirect `/login` |
| Toast notifications | Confirmations actions (save, erreur, succès) |
| **Thème sombre** | Fond `#0a0a0a`, orange `#FF6B00`, cohérent avec la charte |

---

## RÉSUMÉ COMPARATIF

| Feature | Dev | Startup | Enterprise | Other | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Édition profil perso | ✅ | ✅ | ✅ | ✅ | — |
| Gestion projets | ✅ | ✅ | — | — | — |
| Gestion expériences | ✅ | — | — | — | — |
| Gestion équipe | — | ✅ | — | — | — |
| Offres d'emploi | — | — | ✅ | — | — |
| Recherche talents | — | — | ✅ | — | ✅ |
| Analytics perso | 🔒 | 🔒 | ✅ | — | ✅ |
| Gestion waitlist | — | — | — | — | ✅ |
| Modération | — | — | — | — | ✅ |
| Configuration plateforme | — | — | — | — | ✅ |
| Badge certifié | — | — | ✅ | — | — |
