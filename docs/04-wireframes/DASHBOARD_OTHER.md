# 📐 DASHBOARD AUTRE (OTHER) — Spécification Complète 100%

> **Type** : `other`  
> **Usage** : Fondateurs non-tech, community managers, designers, étudiants, recruteurs indépendants, freelances non-dev, etc.  
> **URL Dashboard** : `ivoire.io/dashboard`  
> **URL Publique** : `[slug].ivoire.io` (profil personnel simplifié)

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Mon Profil](#2-mon-profil)
3. [Liens & Présence en ligne](#3-liens--présence-en-ligne)
4. [Messages](#4-messages)
5. [Statistiques](#5-statistiques)
6. [Template](#6-template)
7. [Paramètres](#7-paramètres)
8. [Explorer l'écosystème](#8-explorer-lécosystème)

---

## SIDEBAR — Navigation

```
┌────────────────────────────────┐
│  [logo] ivoire.io              │
│                                │
│  ┌──────────┐                  │
│  │  Avatar  │ Jean Koné        │
│  │  64px    │ jean@mail.ci     │
│  └──────────┘                  │
│  👤 Profil personnel           │
│                                │
│──────────────────────────────│
│  📌 GÉNÉRAL                   │
│  ├── 🏠  Vue d'ensemble       │
│  ├── 👤  Mon Profil           │
│  └── 🎨  Template             │
│                                │
│  📌 PRÉSENCE                  │
│  ├── 🔗  Liens                │
│  └── 📨  Messages  (1)        │
│                                │
│  📌 COMPTE                    │
│  ├── 📊  Statistiques         │
│  ├── ⚙️  Paramètres           │
│  ├── 🔗  Voir mon profil      │
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

```
┌──────────────────────────────────────────────────────────────┐
│  Vue d'ensemble                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bonjour, Jean 👋                                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👁️  56       │  │ 🔗  8        │  │ 📨  1        │      │
│  │ Visites      │  │ Clics liens  │  │ Message      │      │
│  │ ce mois      │  │ ce mois      │  │ non lu       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── COMPLÉTION DU PROFIL ─────────────────────────────┐  │
│  │                                                        │  │
│  │  Profil complété à 60%                                │  │
│  │  [████████████░░░░░░░░]                                │  │
│  │                                                        │  │
│  │  ✅ Photo de profil     ✅ Nom & titre                │  │
│  │  ✅ Bio                 ❌ Liens sociaux (1/3)        │  │
│  │  ❌ Centres d'intérêt                                 │  │
│  │                                                        │  │
│  │  💡 Un profil complet est plus visible dans la        │  │
│  │     communauté ivoire.io.                             │  │
│  │                                                        │  │
│  │  [ Compléter mon profil → ]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── ACTIONS RAPIDES ───────────────────────────────────┐  │
│  │                                                        │  │
│  │  [ ✏️ Modifier profil ]  [ 🔗 Gérer mes liens ]       │  │
│  │  [ 📣 Partager mon profil ]  [ 📋 Copier le lien ]    │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── ACTIVITÉ ──────────────────────────────────────────┐  │
│  │                                                        │  │
│  │  📨  Message de startup@mail.ci — il y a 1 jour      │  │
│  │  👁️  8 visites cette semaine                          │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── CHANGER DE TYPE ───────────────────────────────────┐  │
│  │                                                        │  │
│  │  Tu es développeur, fondateur de startup ou            │  │
│  │  représentant d'une entreprise ?                       │  │
│  │                                                        │  │
│  │  Passe sur un type de profil adapté pour débloquer    │  │
│  │  plus de fonctionnalités :                             │  │
│  │                                                        │  │
│  │  [ 🧑‍💻 Développeur ] [ 🚀 Startup ] [ 🏢 Entreprise ] │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. MON PROFIL

```
┌──────────────────────────────────────────────────────────────┐
│  Mon Profil                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── PHOTO DE PROFIL ──────────────────────────────────┐  │
│  │                                                        │  │
│  │   ┌──────────┐                                        │  │
│  │   │  Avatar  │   [ 📷 Changer la photo ]              │  │
│  │   │  128px   │   JPG, PNG, WebP — max 2 Mo            │  │
│  │   └──────────┘                                        │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── INFORMATIONS ──────────────────────────────────────┐  │
│  │                                                        │  │
│  │  Nom complet *       [_________________________]      │  │
│  │  Slug                [jean].ivoire.io  🔒 fixé        │  │
│  │                                                        │  │
│  │  Titre / Rôle        [_________________________]      │  │
│  │                      ex: Community Manager, Étudiant,  │  │
│  │                      Designer, Recruteur, Fondateur... │  │
│  │                                                        │  │
│  │  Ville               [_________________________]      │  │
│  │                                                        │  │
│  │  Bio                                                  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ (max 300 caractères)                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── CENTRES D'INTÉRÊT ─────────────────────────────────┐  │
│  │                                                        │  │
│  │  [Tech ✕] [Design ✕] [Marketing ✕] [Éducation ✕]     │  │
│  │                                                        │  │
│  │  [____________________________] [ + Ajouter ]         │  │
│  │                                                        │  │
│  │  Suggestions : Tech · Business · Design · Marketing · │  │
│  │  Éducation · Santé · Finance · Média · Art ·          │  │
│  │  Agriculture · Sport · Environnement                  │  │
│  │                                                        │  │
│  │  (max 10 intérêts)                                    │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                          [ 💾 Enregistrer les modifications ] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. LIENS & PRÉSENCE EN LIGNE

> Linktree-like : une page de liens personnalisable.

```
┌──────────────────────────────────────────────────────────────┐
│  Mes liens                              [ + Ajouter un lien ]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  💡 Ces liens s'affichent sur ta page publique             │
│     jean.ivoire.io (comme un Linktree).                    │
│                                                              │
│  ┌──── RÉSEAUX SOCIAUX ───────────────────────────────────┐ │
│  │                                                        │ │
│  │  💼 LinkedIn   [https://linkedin.com/in/jean__]       │ │
│  │  🐦 Twitter/X  [https://twitter.com/jean_____]       │ │
│  │  📸 Instagram  [https://instagram.com/jean___]       │ │
│  │  🌐 Site web   [https://____________________]        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── LIENS PERSONNALISÉS ───────────────────────────────┐ │
│  │                                                        │ │
│  │  ⣿  Mon CV PDF          → drive.google.com/...  [🗑️] │ │
│  │  ⣿  Mon portfolio Behance → behance.net/...     [🗑️] │ │
│  │  ⣿  Ma newsletter       → substack.com/...      [🗑️] │ │
│  │                                                        │ │
│  │  (drag & drop pour réordonner)                        │ │
│  │                                                        │ │
│  │  [ + Ajouter un lien personnalisé ]                   │ │
│  │  Titre  [________________]                            │ │
│  │  URL    [https://_________]                           │ │
│  │  [ ✅ Ajouter ]                                       │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                          [ 💾 Enregistrer ]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. MESSAGES

```
┌──────────────────────────────────────────────────────────────┐
│  Messages (3)                                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  (Identique au module messages développeur —                │
│   messages reçus via le formulaire de contact               │
│   de la page publique)                                      │
│                                                              │
│  🔵  startup@mail.ci — "Votre profil nous intéresse" — 1j │
│  ⚪  dev@mail.ci — "Salut !" — 3j ✅ Lu                    │
│  ⚪  investor@fund.ci — "Événement tech" — 5j ✅ Lu         │
│                                                              │
│  [ 📖 Lire ] [ 📧 Répondre par email ]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. STATISTIQUES

```
┌──────────────────────────────────────────────────────────────┐
│  Statistiques               Période : [7j] [30j]            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👁️  56       │  │ 🔗  8        │  │ 📨  3        │      │
│  │ Visites      │  │ Clics liens  │  │ Messages     │      │
│  │ ce mois      │  │ ce mois      │  │ reçus        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── TOP LIENS CLIQUÉS ──────────────────────────────────┐ │
│  │  1. LinkedIn — 4 clics                                 │ │
│  │  2. CV PDF — 3 clics                                   │ │
│  │  3. Twitter — 1 clic                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  (Stats basiques — limité à 30 jours)                       │
│                                                              │
│  🔒 Passe en type Développeur ou Startup pour accéder      │
│     aux statistiques avancées + Premium.                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. TEMPLATE

```
┌──────────────────────────────────────────────────────────────┐
│  Template                      Actuel : Link Page Dark       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── TEMPLATES GRATUITS ────────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ Link Page   │  │ Bio Card    │  │ Simple      │   │ │
│  │  │ Dark        │  │ Light       │  │ Centered    │   │ │
│  │  │ ✅ Actuel   │  │ [Activer]   │  │ [Activer]   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── APERÇU ────────────────────────────────────────────┐ │
│  │  (Aperçu interactif de la page publique)               │ │
│  │  [ 👁️ Plein écran ]  [ ✅ Appliquer ]                │ │
│  └────────────────────────────────────────────────────────┘ │
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
│  │  Email           jean@mail.ci  🔒                      │ │
│  │  Slug            jean.ivoire.io  🔒                    │ │
│  │  Type            Autre (Gratuit)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── CHANGER DE TYPE ───────────────────────────────────┐ │
│  │                                                        │ │
│  │  Actuel : 👤 Autre (profil personnel)                 │ │
│  │                                                        │ │
│  │  Changez pour débloquer plus de fonctionnalités :     │ │
│  │  [ 🧑‍💻 Devenir Développeur ]  → Projets, expériences  │ │
│  │  [ 🚀 Devenir Startup ]      → Produits, équipe       │ │
│  │  [ 🏢 Devenir Entreprise ]   → Offres, recrutement    │ │
│  │                                                        │ │
│  │  ⚠️ Ce changement est irréversible sans contacter     │ │
│  │     le support.                                        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── NOTIFICATIONS ─────────────────────────────────────┐ │
│  │  📨 Email quand message reçu  [●] Oui [ ] Non        │ │
│  │  📣 Nouveautés ivoire.io      [●] Oui [ ] Non        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── CONFIDENTIALITÉ ───────────────────────────────────┐ │
│  │  Profil visible publiquement  [●] Oui [ ] Non        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── ZONE DANGEREUSE ───────────────────────────────────┐ │
│  │  [ 📥 Exporter mes données ] [ 🗑️ Supprimer compte ]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ENDPOINTS API OTHER

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/dashboard/profile` | GET / PUT | Infos profil |
| `/api/dashboard/avatar` | POST | Upload avatar |
| `/api/dashboard/links` | GET / POST / PUT / DELETE | Liens personnalisés |
| `/api/dashboard/messages` | GET | Messages reçus |
| `/api/dashboard/messages/[id]` | PUT / DELETE | Marquer lu / supprimer |
| `/api/dashboard/stats` | GET | Stats basiques |
| `/api/dashboard/template` | GET / PUT | Template |
| `/api/dashboard/settings` | GET / PUT | Paramètres |
| `/api/dashboard/change-type` | POST | Changer de type de profil |

---

## 8. EXPLORER L'ÉCOSYSTÈME

> Le profil "Autre" n'a pas de pipeline recrutement intégré, mais accède à
> tout l'écosystème via le **Hub Central** (sidebar + Launchpad).
> S'il veut postuler à des offres → il est invité à **changer de type de profil** vers `developer`.
> S'il veut recruter → invité à passer en `startup` ou `enterprise`.

```
┌──────────────────────────────────────────────────────────────┐
│  🌐 Explorer ivoire.io                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 🧑‍💻        │ │ 🚀        │ │ 💼        │ │ 📚        │      │
│  │ Talents  │ │ Startups │ │ Emploi   │ │Apprendre │      │
│  │ 🟢 Live  │ │ 🟡 Beta  │ │ 🟡 Beta  │ │ 🔴 Soon  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
│  ── VOUS VOULEZ FAIRE PLUS ? ──                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🧑‍💻 Vous êtes développeur ?                               │   │
│  │  Passez en profil "Développeur" pour :                  │   │
│  │  • Postuler aux offres d'emploi                         │   │
│  │  • Afficher vos projets et compétences                 │   │
│  │  • Apparaître dans l'annuaire devs.ivoire.io           │   │
│  │  • Recevoir des offres de recruteurs                   │   │
│  │  [ 🔄 Changer mon profil → Développeur ]               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🚀 Vous gérez une startup / entreprise ?                │   │
│  │  Passez en profil "Startup" ou "Entreprise" pour :    │   │
│  │  • Publier des offres d'emploi                         │   │
│  │  • Gérer un pipeline de recrutement complet            │   │
│  │  • Planifier des entretiens + visio intégrée           │   │
│  │  • Envoyer des propositions d'embauche                 │   │
│  │  [ 🔄 Changer mon profil → Startup / Entreprise ]      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```
