# 🎯 STRATÉGIE PLATEFORME — ivoire.io

> **Ce document répond à 5 questions stratégiques fondamentales.**  
> C'est le **garde-fou** de tout le projet : chaque décision produit doit passer par ces principes.  
> **Mis à jour** : 14 mars 2026

---

## TABLE DES MATIÈRES

1. [Valeur ajoutée — Ce qui nous différencie](#1-valeur-ajoutée--ce-qui-nous-différencie)
2. [Hub Central — Accès à tous les portails depuis le dashboard](#2-hub-central--accès-à-tous-les-portails-depuis-le-dashboard)
3. [Pipeline Recrutement End-to-End](#3-pipeline-recrutement-end-to-end)
4. [UX Unifiée — L'Effet "Wow"](#4-ux-unifiée--leffet-wow)
5. [Framework Anti-Hors-Sujet](#5-framework-anti-hors-sujet)

---

## 1. VALEUR AJOUTÉE — Ce qui nous différencie

### Le problème qu'on résout

Un développeur ivoirien aujourd'hui :
- A un profil LinkedIn (mondial, noyé dans la masse, pas pensé pour la CI)
- A un GitHub (technique, pas accessible aux recruteurs non-tech)
- A peut-être un site perso (cher, long à maintenir, 0 visibilité)
- Cherche un emploi sur Emploi.ci (UX datée, pas tech-focused)
- N'a aucun endroit qui **unifie** son identité professionnelle côté locale

### Ce qu'ivoire.io fait que personne d'autre ne fait

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  CONCURRENCE          vs.         ivoire.io                  │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  LinkedIn                         → Réseau mondial, pas      │
│  "Le réseau pro mondial"           local. Pas de portfolio.  │
│                                    Pas de .io. Pas de        │
│                                    Stack technique visible.  │
│                                                              │
│  ivoire.io                        → ulrich.ivoire.io =       │
│  "L'identité ivoirienne"          ton identité unique.       │
│                                    Portfolio + projets +     │
│                                    stack + disponibilité.    │
│                                    Pensé 100% CI.            │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  GitHub / GitLab                  → Technique pur. Pas       │
│  "Le code source"                  lisible par un RH ou      │
│                                    un client non-dev.        │
│                                                              │
│  ivoire.io                        → Tes projets présentés    │
│                                    visuellement avec         │
│                                    images, descriptions,     │
│                                    liens. Pour TOUT le monde.│
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Malt / Upwork                    → Freelance international. │
│  "Les marketplaces"                Commission 10-20%.         │
│                                    Pas de culture locale.    │
│                                                              │
│  ivoire.io                        → 0% commission. Paiement  │
│                                    Mobile Money (Wave,       │
│                                    Orange Money). Freelance  │
│                                    + CDI + Stage au même     │
│                                    endroit.                  │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Emploi.ci / Novojob              → Offres classiques,       │
│  "Les sites emploi"               pas tech-focused, UX      │
│                                    datée. Zéro pipeline.     │
│                                                              │
│  ivoire.io                        → Pipeline complet :       │
│                                    offre → candidature →     │
│                                    entretien → visio →       │
│                                    embauche. Tout interne.   │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  Product Hunt                     → International, en        │
│  "Le classement startups"          anglais. Pas de focus     │
│                                    Afrique / CI.             │
│                                                              │
│  ivoire.io                        → startups.ivoire.io =     │
│                                    le Product Hunt de la CI. │
│                                    Votes, classement, en     │
│                                    français, local.          │
│                                                              │
│  ──────────────────────────────────────────────────────────  │
│                                                              │
│  WordPress / Wix                  → Site à maintenir seul,   │
│  "Les constructeurs"               hébergement payant,       │
│                                    design à refaire,         │
│                                    pas d'écosystème.         │
│                                                              │
│  ivoire.io                        → slug.ivoire.io en 5 min.│
│                                    10 templates pros.        │
│                                    Hébergé, SSL, gratuit.    │
│                                    Tu mets à jour ton profil │
│                                    → le site se met à jour.  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Les 7 piliers de différenciation

| # | Pilier | Détail |
|---|---|---|
| **1** | 🆔 **Identité unique** | `slug.ivoire.io` — ton nom de domaine professionnel, gratuit, mémorable |
| **2** | 🇨🇮 **100% local** | Pensé pour la CI : Mobile Money, FCFA, villes CI, compétences locales, français |
| **3** | 🔄 **Tout-en-un** | Portfolio + emploi + startups + formation + événements = UN seul compte |
| **4** | 💰 **0% commission** | Pas de commission sur les mises en relation. Modèle freemium (premium = features avancées) |
| **5** | ⚡ **Simplicité** | Profil créé en 5 min. Pas de config serveur, pas de code, pas de maintenance |
| **6** | 🤝 **Communauté** | Annuaire vivant, votes startups, événements, mentorat — pas juste un outil passif |
| **7** | 🔗 **Écosystème unifié** | Ivoire ID : un compte, tous les portails. Aucune app à installer, tout dans le navigateur |

### La phrase qui résume tout

> **"ivoire.io est à la tech ivoirienne ce que .io est au monde tech — sauf que c'est 🇨🇮 Ivoire."**  
> Un écosystème entier sous un seul domaine. Ton identité. Ton emploi. Ta communauté. Tout ici.

---

## 2. HUB CENTRAL — Accès à tous les portails depuis le dashboard

### Le problème

L'utilisateur a un dashboard à `ivoire.io/dashboard`. Les portails sont sur des sous-domaines (`jobs.ivoire.io`, `startups.ivoire.io`, `learn.ivoire.io`...).  
**Comment il y accède sans connaître chaque URL ?**

### La solution : Le Hub / Launchpad

Un **Hub intégré dans la sidebar de CHAQUE dashboard** (dev, startup, enterprise, other) qui donne un accès direct à **tous les portails actifs**.

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
│  📌 MON ESPACE               │
│  ├── 🏠  Vue d'ensemble       │
│  ├── 👤  Mon Profil           │
│  ├── 💼  Projets              │
│  ├── 🕐  Expériences         │
│  ├── 📨  Messages             │
│  ├── 📊  Statistiques         │
│  ├── 🎨  Template             │
│  └── ⚙️  Paramètres           │
│                                │
│══════════════════════════════│
│  🌐 IVOIRE.IO                 │  ← NOUVEAU : HUB CENTRAL
│  ├── 🧑‍💻  Talents              │  → devs.ivoire.io
│  ├── 🚀  Startups             │  → startups.ivoire.io
│  ├── 💼  Emploi               │  → jobs.ivoire.io
│  ├── 📚  Apprendre            │  → learn.ivoire.io
│  ├── 🎪  Événements           │  → events.ivoire.io
│  ├── 💰  Investir             │  → invest.ivoire.io
│  ├── 📊  Data                 │  → data.ivoire.io
│  ├── ✍️  Blog                 │  → blog.ivoire.io
│  └── 🏥  S.O.S Santé          │  → health.ivoire.io
│══════════════════════════════│
│                                │
│  📌 FOOTER                    │
│  ├── 🔗  Mon portfolio        │
│  └── ⬅️  Déconnexion          │
│                                │
└────────────────────────────────┘
```

### Comportement du Hub

| Situation | Comportement |
|---|---|
| **Portail 🟢 PUBLIC** | Lien direct, cliquable, ouvre dans la même fenêtre |
| **Portail 🟡 BETA** | Lien + badge "BETA", accessible si autorisé par le flag |
| **Portail 🔴 OFF** | Affiché grisé + tooltip "Bientôt disponible" |
| **Notif sur un portail** | Badge compteur rouge (ex: `💼 Emploi (3)` = 3 nouvelles offres) |

### Vue étendue : Le Launchpad (alternative ou complément)

En plus de la sidebar, un **Launchpad** accessible via un bouton `[🌐]` dans la topbar :

```
┌──────────────────────────────────────────────────────────────┐
│  [☰] Vue d'ensemble                      [🌐] [🔔 3] [👤]  │
│                                            ↑                 │
│  ┌──────────────── LAUNCHPAD ─────────────────────────────┐ │
│  │                                                        │ │
│  │  Tout ivoire.io                                       │ │
│  │                                                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│ │
│  │  │ 🧑‍💻        │ │ 🚀        │ │ 💼        │ │ 📚        ││ │
│  │  │ Talents  │ │ Startups │ │ Emploi   │ │Apprendre ││ │
│  │  │ 🟢 Live  │ │ 🟡 Beta  │ │ 🟡 Beta  │ │ 🔴 Soon  ││ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│ │
│  │                                                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│ │
│  │  │ 🎪        │ │ 💰        │ │ 📊        │ │ ✍️        ││ │
│  │  │Événements│ │ Investir │ │ Data     │ │ Blog     ││ │
│  │  │ 🔴 Soon  │ │ 🔴 Soon  │ │ 🔴 Soon  │ │ 🟢 Live  ││ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│ │
│  │                                                        │ │
│  │  ┌──────────┐                                         │ │
│  │  │ 🏥        │ ← "Bientôt disponible"                 │ │
│  │  │  Santé   │                                         │ │
│  │  │ 🔴 Soon  │                                         │ │
│  │  └──────────┘                                         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Implémentation technique

| Élément | Détail |
|---|---|
| **Lecture flags** | Le Hub lit les feature flags pour savoir quoi afficher (🟢/🟡/🔴) |
| **Navigation** | Clic → `window.location.href = "https://jobs.ivoire.io"` (même session Ivoire ID) |
| **Notifications** | Un compteur par portail via l'API notifications unifiée |
| **Responsive** | Sur mobile, le Hub est accessible via le menu hamburger ou un tab "Explorer" en bottom nav |
| **Personnalisation** | L'utilisateur peut réordonner ses portails favoris (drag & drop) |

---

## 3. PIPELINE RECRUTEMENT END-TO-END

### Le problème actuel

Aujourd'hui, pour recruter un dev en CI :
1. L'entreprise poste sur Emploi.ci ou LinkedIn → 0 filtre tech
2. Reçoit des CV par email → pile de PDF ingérable
3. Planifie sur WhatsApp → "tu es dispo jeudi à 10h ?"
4. Fait la visio sur Google Meet / Zoom → app externe
5. Évalue sur papier → pas de trace
6. Envoie l'offre par email → pas de suivi

**6 outils différents, 0 cohérence, aucun suivi.**

### La solution ivoire.io : tout interne, de A à Z

```
      PIPELINE RECRUTEMENT — jobs.ivoire.io
      ═════════════════════════════════════

      ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
      │ 1.POSTE │───▶│2.CANDID.│───▶│3.AGENDA │───▶│4.VISIO  │───▶│5.OFFRE  │
      │ Publier │    │ Recevoir│    │Planifier│    │Rencontrer│   │ Conclure│
      └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
         │               │               │               │             │
  ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌──┴───────┐
  │ Formulaire  │ │ Kanban board│ │ Calendrier  │ │ Visio intégré│ │ Contrat  │
  │ offre       │ │ candidatures│ │ créneaux    │ │ (WebRTC)    │ │ & onboard│
  │ + filtres   │ │ + tri auto  │ │ + confirmé  │ │ + notes     │ │          │
  │ + AI match  │ │ + profil io │ │ + rappels   │ │ + recording │ │          │
  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘
```

### Étape 1 — Publier une offre

```
┌──────────────────────────────────────────────────────────────┐
│  💼 Publier une offre d'emploi                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Titre du poste :                                           │
│  [Développeur Full-Stack React / Node.js_______________]    │
│                                                              │
│  Type :                                                     │
│  (●) CDI  ( ) CDD  ( ) Freelance  ( ) Stage                │
│                                                              │
│  Localisation :                                             │
│  [Abidjan ▾]  [☑] Télétravail possible                     │
│                                                              │
│  Salaire (FCFA) :                                           │
│  [500 000] — [800 000] / mois  [☐] Ne pas afficher         │
│                                                              │
│  Compétences requises :                                     │
│  [React] [Node.js] [TypeScript] [PostgreSQL] [+Ajouter]    │
│                                                              │
│  Expérience :                                               │
│  (●) 2-5 ans  ( ) 0-2 ans  ( ) 5-10 ans  ( ) 10+ ans      │
│                                                              │
│  Description :                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Éditeur Markdown                                    │  │
│  │  ...                                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ── MATCHING INTELLIGENT ──                                 │
│  📊 Profils ivoire.io correspondants : **23 développeurs**  │
│  Les plus pertinents :                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [Avatar] ulrich.ivoire.io — 95% match              │  │
│  │  React, Node.js, TypeScript — 4 ans — Abidjan — 🟢  │  │
│  │  [Voir profil] [💬 Contacter directement]            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  [Avatar] fatou.ivoire.io — 87% match               │  │
│  │  React, Python, PostgreSQL — 3 ans — Abidjan — 🟢   │  │
│  │  [Voir profil] [💬 Contacter directement]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ 👁️ Prévisualiser ]  [ 📤 Publier l'offre ]             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Étape 2 — Recevoir & Trier les candidatures (Kanban)

```
┌──────────────────────────────────────────────────────────────┐
│  📋 Candidatures — Dev Full-Stack React/Node          12 📨  │
│  Vue : [Kanban ●] [Liste ○]     Tri : [Pertinence ▾]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  REÇUES (5)    │  EN REVUE (3)  │  ENTRETIEN (2) │ OFFRE (1)│
│  ─────────────│──────────────│──────────────│─────────────│
│  ┌───────────┐│ ┌───────────┐│ ┌───────────┐│ ┌──────────┐│
│  │ [Avatar]  ││ │ [Avatar]  ││ │ [Avatar]  ││ │ [Avatar] ││
│  │ Yapi K.   ││ │ Awa M.   ││ │ Ulrich K. ││ │ Fatou D. ││
│  │ 92% match ││ │ 85% match ││ │ 95% match ││ │ 87% match││
│  │ React,Node││ │ React,Vue ││ │ React,TS  ││ │ React,Py ││
│  │ 3 ans     ││ │ 2 ans     ││ │ 4 ans     ││ │ 3 ans    ││
│  │ ★★★★☆    ││ │ ★★★☆☆    ││ │ ★★★★★    ││ │ ★★★★☆   ││
│  │ [📄][💬]  ││ │ [📄][💬]  ││ │ [📄][💬]  ││ │ [📄][💬] ││
│  └───────────┘│ └───────────┘│ └───────────┘│ └──────────┘│
│  ┌───────────┐│ ┌───────────┐│ ┌───────────┐│             │
│  │ [Avatar]  ││ │ ...       ││ │ ...       ││             │
│  │ Jean P.   ││ │           ││ │           ││             │
│  │ ...       ││ │           ││ │           ││             │
│  └───────────┘│ └───────────┘│ └───────────┘│             │
│  ...          │              │              │             │
│               │              │              │  REFUSÉ (1) │
│               │              │              │ ───────────│
│               │              │              │ ┌──────────┐│
│               │              │              │ │ Marc L.  ││
│               │              │              │ │ 45% match││
│               │              │              │ └──────────┘│
│                                                              │
│  📄 = Voir profil ivoire.io (pas de CV PDF, le profil suffit)│
│  💬 = Envoyer un message via la messagerie interne           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Étape 3 — Planifier un entretien (Calendrier intégré)

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Planifier un entretien avec Ulrich K.                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── VOS DISPONIBILITÉS ──                                   │
│                                                              │
│  ┌──── MARS 2026 ────────────────────────────────────────┐ │
│  │  LUN   MAR   MER   JEU   VEN                         │ │
│  │                            14                         │ │
│  │   17    18    19    20    21                           │ │
│  │   24    25    26    27    28                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Créneaux proposés au candidat :                            │
│  [☑] Mar 18 mars · 10:00 – 10:45                           │
│  [☑] Jeu 20 mars · 14:00 – 14:45                           │
│  [☑] Ven 21 mars · 09:00 – 09:45                           │
│                                                              │
│  Durée : [45 min ▾]                                         │
│  Type : (●) Visio ivoire.io  ( ) En personne  ( ) Téléphone│
│                                                              │
│  Message au candidat :                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Bonjour Ulrich, nous aimerions vous rencontrer pour  │  │
│  │ discuter du poste de Dev Full-Stack. Merci de         │  │
│  │ choisir un créneau parmi ceux proposés.               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ 📤 Envoyer la proposition de créneau ]                   │
│                                                              │
│  ── CÔTÉ CANDIDAT (ce qu'il voit) ──                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔔 Acme Corp vous propose un entretien              │  │
│  │  Poste : Dev Full-Stack React / Node.js              │  │
│  │                                                      │  │
│  │  Choisissez un créneau :                             │  │
│  │  ( ) Mar 18 mars · 10:00 – 10:45                    │  │
│  │  (●) Jeu 20 mars · 14:00 – 14:45  ← sélectionné    │  │
│  │  ( ) Ven 21 mars · 09:00 – 09:45                    │  │
│  │                                                      │  │
│  │  [ ✅ Confirmer ce créneau ]                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ── AUTOMATISATIONS ──                                      │
│  ✅ Email de confirmation envoyé aux 2 parties              │
│  ✅ Rappel automatique J-1 et H-1                           │
│  ✅ Lien visio généré automatiquement                       │
│  ✅ Ajouté au calendrier (iCal exportable)                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Étape 4 — Visioconférence intégrée

```
┌──────────────────────────────────────────────────────────────┐
│  🎥 Entretien en cours — Ulrich K. × Acme Corp              │
│  Poste : Dev Full-Stack React / Node.js                      │
│  Durée : 00:23:45                              [🔴 LIVE]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────┐│
│  │                              │  │                      ││
│  │                              │  │    [Webcam            ││
│  │      [Webcam                 │  │     Recruteur]       ││
│  │       Candidat]              │  │                      ││
│  │                              │  │                      ││
│  │                              │  │                      ││
│  └──────────────────────────────┘  └──────────────────────┘│
│                                                              │
│  ┌──── BARRE D'OUTILS ──────────────────────────────────┐  │
│  │  [🎤 Micro] [📹 Caméra] [🖥️ Partage écran]           │  │
│  │  [💬 Chat] [⏺️ Enregistrer] [✋ Lever la main]        │  │
│  │  [📝 Notes d'entretien]     [🔴 Raccrocher]           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ── PANNEAU LATÉRAL (recruteur uniquement) ──              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  📋 Grille d'évaluation                               ││
│  │                                                        ││
│  │  Compétences techniques    [★★★★☆]                    ││
│  │  Communication             [★★★★★]                    ││
│  │  Adéquation culture        [★★★★☆]                    ││
│  │  Motivation                [★★★★★]                    ││
│  │                                                        ││
│  │  Notes :                                               ││
│  │  ┌──────────────────────────────────────────────────┐ ││
│  │  │ Très bon niveau React. Connait bien les          │ ││
│  │  │ patterns avancés. Bonne énergie.                  │ ││
│  │  └──────────────────────────────────────────────────┘ ││
│  │                                                        ││
│  │  Décision rapide :                                     ││
│  │  [✅ Go] [⏸️ À revoir] [❌ Pass]                      ││
│  │                                                        ││
│  │  ── Profil du candidat ──                             ││
│  │  [Avatar] Ulrich Kouamé                               ││
│  │  ulrich.ivoire.io                                     ││
│  │  React, Node.js, TypeScript                           ││
│  │  4 ans · Abidjan · 🟢 Disponible                     ││
│  │  [Voir profil complet ↗]                              ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Étape 5 — Envoyer l'offre & Conclure

```
┌──────────────────────────────────────────────────────────────┐
│  📨 Envoyer une proposition — Ulrich K.                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Poste : Développeur Full-Stack React / Node.js             │
│  Type : CDI                                                 │
│  Date de début souhaitée : [01/05/2026]                     │
│                                                              │
│  Salaire mensuel proposé : [700 000] FCFA                   │
│  Avantages :                                                │
│  [☑] Télétravail hybride                                    │
│  [☑] Assurance santé                                        │
│  [☑] Formation continue                                     │
│  [☐] Stock options                                          │
│                                                              │
│  Message personnel :                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Ulrich, l'équipe a été impressionnée par votre       │  │
│  │ entretien. Nous serions ravis de vous accueillir...  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ 📤 Envoyer la proposition ]                              │
│                                                              │
│  ── CÔTÉ CANDIDAT ──                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🎉 Félicitations ! Vous avez une proposition        │  │
│  │  de Acme Corp pour le poste Dev Full-Stack.          │  │
│  │                                                      │  │
│  │  Salaire : 700 000 FCFA/mois                         │  │
│  │  Type : CDI · Début : 01/05/2026                     │  │
│  │  Avantages : Télétravail, Santé, Formation           │  │
│  │                                                      │  │
│  │  [ ✅ Accepter ]  [ 💬 Négocier ]  [ ❌ Décliner ]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### API Pipeline Recrutement

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/jobs` | GET / POST | Lister / Créer une offre |
| `/api/jobs/[id]` | GET / PUT / DELETE | Détail / Modifier / Archiver |
| `/api/jobs/[id]/applications` | GET / POST | Candidatures (lister / postuler) |
| `/api/jobs/[id]/applications/[appId]` | PUT | Changer statut (reçue → revue → entretien → offre → refusé) |
| `/api/jobs/[id]/applications/[appId]/schedule` | POST | Proposer des créneaux |
| `/api/jobs/[id]/applications/[appId]/schedule/confirm` | POST | Confirmer un créneau |
| `/api/jobs/[id]/applications/[appId]/meeting` | POST | Créer la room visio |
| `/api/jobs/[id]/applications/[appId]/evaluate` | POST | Soumettre l'évaluation |
| `/api/jobs/[id]/applications/[appId]/offer` | POST | Envoyer la proposition |
| `/api/jobs/[id]/match` | GET | Profils correspondants (matching intelligent) |

### Technologie visio

| Composant | Technologie |
|---|---|
| **Signaling** | WebSocket via Supabase Realtime |
| **Média** | WebRTC (PeerJS ou mediasoup) |
| **Enregistrement** | MediaRecorder API → stockage Supabase Storage |
| **Chat** | Supabase Realtime channels |
| **Disponible** | Feature flag `visioconference` (🔴 OFF par défaut, activable Phase 4) |

---

## 4. UX UNIFIÉE — L'Effet "Wow"

### Le principe fondamental

> **L'utilisateur ne doit JAMAIS sentir qu'il quitte un outil pour aller sur un autre.**  
> ivoire.io = UNE seule application. Les sous-domaines sont des "pièces" de la même maison.

### Les 5 règles de l'UX unifiée

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  RÈGLE 1 — UNE SEULE IDENTITÉ                              │
│  ─────────────────────────────                              │
│  • Ivoire ID = un compte. Se connecter une fois.            │
│  • Avatar, nom, bio, disponibilité = les mêmes PARTOUT.    │
│  • Changer son avatar sur le dashboard → changé sur devs,  │
│    sur jobs, sur events, sur le portfolio. Instantanément.  │
│                                                              │
│  RÈGLE 2 — UNE SEULE BARRE DE NAVIGATION                   │
│  ──────────────────────────────────────                     │
│  • La topbar est IDENTIQUE sur chaque portail :             │
│    [ivoire.io · Portail actuel]   [🔍] [🌐 Hub] [🔔] [👤] │
│  • Le Hub (🌐) est accessible de partout.                   │
│  • Les notifications (🔔) regroupent TOUT : messages,       │
│    candidatures, invitations, votes, événements, etc.       │
│                                                              │
│  RÈGLE 3 — UNE SEULE MESSAGERIE                            │
│  ────────────────────────────                               │
│  • Toutes les conversations dans un endroit unique.         │
│  • Un recruteur te contacte via jobs → tu vois dans ta     │
│    messagerie du dashboard.                                 │
│  • Un dev commente ta startup → même messagerie.            │
│  • Pas 10 boîtes de réception = UNE seule.                  │
│                                                              │
│  RÈGLE 4 — UNE SEULE CHARTE VISUELLE                       │
│  ─────────────────────────────────                          │
│  • Noir (#0a0a0a), orange (#FF6B00), blanc.                 │
│  • Inter / Geist. Lucide Icons. Tailwind. Shadcn.          │
│  • Animations identiques (Framer Motion, 200ms ease-out).  │
│  • Les portails ne "changent pas de peau". Seul le contenu │
│    change. La coque est la même.                            │
│                                                              │
│  RÈGLE 5 — TRANSITIONS FLUIDES                              │
│  ──────────────────────────                                 │
│  • Quand tu passes de ivoire.io/dashboard → jobs.ivoire.io,│
│    pas de flash blanc, pas de rechargement de page complet. │
│  • La session Ivoire ID suit. L'avatar est là. L'état      │
│    persiste.                                                │
│  • Effet : l'utilisateur croit rester dans la même app.     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### La Topbar Universelle

Présente sur **CHAQUE** sous-domaine. Toujours la même structure. Le seul changement = le nom du portail actif.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [logo · ivoire.io]  │  jobs             [🔍] [🌐] [🔔 3] [👤]│
│                       │  ↑ portail actif                     │
│                       │                                      │
│  Sur devs.ivoire.io → │  talents                             │
│  Sur learn.ivoire.io →│  apprendre                           │
│  Sur startups.io →    │  startups                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Détail des icônes :
🔍 — Recherche globale (cherche sur TOUS les portails à la fois)
🌐 — Hub / Launchpad (accès tous portails)
🔔 — Notifications unifiées (tous portails)
👤 — Menu profil (dashboard, mon portfolio, paramètres, déconnexion)
```

### La Recherche Globale

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 Rechercher sur ivoire.io...                    [⌘K]     │
│                                                              │
│  > react abidjan                                            │
│                                                              │
│  ── TALENTS (3) ─────────────────────────────               │
│  [Avatar] Ulrich K. · React, Node.js · Abidjan             │
│  [Avatar] Fatou D. · React, Python · Abidjan                │
│  [Avatar] Yapi K. · React, Vue · Abidjan                    │
│                                                              │
│  ── OFFRES (2) ──────────────────────────────               │
│  💼 Dev React Senior · Acme Corp · Abidjan                  │
│  💼 Full-Stack React · TechCI · Abidjan                     │
│                                                              │
│  ── STARTUPS (1) ────────────────────────────               │
│  🚀 ReactCI · Framework components pour CI                   │
│                                                              │
│  ── ÉVÉNEMENTS (1) ──────────────────────────               │
│  🎪 React Meetup Abidjan · 20/03/2026                       │
│                                                              │
│  [Voir tous les résultats →]                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Résumé : pourquoi c'est "Wow"

| Avant (sans unification) | Après (ivoire.io) |
|---|---|
| 6 comptes sur 6 plateformes | 1 compte Ivoire ID |
| CV PDF + site perso + LinkedIn | `slug.ivoire.io` — tout en un |
| Chercher sur 3 sites d'emploi | Recherche globale `⌘K` |
| WhatsApp pour planifier | Calendrier intégré |
| Zoom pour l'entretien | Visio intégrée |
| 0 suivi candidature | Pipeline Kanban temps réel |
| Découvrir les outils un par un | Hub / Launchpad → tout visible |

---

## 5. FRAMEWORK ANTI-HORS-SUJET

### Le piège du "et si on ajoutait aussi..."

ivoire.io a une vision ambitieuse (10+ portails). Le risque #1 = **Feature Creep** :
- Ajouter des fonctionnalités "sympas" mais pas essentielles
- Complexifier l'interface au point de perdre la simplicité
- S'éparpiller et ne rien finir correctement

### Le filtre : 4 questions avant CHAQUE fonctionnalité

Chaque fonctionnalité candidate doit passer **les 4 questions**. Si elle ne passe pas → elle n'entre pas.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  🧪 TEST D'ADMISSION — Fonctionnalité candidate             │
│  ═══════════════════════════════════════════                 │
│                                                              │
│  Question 1 — PROBLÈME RÉEL                                 │
│  "Est-ce que des utilisateurs en Côte d'Ivoire              │
│   rencontrent CE problème AUJOURD'HUI ?"                    │
│  → Si c'est un problème hypothétique ou de niche → ❌ NON   │
│                                                              │
│  Question 2 — UNICITÉ                                       │
│  "Est-ce que cette fonctionnalité ne peut pas déjà          │
│   être faite MIEUX ailleurs ?"                              │
│  → Si Google Calendar fait mieux → on ne refait pas         │
│    un calendrier. SAUF si l'intégrer dans notre pipeline    │
│    évite de quitter l'app (voir Q3).                        │
│                                                              │
│  Question 3 — FLUX INTERNE                                  │
│  "Est-ce que SANS cette fonctionnalité, l'utilisateur       │
│   doit QUITTER ivoire.io pour faire ce qu'il veut ?"       │
│  → Si oui, et que ça casse le flux → ✅ OUI, on le fait.   │
│  → Si non, et que ça marche déjà bien → ❌ NON.            │
│                                                              │
│  Question 4 — SIMPLICITÉ                                    │
│  "Est-ce qu'on peut l'implémenter sans ajouter              │
│   PLUS DE 2 CLICS au parcours utilisateur ?"               │
│  → Si ça complexifie l'interface → refactor ou → ❌ NON.   │
│                                                              │
│  ── RÉSULTAT ──                                             │
│  4/4 ✅  → On le fait, dans la bonne phase.                │
│  3/4 ✅  → On le fait MAIS en vérifiant le point faible.   │
│  2/4 ✅  → On le met en backlog. Peut-être un jour.        │
│  1/4 ou 0 → ❌ HORS SUJET. On ne le fait pas.             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Exemples d'application du filtre

| Fonctionnalité candidate | Q1 Problème | Q2 Unicité | Q3 Flux | Q4 Simple | Score | Décision |
|---|---|---|---|---|---|---|
| Visio entretien | ✅ Zoom = app externe | ✅ Intégré au pipeline | ✅ Sinon il sort | ✅ 1 clic | 4/4 | ✅ OUI |
| Calendrier planif | ✅ WhatsApp = chaos | ⚠️ Google Cal existe | ✅ Sinon il sort | ✅ Créneaux | 3.5/4 | ✅ OUI |
| Chat en temps réel | ✅ WhatsApp = pas pro | ⚠️ Slack existe | ✅ Messages sortent | ✅ In-app | 3.5/4 | ✅ OUI |
| Éditeur de code en ligne | ⚠️ Niche | ❌ VS Code, Replit | ❌ Pas dans le flux | ❌ Complexe | 0/4 | ❌ NON |
| Réseau social (posts, likes) | ⚠️ Existe (Twitter, LI) | ❌ Pas unique | ❌ Pas critique | ❌ Bloat | 0/4 | ❌ NON |
| Open Data dashboard | ✅ Pas de data CI | ✅ Unique | ❌ Pas dans flux user | ✅ Dashboard | 3/4 | ⚠️ Phase 6 |
| Portfolio PDF export | ✅ Besoin recruteurs | ✅ Auto-généré | ✅ Sinon screenshot | ✅ 1 bouton | 4/4 | ✅ OUI |
| Système de quiz | ✅ Certifier skills | ⚠️ HackerRank | ✅ Certif interne | ⚠️ Modéré | 3/4 | ✅ Phase 5 |
| Marketplace freelance | ✅ Pas local en CI | ✅ 0% commission | ✅ jobs = recrutement | ✅ Intégré | 4/4 | ✅ OUI |
| Mini-jeux gamification | ❌ Fun, pas utile | ❌ Pas unique | ❌ Pas dans flux | ❌ Distraction | 0/4 | ❌ NON |
| Système de badges | ⚠️ Motivation | ❌ Pas essentiel | ❌ Cosmétique | ✅ Simple | 1/4 | ❌ NON |

### Règle de priorisation : La Matrice Phase × Impact

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│               IMPACT SUR L'UTILISATEUR                      │
│               ────────────────────────                      │
│               Faible          Fort                          │
│         ┌────────────────┬────────────────┐                 │
│   Facile│  ⚠️ Nice-to-have│  ✅ QUICK WIN  │                 │
│   ──────│  (backlog)      │  (faire ASAP)  │                 │
│ EFFORT  ├────────────────┼────────────────┤                 │
│   ──────│  ❌ ÉVITER      │  📋 PLANIFIER  │                 │
│   Dur   │  (hors sujet)  │  (roadmap)     │                 │
│         └────────────────┴────────────────┘                 │
│                                                              │
│  Phase 1-2 : Quick Wins uniquement                          │
│  Phase 3-4 : Quick Wins + Planifiés                         │
│  Phase 5-6 : Tout ce qui a passé le filtre 3/4+            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Garde-fous opérationnels

| Garde-fou | Comment |
|---|---|
| **Pas de feature sans issue** | Chaque fonctionnalité = une issue GitHub avec le score 4Q |
| **Review à 2** | Toute nouvelle feature passe par 2 personnes qui appliquent le filtre |
| **Feature Flag obligatoire** | Rien ne va en production sans flag (voir section 12 Admin) → rollback instantané |
| **Mesurer avant d'étendre** | Un portail lancé en beta → analytics pendant 30j → décision GO/NO-GO |
| **Kill switch mental** | "Si on retire cette feature, est-ce que des utilisateurs se plaignent ?" Si non → supprimer |

---

## RÉSUMÉ EXÉCUTIF

| Question | Réponse en 1 phrase |
|---|---|
| **Valeur ajoutée ?** | L'écosystème unifié sous `slug.ivoire.io` avec paiement local et 0% commission — personne ne fait ça en CI. |
| **Accès portails ?** | Hub Central dans la sidebar + Launchpad `🌐` dans la topbar + recherche globale `⌘K`. |
| **Pipeline recrutement ?** | 5 étapes : Publier → Kanban → Calendrier → Visio WebRTC → Proposition. Tout interne. |
| **UX Wow ?** | 5 règles : 1 identité, 1 navbar, 1 messagerie, 1 charte, transitions fluides. |
| **Anti hors-sujet ?** | Le filtre 4Q : Problème réel ? Unique ? Flux interne ? Simple ? Score 3/4 minimum pour entrer. |
