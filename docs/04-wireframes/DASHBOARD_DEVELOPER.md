# 📐 DASHBOARD DÉVELOPPEUR — Spécification Complète 100%

> **Type** : `developer`  
> **URL Dashboard** : `ivoire.io/dashboard`  
> **URL Publique** : `[slug].ivoire.io`  
> **État** : MVP implémenté — ce document couvre la version finale complète  

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble (Overview)](#1-vue-densemble)
2. [Mon Profil](#2-mon-profil)
3. [Projets](#3-projets)
4. [Expériences](#4-expériences)
5. [Messages](#5-messages)
6. [Statistiques](#6-statistiques)
7. [Paramètres](#7-paramètres)
8. [Sélection de Template](#8-sélection-de-template)
9. [Emploi & Candidatures](#9-emploi--candidatures)

---

## SIDEBAR — Navigation Complète

```
┌────────────────────────────────┐
│  [logo] ivoire.io              │
│                                │
│  ┌──────────┐                  │
│  │  Avatar  │ Ulrich Kouamé    │
│  │  64px    │ ul@mail.ci       │
│  └──────────┘                  │
│  🟢 Disponible                 │
│                                │
│──────────────────────────────│
│  📌 GÉNÉRAL                   │
│  ├── 🏠  Vue d'ensemble       │
│  ├── 👤  Mon Profil           │
│  └── 🎨  Template             │
│                                │
│  📌 CONTENU                   │
│  ├── 💼  Projets              │
│  └── 🕐  Expériences         │
│                                │
│  📌 INTERACTIONS              │
│  ├── 📨  Messages  (3)        │
│  └── 📊  Statistiques         │
│                                │
│  📌 EMPLOI                    │
│  ├── 💼  Offres (5)           │
│  ├── 📩  Mes candidatures (2) │
│  └── 📅  Entretiens  (1)     │
│                                │
│  📌 COMPTE                    │
│  ├── ⚙️  Paramètres           │
│  ├── 🔗  Voir mon portfolio   │
│  └── ⬅️  Déconnexion          │
│                                │
│══════════════════════════════│
│  🌐 IVOIRE.IO                 │
│  ├── 🧑‍💻  Talents              │
│  ├── 🚀  Startups             │
│  ├── 💼  Emploi               │
│  ├── 📚  Apprendre            │
│  ├── 🎪  Événements           │
│  ├── 💰  Investir             │
│  ├── 📊  Data                 │
│  ├── ✍️  Blog                 │
│  └── 🏥  S.O.S Santé          │
│══════════════════════════════│
│                                │
└────────────────────────────────┘
```

---

## 1. VUE D'ENSEMBLE

> Page d'accueil du dashboard — snapshot rapide de l'activité.

```
┌──────────────────────────────────────────────────────────────┐
│  Vue d'ensemble                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bonjour, Ulrich 👋                                         │
│  Voici un résumé de ton activité sur ivoire.io               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👁️  342      │  │ 🔗  28       │  │ 📨  3        │      │
│  │ Visites      │  │ Clics liens  │  │ Messages     │      │
│  │ ce mois      │  │ ce mois      │  │ non lus      │      │
│  │ ↑ +18%       │  │ ↑ +9%        │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 💼  6        │  │ 🕐  4        │  │ ⭐  12       │      │
│  │ Projets      │  │ Expériences  │  │ Favoris      │      │
│  │ publiés      │  │ listées      │  │ reçus        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── COMPLÉTION DU PROFIL ─────────────────────────────┐  │
│  │                                                        │  │
│  │  Profil complété à 85%                                │  │
│  │  [█████████████████░░░░]                               │  │
│  │                                                        │  │
│  │  ✅ Photo de profil     ✅ Bio                        │  │
│  │  ✅ Titre & Ville       ✅ Compétences (8)            │  │
│  │  ✅ Liens sociaux (3/4) ❌ Site web manquant          │  │
│  │  ✅ Projets (6)         ❌ Ajouter 1+ expérience      │  │
│  │                                                        │  │
│  │  💡 Conseil : Les profils complets reçoivent 3x       │  │
│  │     plus de visites. Ajoute ton site web !            │  │
│  │                                                        │  │
│  │  [ Compléter mon profil → ]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── VISITES (30 derniers jours) ───────────────────────┐  │
│  │                                                        │  │
│  │  350│                                                  │  │
│  │     │        ▄▄                                       │  │
│  │  250│   ▄▄  ████  ▄▄                                 │  │
│  │     │  ████ ████ ████ ▄▄                              │  │
│  │  150│  ████ ████ ████ ████ ▄▄                         │  │
│  │     │ █████ ████ ████ ████ ████                        │  │
│  │   50│ █████ ████ ████ ████ ████                        │  │
│  │     └─────────────────────────────                     │  │
│  │     S1    S2    S3    S4    S5                         │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── ACTIVITÉ RÉCENTE ──────────────────────────────────┐  │
│  │                                                        │  │
│  │  📨  Nouveau message de Marie Koné — il y a 2h       │  │
│  │  👁️  12 nouvelles visites aujourd'hui                 │  │
│  │  ⭐  Ton profil a été ajouté en favoris — hier       │  │
│  │  🔗  3 clics sur ton lien GitHub — hier              │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── ACTIONS RAPIDES ───────────────────────────────────┐  │
│  │                                                        │  │
│  │  [ ✏️ Modifier profil ]  [ 💼 Ajouter un projet ]     │  │
│  │  [ 📣 Partager mon portfolio ]  [ 🔗 Copier le lien ] │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. MON PROFIL

> Formulaire d'édition complet du profil développeur.

```
┌──────────────────────────────────────────────────────────────┐
│  Mon Profil                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── PHOTO DE PROFIL ──────────────────────────────────┐  │
│  │                                                        │  │
│  │   ┌──────────┐                                        │  │
│  │   │          │   [ 📷 Changer la photo ]              │  │
│  │   │  Avatar  │   JPG, PNG, WebP — max 2 Mo            │  │
│  │   │  128px   │                                        │  │
│  │   └──────────┘   (Aperçu temps réel)                  │  │
│  │                   [ ✅ Confirmer ]  [ ✕ Annuler ]      │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── INFORMATIONS PERSONNELLES ────────────────────────┐  │
│  │                                                        │  │
│  │  Nom complet *       [_________________________]      │  │
│  │  Slug                [ulrich].ivoire.io  🔒 fixé      │  │
│  │  Titre / Rôle        [_________________________]      │  │
│  │                      ex: Lead Developer, Freelance     │  │
│  │  Ville               [_________________________]      │  │
│  │                      ex: Abidjan, Bouaké               │  │
│  │  Bio                                                  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ (texte libre, max 300 caractères)              │  │  │
│  │  │                                                │  │  │
│  │  │                                                │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  243 / 300 caractères                                 │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── LIENS SOCIAUX ─────────────────────────────────────┐  │
│  │                                                        │  │
│  │  🐙 GitHub     [https://github.com/__________]       │  │
│  │  💼 LinkedIn   [https://linkedin.com/in/______]      │  │
│  │  🐦 Twitter/X  [https://twitter.com/___________]     │  │
│  │  🌐 Site web   [https://____________________]        │  │
│  │                                                        │  │
│  │  (validation URL en temps réel — ✅ ou ❌)            │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── COMPÉTENCES ───────────────────────────────────────┐  │
│  │                                                        │  │
│  │  [Flutter ✕] [Dart ✕] [Firebase ✕] [Next.js ✕]       │  │
│  │  [TypeScript ✕] [Go ✕] [React ✕] [Supabase ✕]       │  │
│  │                                                        │  │
│  │  [____________________________] [ + Ajouter ]         │  │
│  │                                                        │  │
│  │  💡 Suggestions : Python, Java, Kotlin, Swift...      │  │
│  │  (max 15 compétences — 8/15 utilisées)                │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── DISPONIBILITÉ ──────────────────────────────────────┐  │
│  │                                                        │  │
│  │  Statut actuel :                                      │  │
│  │  [●] 🟢 Disponible — ouvert aux opportunités         │  │
│  │  [ ] 🟡 En mission — disponible bientôt               │  │
│  │  [ ] 🔴 Non disponible                                │  │
│  │                                                        │  │
│  │  (Affiché sur l'annuaire devs.ivoire.io)              │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                          [ 💾 Enregistrer les modifications ] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. PROJETS

> Gestion complète des projets affichés sur le portfolio.

### Liste des projets

```
┌──────────────────────────────────────────────────────────────┐
│  Projets (6)                          [ + Nouveau projet ]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚡ Glisse les cartes pour réordonner l'affichage           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⣿ ┌──────┐ ivoire.io                    [✏️] [🗑️] │   │
│  │   │ img  │ L'OS Digital de la Côte d'Ivoire         │   │
│  │   └──────┘ [Next.js] [Supabase] [TypeScript]        │   │
│  │            🐙 GitHub  · 🌐 ivoire.io                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⣿ ┌──────┐ SOS Santé                    [✏️] [🗑️] │   │
│  │   │ img  │ App d'urgences médicales en CI           │   │
│  │   └──────┘ [Flutter] [Dart] [Firebase]              │   │
│  │            🐙 GitHub  · 📱 Play Store               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⣿ ┌──────┐ Mon API REST                 [✏️] [🗑️] │   │
│  │   │ img  │ API Gateway en Go                       │   │
│  │   └──────┘ [Go] [PostgreSQL] [Docker]               │   │
│  │            🐙 GitHub                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  (drag & drop par la poignée ⣿ pour réordonner)            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Formulaire Projet (Sheet latéral)

```
┌──────────────────────────────────────────────────────────────┐
│  Nouveau projet                                       [ ✕ ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nom du projet *    [________________________________]      │
│                                                              │
│  Description                                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ (texte libre, max 500 caractères)                  │    │
│  │                                                    │    │
│  │                                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Image / Screenshot                                         │
│  ┌─────────────────────────────┐                            │
│  │   Glisser une image ici     │                            │
│  │   ou [Parcourir]            │                            │
│  │   max 5 Mo — JPG/PNG/WebP   │                            │
│  └─────────────────────────────┘                            │
│  (Aperçu si image sélectionnée)                             │
│                                                              │
│  Stack technique                                             │
│  [React ✕] [TypeScript ✕]                                   │
│  [____________________________] [ + Ajouter ]               │
│                                                              │
│  Lien GitHub       [https://github.com/___________]         │
│  Lien Démo         [https://___________________]            │
│                                                              │
│             [ Annuler ]  [ 💾 Enregistrer ]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. EXPÉRIENCES

### Liste des expériences

```
┌──────────────────────────────────────────────────────────────┐
│  Expériences (4)                   [ + Nouvelle expérience ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⣿  Lead Developer — Acme Corp         [✏️] [🗑️]   │   │
│  │    📅 Janvier 2024 → Présent  🟢 ACTUEL             │   │
│  │    Développement de la plateforme principale en      │   │
│  │    Flutter et construction de l'API en Go.           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⣿  Flutter Developer — StartupCI      [✏️] [🗑️]   │   │
│  │    📅 Juin 2022 → Décembre 2023                     │   │
│  │    App mobile de livraison. 50k+ téléchargements.    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⣿  Développeur Junior — AgenceWeb     [✏️] [🗑️]   │   │
│  │    📅 Mars 2021 → Mai 2022                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⣿  Stage — Ministère du Digital       [✏️] [🗑️]   │   │
│  │    📅 Sept 2020 → Fév 2021                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Formulaire Expérience (Sheet latéral)

```
┌──────────────────────────────────────────────────────────────┐
│  Nouvelle expérience                                  [ ✕ ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Poste / Rôle *     [________________________________]      │
│  Entreprise *       [________________________________]      │
│                                                              │
│  Date de début *    [MM] / [AAAA]                           │
│                                                              │
│  [●] Poste actuel (J'y travaille encore)                    │
│  Date de fin        [MM] / [AAAA]   (grisé si actuel)      │
│                                                              │
│  Description                                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ (texte libre, max 500 caractères)                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│             [ Annuler ]  [ 💾 Enregistrer ]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. MESSAGES

> Messages reçus via le formulaire de contact du portfolio public.

```
┌──────────────────────────────────────────────────────────────┐
│  Messages (12)                    Filtrer : [Tous ▾] [Non lus]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔵  Marie Koné  <marie@tech.ci>       il y a 2h   │   │
│  │      "Bonjour Ulrich, je suis recruteur chez..."     │   │
│  │                                                      │   │
│  │      [ 📖 Lire ]  [ 📧 Répondre par email ]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔵  Jean Traoré  <jean@startup.ci>    il y a 6h   │   │
│  │      "Super portfolio ! On cherche un dev Flutter..." │   │
│  │                                                      │   │
│  │      [ 📖 Lire ]  [ 📧 Répondre par email ]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔵  RH Acme Corp  <hr@acme.ci>      hier          │   │
│  │      "Nous avons une opportunité CDI à Abidjan..."   │   │
│  │                                                      │   │
│  │      [ 📖 Lire ]  [ 📧 Répondre par email ]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚪  Fatou Diallo  <fatou@mail.ci>     il y a 3j   │   │
│  │      "Salut, on s'est croisé au hackathon..."        │   │
│  │      ✅ Lu                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Page 1 / 2    [ ← ]  1  2  [ → ]                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Détail d'un message

```
┌──────────────────────────────────────────────────────────────┐
│  ← Retour aux messages                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  De : Marie Koné  <marie@tech.ci>                           │
│  Reçu : 14 mars 2026, 10:32                                │
│                                                              │
│  ─────────────────────────────────────────────────────      │
│                                                              │
│  Bonjour Ulrich,                                            │
│                                                              │
│  Je suis recruteur chez TechCI et votre profil sur          │
│  ivoire.io nous a beaucoup intéressé. Nous cherchons        │
│  un Lead Developer Flutter pour un projet mobile             │
│  ambitieux.                                                  │
│                                                              │
│  Seriez-vous disponible pour un échange cette semaine ?     │
│                                                              │
│  Cordialement,                                               │
│  Marie Koné                                                  │
│                                                              │
│  ─────────────────────────────────────────────────────      │
│                                                              │
│  [ 📧 Répondre par email ]  [ 🗑️ Supprimer ]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. STATISTIQUES

> Analytics du portfolio public — données de fréquentation.  
> **Niveau gratuit** : stats de base (30 jours).  
> **Premium** : stats détaillées + export + historique complet.

```
┌──────────────────────────────────────────────────────────────┐
│  Statistiques                Période : [7j] [30j] [90j] [1an]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👁️  342      │  │ 🧑‍🤝‍🧑 189      │  │ ⏱️  2m 34s    │      │
│  │ Visites      │  │ Visiteurs    │  │ Durée moy.  │      │
│  │ totales      │  │ uniques      │  │ session     │      │
│  │ ↑ +18%       │  │ ↑ +12%       │  │ ↑ +5%       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 🔗  28       │  │ 📨  3        │  │ ⭐  12       │      │
│  │ Clics liens  │  │ Messages     │  │ Favoris      │      │
│  │ totaux       │  │ reçus        │  │ reçus        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── COURBE DE VISITES ─────────────────────────────────┐ │
│  │                                                        │ │
│  │  60│                     ╱╲                            │ │
│  │    │            ╱╲      ╱  ╲    ╱╲                    │ │
│  │  40│     ╱╲    ╱  ╲    ╱    ╲  ╱  ╲                  │ │
│  │    │    ╱  ╲  ╱    ╲  ╱      ╲╱    ╲                 │ │
│  │  20│   ╱    ╲╱      ╲╱              ╲                │ │
│  │    │  ╱                              ╲               │ │
│  │   0│ ╱                                               │ │
│  │    └───┬───┬───┬───┬───┬───┬───┬───┬                │ │
│  │     14/2  21/2 28/2  7/3  14/3                       │ │
│  │                                                        │ │
│  │  ── Visites    ── Visiteurs uniques                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── TOP LIENS CLIQUÉS ─────────────────────────────────┐ │
│  │                                                        │ │
│  │  1. 🐙 GitHub           — 14 clics  (50%)            │ │
│  │  2. 💼 LinkedIn         — 8 clics   (29%)            │ │
│  │  3. 🌐 Projet ivoire.io — 4 clics   (14%)            │ │
│  │  4. 🐦 Twitter/X        — 2 clics   (7%)             │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── TOP PROJETS CONSULTÉS ─────────────────────────────┐ │
│  │                                                        │ │
│  │  1. ivoire.io       — 87 vues  — 6 clics démo        │ │
│  │  2. SOS Santé       — 54 vues  — 12 clics Play Store │ │
│  │  3. Mon API REST    — 32 vues  — 3 clics GitHub      │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── PROVENANCE DES VISITEURS ──────────────────────────┐ │
│  │                                                        │ │
│  │  🇨🇮 Côte d'Ivoire    — 67%  ████████████████         │ │
│  │  🇫🇷 France            — 14%  ████                     │ │
│  │  🇸🇳 Sénégal           — 8%   ██                       │ │
│  │  🇺🇸 États-Unis        — 5%   █                        │ │
│  │  🌍 Autres             — 6%   ██                       │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── SOURCES DE TRAFIC ──────────────────────────────────┐ │
│  │                                                        │ │
│  │  🔍 Recherche Google   — 34%                          │ │
│  │  🔗 Lien direct        — 28%                          │ │
│  │  💼 LinkedIn            — 22%                          │ │
│  │  🐦 Twitter/X          — 10%                          │ │
│  │  📱 Autres              — 6%                           │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔒 Premium : Accédez aux stats détaillées           │  │
│  │     ✓ Entreprises qui ont vu votre profil            │  │
│  │     ✓ Export CSV des données                         │  │
│  │     ✓ Historique complet (> 90 jours)                │  │
│  │     ✓ Alertes : "Votre profil a été vu par X"        │  │
│  │                                                       │  │
│  │     [ ⭐ Passer en Premium — 3 000 FCFA/mois ]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. PARAMÈTRES

```
┌──────────────────────────────────────────────────────────────┐
│  Paramètres                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── COMPTE ────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Email              ul@mail.ci   🔒 (via Supabase)    │ │
│  │  Slug               ulrich.ivoire.io  🔒 définitif   │ │
│  │  Membre depuis      14 mars 2026                      │ │
│  │  Type de compte     Développeur  (Gratuit)            │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── NOTIFICATIONS ─────────────────────────────────────┐ │
│  │                                                        │ │
│  │  📨 Email quand je reçois un message                  │ │
│  │     [●] Activé  [ ] Désactivé                         │ │
│  │                                                        │ │
│  │  📊 Rapport hebdomadaire de stats                     │ │
│  │     [●] Activé  [ ] Désactivé                         │ │
│  │                                                        │ │
│  │  📣 Nouveautés ivoire.io                              │ │
│  │     [●] Activé  [ ] Désactivé                         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── CONFIDENTIALITÉ ───────────────────────────────────┐ │
│  │                                                        │ │
│  │  Profil visible dans l'annuaire devs.ivoire.io        │ │
│  │     [●] Oui  [ ] Non (portfolio accessible mais pas   │ │
│  │                       listé dans l'annuaire)           │ │
│  │                                                        │ │
│  │  Afficher mon email sur le portfolio                   │ │
│  │     [ ] Oui  [●] Non (formulaire de contact à la place)│ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── ABONNEMENT ────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Plan actuel : 🆓 Gratuit                             │ │
│  │                                                        │ │
│  │  ┌─────────┐  ┌──────────────┐                        │ │
│  │  │ Gratuit │  │ ⭐ Premium   │                        │ │
│  │  │ ✓ actuel│  │ 3 000 F/mois │                        │ │
│  │  │         │  │              │                        │ │
│  │  │ 5 proj. │  │ ∞ projets   │                        │ │
│  │  │ Stats   │  │ Stats avancées│                       │ │
│  │  │ basiques│  │ Badge vérifié│                        │ │
│  │  │ 1 templ.│  │ 10+ templates│                        │ │
│  │  │         │  │ Export PDF   │                        │ │
│  │  │         │  │ Priorité     │                        │ │
│  │  │         │  │ annuaire     │                        │ │
│  │  └─────────┘  └──────────────┘                        │ │
│  │                                                        │ │
│  │           [ ⭐ Passer en Premium ]                     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── ZONE DANGEREUSE ───────────────────────────────────┐ │
│  │                                                        │ │
│  │  [ 📥 Exporter mes données (JSON) ]                   │ │
│  │                                                        │ │
│  │  [ 🗑️ Supprimer mon compte ]                          │ │
│  │  ⚠️ Cette action est irréversible. Ton slug sera      │ │
│  │     libéré et ton portfolio supprimé.                  │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. SÉLECTION DE TEMPLATE

> Le développeur peut choisir le design de sa page portfolio publique.

```
┌──────────────────────────────────────────────────────────────┐
│  Template                              Actuel : Minimal Dark  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Choisis le design de ta page portfolio publique.            │
│  🔗 Aperçu en direct sur ulrich.ivoire.io                   │
│                                                              │
│  ┌──── TEMPLATES GRATUITS ────────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ ╔═════════╗ │  │ ╔═════════╗ │  │ ╔═════════╗ │   │ │
│  │  │ ║ Preview ║ │  │ ║ Preview ║ │  │ ║ Preview ║ │   │ │
│  │  │ ║ Minimal ║ │  │ ║ Classic ║ │  │ ║ Dev     ║ │   │ │
│  │  │ ║ Dark    ║ │  │ ║ Light   ║ │  │ ║ Terminal║ │   │ │
│  │  │ ╚═════════╝ │  │ ╚═════════╝ │  │ ╚═════════╝ │   │ │
│  │  │ ✅ Actuel    │  │ [Activer]   │  │ [Activer]   │   │ │
│  │  │ Minimal Dark │  │ Classic     │  │ Terminal    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── TEMPLATES PREMIUM ⭐ ──────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ ╔═════════╗ │  │ ╔═════════╗ │  │ ╔═════════╗ │   │ │
│  │  │ ║ Preview ║ │  │ ║ Preview ║ │  │ ║ Preview ║ │   │ │
│  │  │ ║ Glassmr ║ │  │ ║ Bento   ║ │  │ ║ Gradient║ │   │ │
│  │  │ ║  ⭐     ║ │  │ ║   ⭐    ║ │  │ ║   ⭐    ║ │   │ │
│  │  │ ╚═════════╝ │  │ ╚═════════╝ │  │ ╚═════════╝ │   │ │
│  │  │ 🔒 Premium  │  │ 🔒 Premium  │  │ 🔒 Premium  │   │ │
│  │  │ Glassmorphism│  │ Bento Grid  │  │ Gradient    │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ ╔═════════╗ │  │ ╔═════════╗ │  │ ╔═════════╗ │   │ │
│  │  │ ║Spotlight║ │  │ ║ Neon    ║ │  │ ║Brutalist║ │   │ │
│  │  │ ║   ⭐    ║ │  │ ║   ⭐    ║ │  │ ║   ⭐    ║ │   │ │
│  │  │ ╚═════════╝ │  │ ╚═════════╝ │  │ ╚═════════╝ │   │ │
│  │  │ 🔒 Premium  │  │ 🔒 Premium  │  │ 🔒 Premium  │   │ │
│  │  │ Spotlight   │  │ Neon Cyber  │  │ Brutalist   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                        │ │
│  │  ┌─────────────┐                                      │ │
│  │  │ ╔═════════╗ │                                      │ │
│  │  │ ║ Ivoirien║ │                                      │ │
│  │  │ ║   ⭐    ║ │                                      │ │
│  │  │ ╚═════════╝ │                                      │ │
│  │  │ 🔒 Premium  │                                      │ │
│  │  │ Ivoirien 🇨🇮 │                                      │ │
│  │  └─────────────┘                                      │ │
│  │                                                        │ │
│  │  [ ⭐ Débloquer tous les templates — 3 000 F/mois ]   │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── APERÇU EN DIRECT ──────────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌────────────────────────────────────────────────┐   │ │
│  │  │ 🔴🟡🟢  ulrich.ivoire.io                      │   │ │
│  │  ├────────────────────────────────────────────────┤   │ │
│  │  │                                                │   │ │
│  │  │    (Aperçu interactif du template               │   │ │
│  │  │     avec les vraies données du profil)          │   │ │
│  │  │                                                │   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  │                                                        │ │
│  │  [ 👁️ Voir en plein écran ]  [ ✅ Appliquer ]        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. EMPLOI & CANDIDATURES

> **Perspective candidat** : Le développeur accède aux offres de `jobs.ivoire.io` directement depuis son dashboard.
> Il peut postuler, suivre ses candidatures, planifier ses entretiens et rejoindre des visios — tout sans quitter son espace.

### 9.1 Offres recommandées

```
┌──────────────────────────────────────────────────────────────┐
│  💼 Offres recommandées pour toi                   5 nouvelles │
│  Basé sur : [React] [Node.js] [TypeScript] · Abidjan       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🏢 Acme Corp                           ⭐ 95% match   │   │
│  │                                                        │   │
│  │  Développeur Full-Stack React / Node.js              │   │
│  │  📍 Abidjan · 💼 CDI · 💰 500K-800K FCFA/mois            │   │
│  │  [React] [Node.js] [TypeScript] [PostgreSQL]          │   │
│  │  📅 Expire le 15/04 · 📨 12 candidatures               │   │
│  │                                                        │   │
│  │  [ 📩 Postuler ]  [ 🔗 Voir détails ]  [ 🔖 Sauvegarder ]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🚀 TechCI                              ⭐ 87% match   │   │
│  │                                                        │   │
│  │  Lead Frontend React                                  │   │
│  │  📍 Remote · 💼 CDI · 💰 700K-1M FCFA/mois               │   │
│  │  [React] [TypeScript] [Next.js]                        │   │
│  │                                                        │   │
│  │  [ 📩 Postuler ]  [ 🔗 Voir détails ]  [ 🔖 Sauvegarder ]│   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ... (3 autres offres)                                      │
│                                                              │
│  Tri : [Pertinence ▾] [Récent ▾] [Salaire ▾]               │
│  [ 🔍 Voir toutes les offres  → jobs.ivoire.io ]            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Postuler (Sheet latéral)

```
┌──────────────────────────────────────────────────────────────┐
│  📩 Postuler — Dév Full-Stack React / Node.js       [ ✕ ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── TON PROFIL (envoyé automatiquement) ─────────────┐ │
│  │                                                      │ │
│  │  [Avatar] Ulrich Kouamé                              │ │
│  │  ulrich.ivoire.io                                    │ │
│  │  React, Node.js, TypeScript • 4 ans • Abidjan        │ │
│  │  ⭐ 95% match avec cette offre                        │ │
│  │                                                      │ │
│  │  ℹ️ Pas besoin de CV — ton profil ivoire.io suffit ! │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
│  Message de motivation (optionnel) :                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Bonjour, je suis très intéressé par ce poste.       │  │
│  │ Mon expérience en React/Node depuis 4 ans            │  │
│  │ correspond parfaitement au profil recherché...       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Disponibilité pour entretien :                             │
│  (●) Dès que possible                                       │
│  ( ) À partir du : [__/__/____]                             │
│                                                              │
│           [ Annuler ]  [ 📩 Envoyer ma candidature ]         │
│                                                              │
│  💡 Le recruteur verra ton profil complet ivoire.io,        │
│     tes projets et tes expériences. Pas de CV à upload.     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Mes candidatures (suivi)

```
┌──────────────────────────────────────────────────────────────┐
│  📩 Mes candidatures (4)              Tri : [Récent ▾]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🏢 Acme Corp — Dév Full-Stack React         🟢 95%   │   │
│  │  Postulé le 12/03 · CDI · Abidjan                     │   │
│  │                                                        │   │
│  │  Statut : 📅 ENTRETIEN PLANIFIÉ                         │   │
│  │  📅 Jeu 20 mars · 14:00 – 14:45 · Visio ivoire.io      │   │
│  │                                                        │   │
│  │  [ 🎬 Rejoindre la visio ]  [ 💬 Message ]            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🚀 TechCI — Lead Frontend React              🟡 87%   │   │
│  │  Postulé le 10/03 · CDI · Remote                      │   │
│  │                                                        │   │
│  │  Statut : 📖 EN REVUE                                  │   │
│  │  Le recruteur examine ton profil...                     │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🏢 DataCo — Data Engineer Python               🟡 72%   │   │
│  │  Postulé le 05/03 · Freelance · Abidjan               │   │
│  │                                                        │   │
│  │  Statut : ❌ REFUSÉE                                    │   │
│  │  "Le profil ne correspond pas au poste."               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🏢 WebAgency — Dev React Senior              🟢 91%   │   │
│  │  Postulé le 01/03 · CDI · Abidjan                     │   │
│  │                                                        │   │
│  │  Statut : 🎉 PROPOSITION REÇUE !                       │   │
│  │  Salaire : 700 000 FCFA/mois · CDI · Télétravail      │   │
│  │                                                        │   │
│  │  [ ✅ Accepter ] [ 💬 Négocier ] [ ❌ Décliner ]      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ── LÉGENDE DES STATUTS ──                                   │
│  📩 Envoyée → 📖 En revue → 📅 Entretien → 🎉 Proposition   │
│                             └→ ❌ Refusée                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.4 Entretiens & Visio

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Mes entretiens                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── À VENIR ──                                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📅 Jeu 20 mars · 14:00 – 14:45                          │   │
│  │  🏢 Acme Corp — Dév Full-Stack React                    │   │
│  │  🎬 Visio ivoire.io (lien généré automatiquement)      │   │
│  │                                                        │   │
│  │  ⏰ Rappel : dans 3 jours                               │   │
│  │                                                        │   │
│  │  [ 🎬 Rejoindre ] [ 📅 Ajouter au calendrier (iCal) ]  │   │
│  │  [ 💬 Envoyer un message ] [ ❌ Annuler ]               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ── PASSÉS ──                                                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📅 Mar 11 mars · 10:00 – 10:45                         │   │
│  │  🏢 WebAgency — Dev React Senior          ✅ Réalisé  │   │
│  │  → Proposition reçue !                                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.5 Visioconférence (écran candidat)

```
┌──────────────────────────────────────────────────────────────┐
│  🎬 Entretien visio — Acme Corp                  [🔴 LIVE]  │
│  Poste : Dév Full-Stack React / Node.js                     │
│  Durée : 00:18:32                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────┐│
│  │                              │  │                      ││
│  │     [Webcam Recruteur]       │  │   [Webcam Moi]       ││
│  │                              │  │                      ││
│  │                              │  │                      ││
│  └──────────────────────────────┘  └──────────────────────┘│
│                                                              │
│  ┌──── BARRE D'OUTILS ────────────────────────────────────┐  │
│  │  [🎙️ Micro] [📹 Caméra] [🖥️ Partage écran]              │  │
│  │  [💬 Chat]  [✋ Lever la main]    [🔴 Raccrocher]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── INFOS ENTRETIEN (panneau latéral) ────────────────┐ │
│  │                                                      │ │
│  │  🏢 Acme Corp                                        │ │
│  │  Poste : Dév Full-Stack React / Node.js             │ │
│  │  Type : CDI · Abidjan                                │ │
│  │  Salaire : 500K – 800K FCFA/mois                     │ │
│  │                                                      │ │
│  │  📝 Notes personnelles :                              │ │
│  │  ┌────────────────────────────────────────────────┐ │ │
│  │  │ (espace libre pour notes pendant l'entretien) │ │ │
│  │  └────────────────────────────────────────────────┘ │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.6 Propositions reçues

```
┌──────────────────────────────────────────────────────────────┐
│  🎉 Propositions reçues (1)                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🎉 Félicitations ! Proposition de WebAgency              │   │
│  │                                                        │   │
│  │  Poste : Dev React Senior                              │   │
│  │  Type : CDI · Début : 01/05/2026                       │   │
│  │  Salaire : 700 000 FCFA/mois                           │   │
│  │  Avantages : Télétravail hybride, Assurance santé,     │   │
│  │             Formation continue                         │   │
│  │                                                        │   │
│  │  Message du recruteur :                                │   │
│  │  "Ulrich, nous avons été impressionnés par votre       │   │
│  │   entretien et votre parcours..."                      │   │
│  │                                                        │   │
│  │  [ ✅ Accepter ]  [ 💬 Négocier ]  [ ❌ Décliner ]    │   │
│  │                                                        │   │
│  │  ⚠️ Répondre avant le 28/03/2026                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### API Emploi (côté développeur)

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/jobs/recommended` | GET | Offres recommandées (matching) |
| `/api/jobs/[id]` | GET | Détail d'une offre |
| `/api/jobs/[id]/apply` | POST | Postuler à une offre |
| `/api/jobs/applications` | GET | Mes candidatures (toutes) |
| `/api/jobs/applications/[id]` | GET | Détail d'une candidature + statut |
| `/api/jobs/applications/[id]/schedule/confirm` | POST | Confirmer un créneau d'entretien |
| `/api/jobs/applications/[id]/meeting` | GET | Obtenir le lien visio |
| `/api/jobs/applications/[id]/offer` | GET | Détail de la proposition |
| `/api/jobs/applications/[id]/offer/respond` | POST | Accepter / Négocier / Décliner |
| `/api/jobs/saved` | GET / POST / DELETE | Offres sauvegardées |

---

## DONNÉES ET API — Endpoints Dev

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/dashboard/profile` | GET / PUT | Lire / mettre à jour le profil |
| `/api/dashboard/avatar` | POST | Upload avatar |
| `/api/dashboard/projects` | GET / POST | Lire / créer projets |
| `/api/dashboard/projects/[id]` | PUT / DELETE | Modifier / supprimer projet |
| `/api/dashboard/experiences` | GET / POST | Lire / créer expériences |
| `/api/dashboard/experiences/[id]` | PUT / DELETE | Modifier / supprimer expérience |
| `/api/dashboard/messages` | GET | Lire les messages reçus |
| `/api/dashboard/messages/[id]` | PUT / DELETE | Marquer lu / supprimer |
| `/api/dashboard/stats` | GET | Statistiques du portfolio |
| `/api/dashboard/template` | GET / PUT | Lire / changer de template |
| `/api/dashboard/settings` | GET / PUT | Préférences et notifications |
| `/api/dashboard/export` | GET | Exporter données JSON |
| `/api/dashboard/account` | DELETE | Supprimer le compte |

---

## RÉSUMÉ DES FONCTIONNALITÉS — GRATUIT vs PREMIUM

| Fonctionnalité | 🆓 Gratuit | ⭐ Premium |
|---|:---:|:---:|
| Portfolio public | ✅ | ✅ |
| Profil complet | ✅ | ✅ |
| Projets | 5 max | ∞ |
| Expériences | ∞ | ∞ |
| Messages | ✅ | ✅ |
| Stats basiques (30 jours) | ✅ | ✅ |
| Stats avancées (pays, entreprises) | ❌ | ✅ |
| Historique stats > 90 jours | ❌ | ✅ |
| Export CSV/JSON stats | ❌ | ✅ |
| Templates | 3 gratuits | 10+ tous |
| Badge "Vérifié" | ❌ | ✅ |
| Priorité dans l'annuaire | ❌ | ✅ |
| Export PDF du portfolio | ❌ | ✅ |
| Alertes visiteurs | ❌ | ✅ |
| Offres recommandées (emploi) | ✅ | ✅ |
| Candidatures & suivi | ✅ | ✅ |
| Entretiens visio intégrés | ✅ | ✅ |
| Matching % avancé (offres) | ❌ | ✅ |
