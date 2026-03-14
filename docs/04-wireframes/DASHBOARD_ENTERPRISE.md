# 📐 DASHBOARD ENTREPRISE — Spécification Complète 100%

> **Type** : `enterprise`  
> **URL Dashboard** : `ivoire.io/dashboard`  
> **URL Publique** : `[slug].ivoire.io` (vitrine entreprise certifiée)  
> **Badge** : 🏅 Certifié ivoire.io (après validation admin)

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Mon Entreprise](#2-mon-entreprise)
3. [Offres d'emploi](#3-offres-demploi)
4. [Recherche de talents](#4-recherche-de-talents)
5. [Candidatures reçues (Kanban)](#5-candidatures-reçues)
6. [Planification d'entretiens](#6-planification-dentretiens)
7. [Visioconférence intégrée](#7-visioconférence-intégrée)
8. [Propositions d'embauche](#8-propositions-dembauche)
9. [Messages](#9-messages)
10. [Statistiques & Analytics](#10-statistiques--analytics)
11. [Template & Vitrine](#11-template--vitrine)
12. [Paramètres](#12-paramètres)

---

## SIDEBAR — Navigation Complète

```
┌────────────────────────────────┐
│  [logo] ivoire.io              │
│                                │
│  ┌──────────┐                  │
│  │  Logo    │ Acme Corp        │
│  │  co.     │ hr@acme.ci       │
│  └──────────┘                  │
│  🏅 Certifié · Enterprise      │
│                                │
│──────────────────────────────│
│  📌 GÉNÉRAL                   │
│  ├── 🏠  Vue d'ensemble       │
│  ├── 🏢  Mon Entreprise       │
│  └── 🎨  Template             │
│                                │
│  📌 RECRUTEMENT               │
│  ├── 💼  Offres d'emploi (3)  │
│  ├── 🔍  Recherche talents    │
│  ├── 📋  Candidatures  (8)    │
│  ├── 📅  Entretiens  (2)     │
│  ├── 🎬  Visio               │
│  └── 🎉  Propositions  (1)   │
│                                │
│  📌 INTERACTIONS              │
│  ├── 📨  Messages  (2)        │
│  └── 📊  Analytics            │
│                                │
│  📌 COMPTE                    │
│  ├── ⚙️  Paramètres           │
│  ├── 🔗  Voir ma vitrine      │
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
│  Bienvenue, Acme Corp 🏢                                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 💼  3        │  │ 📋  8        │  │ 👁️  2 340    │      │
│  │ Offres       │  │ Candidatures │  │ Visites      │      │
│  │ actives      │  │ en attente   │  │ vitrine      │      │
│  │              │  │              │  │ ↑ +31%       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 📨  2        │  │ 🔍  156      │  │ 🏅           │      │
│  │ Messages     │  │ Profils      │  │ Badge        │      │
│  │ non lus      │  │ consultés    │  │ Certifié ✅  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── DERNIÈRES CANDIDATURES ────────────────────────────┐  │
│  │                                                        │  │
│  │  [Av] Ulrich K.  → Dév Flutter (CDI)   — il y a 2h  │  │
│  │  [Av] Fatou D.   → React Dev (CDD)     — il y a 5h  │  │
│  │  [Av] Jean T.    → DevOps (Freelance)  — hier        │  │
│  │                                                        │  │
│  │  [ Voir toutes les candidatures → ]                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── MES OFFRES D'EMPLOI ───────────────────────────────┐  │
│  │                                                        │  │
│  │  Développeur Flutter  — Abidjan — CDI — 🟢 Active    │  │
│  │    12 candidatures · Publiée il y a 3j                │  │
│  │  Data Engineer        — Remote  — CDI — 🟢 Active    │  │
│  │    5 candidatures · Publiée il y a 7j                 │  │
│  │  UX Designer          — Abidjan — CDD — ⭕ Expirée   │  │
│  │    8 candidatures · Expirée il y a 2j                 │  │
│  │                                                        │  │
│  │  [ + Publier une nouvelle offre ]                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── TALENTS RECOMMANDÉS ───────────────────────────────┐  │
│  │                                                        │  │
│  │  Basé sur vos offres actives :                        │  │
│  │  [Av] Yapi B. — Flutter · Abidjan · 🟢 Disponible   │  │
│  │  [Av] Awa D.  — Data Eng · Remote · 🟢 Disponible   │  │
│  │                                                        │  │
│  │  [ Voir plus de recommandations → ]                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. MON ENTREPRISE

```
┌──────────────────────────────────────────────────────────────┐
│  Mon Entreprise                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── IDENTITÉ ──────────────────────────────────────────┐ │
│  │                                                        │ │
│  │   ┌──────────┐   Nom de l'entreprise *                │ │
│  │   │          │   [________________________________]   │ │
│  │   │  LOGO    │                                        │ │
│  │   │  128px   │   Slogan (max 80 car.)                 │ │
│  │   └──────────┘   [________________________________]   │ │
│  │   [ 📷 Changer ]                                      │ │
│  │                                                        │ │
│  │   Slug : acme.ivoire.io  🔒  ·  🏅 Certifié          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── INFORMATIONS ──────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Secteur *       [Fintech ▾]                          │ │
│  │  Taille          [50-200 employés ▾]                  │ │
│  │                  Options : 1-10 · 11-50 · 51-200 ·    │ │
│  │                  201-500 · 500+                        │ │
│  │  Année création  [2018]                               │ │
│  │  Ville           [Abidjan]                            │ │
│  │  Pays            [Côte d'Ivoire]                      │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── DESCRIPTION ───────────────────────────────────────┐ │
│  │                                                        │ │
│  │  À propos de l'entreprise                             │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ (max 2000 caractères)                          │  │ │
│  │  │                                                │  │ │
│  │  │                                                │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                        │ │
│  │  Culture d'entreprise (optionnel)                     │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ (max 500 caractères)                           │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │                                                        │ │
│  │  Ce que nous offrons (avantages)                      │ │
│  │  ☑ Travail à distance    ☑ Horaires flexibles        │ │
│  │  ☐ Assurance santé       ☑ Formation continue        │ │
│  │  ☐ Stock options         ☑ Matériel fourni           │ │
│  │  ☐ Congés illimités      ☐ Cantine/repas             │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── TECHNOLOGIES UTILISÉES ────────────────────────────┐ │
│  │                                                        │ │
│  │  [Flutter ✕] [Python ✕] [AWS ✕] [PostgreSQL ✕]       │ │
│  │  [____________________________] [ + Ajouter ]         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── LIENS ─────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  🌐 Site web       [https://____________________]     │ │
│  │  💼 LinkedIn       [https://linkedin.com/company/___] │ │
│  │  🐦 Twitter/X      [https://twitter.com/___________]  │ │
│  │  🐙 GitHub         [https://github.com/___________]   │ │
│  │  📹 YouTube        [https://youtube.com/@___________]  │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── GALERIE (optionnel) ───────────────────────────────┐ │
│  │                                                        │ │
│  │  Photos de l'équipe, des locaux, événements...        │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │ │
│  │  │ img1 │ │ img2 │ │ img3 │ │ + ➕ │                │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                │ │
│  │  (max 6 images — 5 Mo chacune)                        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                          [ 💾 Enregistrer les modifications ] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. OFFRES D'EMPLOI

### Liste des offres

```
┌──────────────────────────────────────────────────────────────┐
│  Offres d'emploi (4)             [ + Publier une offre ]     │
│  Filtre : [Toutes ▾] [Actives ▾] [Expirées ▾]              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Développeur Flutter Senior  🟢 Active    [✏️] [🗑️] │   │
│  │  📍 Abidjan · 💼 CDI · 💰 800K-1.2M FCFA/mois      │   │
│  │  [Flutter] [Dart] [Firebase]                         │   │
│  │  📅 Publiée le 11/03  · ⏰ Expire le 11/04          │   │
│  │  📋 12 candidatures  · 👁️ 234 vues                   │   │
│  │                                                      │   │
│  │  [ 👁️ Voir candidatures ] [ ⭐ Sponsoriser ]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Engineer            🟢 Active    [✏️] [🗑️]    │   │
│  │  📍 Remote · 💼 CDI · 💰 1M-1.5M FCFA/mois          │   │
│  │  [Python] [SQL] [Airflow]                            │   │
│  │  📅 Publiée le 07/03  · ⏰ Expire le 07/04          │   │
│  │  📋 5 candidatures  · 👁️ 156 vues                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  UX/UI Designer           ⭕ Expirée   [♻️] [🗑️]    │   │
│  │  📍 Abidjan · 💼 CDD · 💰 600K-800K FCFA/mois       │   │
│  │  📅 Expirée le 10/03 · 📋 8 candidatures             │   │
│  │                                                      │   │
│  │  [ ♻️ Republier ] [ 📋 Voir candidatures ]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Formulaire Offre d'emploi (Sheet)

```
┌──────────────────────────────────────────────────────────────┐
│  Publier une offre d'emploi                           [ ✕ ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Titre du poste *        [________________________________] │
│                                                              │
│  Type de contrat *                                          │
│  [●] CDI  [ ] CDD  [ ] Freelance  [ ] Stage  [ ] Alternance│
│                                                              │
│  Localisation *                                             │
│  [●] Sur site  [ ] Remote  [ ] Hybride                     │
│  Ville (si sur site/hybride)  [Abidjan________________]    │
│                                                              │
│  Salaire                                                    │
│  De [________] à [________] FCFA/mois                      │
│  ☐ Ne pas afficher le salaire                              │
│                                                              │
│  Niveau d'expérience *                                      │
│  [ ] Junior (0-2 ans) [●] Intermédiaire (2-5 ans)         │
│  [ ] Senior (5+ ans)  [ ] Lead / Manager                   │
│                                                              │
│  Compétences requises *                                     │
│  [Flutter ✕] [Dart ✕]                                      │
│  [____________________________] [ + Ajouter ]               │
│                                                              │
│  Description du poste *                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ (max 3000 caractères)                              │    │
│  │ Missions, responsabilités, profil recherché...     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Comment postuler ?                                         │
│  [●] Via ivoire.io (candidature interne)                   │
│  [ ] Email externe  [hr@acme.ci____________]               │
│  [ ] Lien externe   [https://acme.ci/jobs/__]              │
│                                                              │
│  Date limite *       [JJ/MM/AAAA]                           │
│                                                              │
│           [ Annuler ]  [ 💾 Publier l'offre ]               │
│                                                              │
│  💡 Votre offre sera visible sur jobs.ivoire.io et sur     │
│     votre vitrine acme.ivoire.io.                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. RECHERCHE DE TALENTS

```
┌──────────────────────────────────────────────────────────────┐
│  Recherche de talents                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher par nom, compétence, ville...     ]       │
│                                                              │
│  Filtres :                                                   │
│  ┌────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐           │
│  │Techno ▾│ │Ville  ▾│ │Dispo    ▾│ │Exp.   ▾│           │
│  └────────┘ └────────┘ └──────────┘ └─────────┘           │
│                                                              │
│  Tags actifs : [Flutter ✕] [Abidjan ✕] [Disponible ✕]     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Av]  Ulrich Kouamé              🟢 Disponible     │   │
│  │        Lead Developer · Abidjan                      │   │
│  │        [Flutter] [Dart] [Go] [Firebase]              │   │
│  │        ⭐ 92% match avec "Dév Flutter Senior"       │   │
│  │                                                      │   │
│  │  [ 🔗 Voir portfolio ]  [ 📩 Contacter ]            │   │
│  │  [ ⭐ Sauvegarder ]    [ 📋 Proposer une offre ]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Av]  Fatou Diallo                🟢 Disponible     │   │
│  │        Full Stack Developer · Abidjan                │   │
│  │        [React] [Node.js] [TypeScript]                │   │
│  │        ⭐ 78% match                                  │   │
│  │                                                      │   │
│  │  [ 🔗 Voir portfolio ]  [ 📩 Contacter ]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ── Tri : [Pertinence ▾] / [Récent ▾] / [A-Z ▾] ──       │
│  Page 1 / 8   [ ← ]  1  2  3  ...  [ → ]                  │
│                                                              │
│  ┌──── TALENTS SAUVEGARDÉS ──(raccourci)──────────────────┐│
│  │  Vous avez sauvegardé 5 profils                        ││
│  │  [ Voir mes favoris → ]                                ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. CANDIDATURES REÇUES

```
┌──────────────────────────────────────────────────────────────┐
│  Candidatures (25)       Filtre : [Toutes offres ▾]         │
│                          Statut : [Tous ▾] [À traiter ▾]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── Pour "Développeur Flutter Senior" (12 candidatures) ──  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Av]  Ulrich Kouamé                 📅 il y a 2h  │   │
│  │        Lead Dev · ulrich.ivoire.io                   │   │
│  │        [Flutter] [Dart] [Firebase]                   │   │
│  │        "Je suis très intéressé par ce poste..."      │   │
│  │                                                      │   │
│  │  Statut : [🆕 Nouvelle ▾]                           │   │
│  │  Options : 🆕 Nouvelle · 📖 Vue · 📞 Entretien ·   │   │
│  │            ✅ Retenue · ❌ Rejetée                   │   │
│  │                                                      │   │
│  │  [ 🔗 Voir portfolio ] [ 📧 Répondre ] [ 📋 Notes ] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Av]  Fatou Diallo                  📅 il y a 5h  │   │
│  │        React Dev · fatou.ivoire.io                   │   │
│  │        Statut : [📖 Vue]                            │   │
│  │  [ 🔗 Voir portfolio ] [ 📧 Répondre ] [ 📋 Notes ] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ── Pour "Data Engineer" (5 candidatures) ──               │
│  ...                                                        │
│                                                              │
│  ┌──── EXPORT ─────────────────────────────────────────────┐│
│  │  [ 📥 Exporter candidatures (CSV) ]                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5b. Vue Kanban des candidatures

> **Vision pipeline** : les candidatures sont gérées en drag-and-drop dans un Kanban, comme une pipeline de vente.

```
┌──────────────────────────────────────────────────────────────┐
│  📋 Pipeline — Dév Flutter Senior          Vue : [Kanban ●]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  REÇUES (5)   │  EN REVUE (3) │  ENTRETIEN (2)│ OFFRE (1)   │
│  ────────────│─────────────│─────────────│────────────│
│  ┌──────────┐│ ┌──────────┐│ ┌──────────┐│ ┌─────────┐│
│  │ [Avatar] ││ │ [Avatar] ││ │ [Avatar] ││ │ [Avatar]││
│  │ Yapi K.  ││ │ Awa M.   ││ │ Ulrich K.││ │ Fatou D││
│  │ 92% match││ │ 85% match││ │ 95% match││ │ 87% mat││
│  │ Flutter  ││ │ Flutter  ││ │ Flutter  ││ │ Flutter││
│  │ 3 ans    ││ │ 2 ans    ││ │ 4 ans    ││ │ 3 ans  ││
│  │[📄][📅][💬]││ │[📄][📅][💬]││ │[📄][📅][💬]││ │[📄][🎉] ││
│  └──────────┘│ └──────────┘│ └──────────┘│ └─────────┘│
│  ┌──────────┐│ ┌──────────┐│ ┌──────────┐│             │
│  │ Jean P.  ││ │ Marc L.  ││ │ ...      ││  REFUSÉ (1) │
│  │ ...      ││ │ ...      ││ │          ││ ──────────│
│  └──────────┘│ └──────────┘│ └──────────┘│ ┌─────────┐│
│  ...       │              │              │ │ Sam T.  ││
│            │              │              │ │ 45% mat ││
│            │              │              │ └─────────┘│
│                                                              │
│  ✍️ Glisser-déposer les cartes entre colonnes pour changer    │
│     le statut. Clic sur une carte = détail + actions.        │
│                                                              │
│  📄 = Voir profil  📅 = Planifier entretien  💬 = Message    │
│  🎉 = Envoyer proposition                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. PLANIFICATION D'ENTRETIENS

> Depuis le Kanban ou la fiche candidature, clic sur 📅 pour planifier un entretien.

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Planifier un entretien — Ulrich K.               [ ✕ ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Offre : Développeur Flutter Senior                          │
│  Candidat : Ulrich Kouamé · ulrich.ivoire.io · 95% match    │
│                                                              │
│  ── VOS DISPONIBILITÉS ──                                     │
│                                                              │
│  ┌──── MARS 2026 ──────────────────────────────────────┐ │
│  │  LUN   MAR   MER   JEU   VEN                         │ │
│  │                            14                         │ │
│  │   17    18    19    20    21                           │ │
│  │   24    25    26    27    28                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                              │
│  Créneaux proposés au candidat :                              │
│  [☑] Mar 18 mars · 10:00 – 10:45                             │
│  [☑] Jeu 20 mars · 14:00 – 14:45                             │
│  [☑] Ven 21 mars · 09:00 – 09:45                             │
│                                                              │
│  Durée : [45 min ▾]                                           │
│  Type : (●) Visio ivoire.io  ( ) En personne  ( ) Téléphone │
│  Interviewers : [hr@acme.ci] [cto@acme.ci] [+Ajouter]       │
│                                                              │
│  Message au candidat :                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Bonjour Ulrich, nous aimerions vous rencontrer pour │  │
│  │ discuter du poste Flutter Senior. Merci de choisir  │  │
│  │ un créneau parmi ceux proposés.                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ 📤 Envoyer la proposition de créneau ]                     │
│                                                              │
│  ── AUTOMATISATIONS ──                                        │
│  ✅ Email de confirmation envoyé aux 2 parties                │
│  ✅ Rappel automatique J-1 et H-1                             │
│  ✅ Lien visio généré automatiquement                         │
│  ✅ Ajouté au calendrier (iCal exportable)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Vue agenda des entretiens

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Entretiens planifiés                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── CETTE SEMAINE ──                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🟢 Jeu 20 mars · 14:00 – 14:45                           │   │
│  │  Ulrich Kouamé — Dév Flutter Senior · 🎬 Visio        │   │
│  │  Confirmé par le candidat ✅                             │   │
│  │  [ 🎬 Lancer la visio ] [ 💬 Message ] [ ❌ Annuler ]   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🟡 Ven 21 mars · 09:00 – 09:45                           │   │
│  │  Awa M. — Dév Flutter Senior · 🎬 Visio               │   │
│  │  En attente de confirmation ⏳                            │   │
│  │  [ 💬 Relancer ] [ ❌ Annuler ]                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. VISIOCONFÉRENCE INTÉGRÉE

> Quand l'heure de l'entretien arrive, un bouton "🎬 Lancer la visio" apparaît.
> Tout se passe dans ivoire.io — aucun outil externe.

```
┌──────────────────────────────────────────────────────────────┐
│  🎬 Entretien — Ulrich K. × Acme Corp             [🔴 LIVE]  │
│  Poste : Dév Flutter Senior                                 │
│  Durée : 00:23:45                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────┐│
│  │                              │  │                      ││
│  │     [Webcam Candidat]        │  │  [Webcam Recruteur]  ││
│  │                              │  │                      ││
│  └──────────────────────────────┘  └──────────────────────┘│
│                                                              │
│  ┌──── BARRE D'OUTILS ────────────────────────────────────┐  │
│  │  [🎙️ Micro] [📹 Caméra] [🖥️ Partage écran]              │  │
│  │  [💬 Chat] [⏺️ Enregistrer] [✋ Lever la main]           │  │
│  │  [📝 Notes d'entretien]     [🔴 Raccrocher]              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ── PANNEAU LATÉRAL (recruteur uniquement) ──                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  📋 Grille d'évaluation                                ││
│  │                                                        ││
│  │  Compétences techniques    [★★★★☆]                    ││
│  │  Communication             [★★★★★]                    ││
│  │  Adéquation culture        [★★★★☆]                    ││
│  │  Motivation                [★★★★★]                    ││
│  │                                                        ││
│  │  Notes :                                                ││
│  │  ┌──────────────────────────────────────────────────┐  ││
│  │  │ Très bon niveau technique. Maîtrise Flutter    │  ││
│  │  │ + architecture propre. Bonne énergie.         │  ││
│  │  └──────────────────────────────────────────────────┘  ││
│  │                                                        ││
│  │  Décision rapide :                                      ││
│  │  [✅ Go] [⏸️ À revoir] [❌ Pass]                       ││
│  │                                                        ││
│  │  ── Profil candidat ──                                 ││
│  │  [Avatar] Ulrich Kouamé                                ││
│  │  ulrich.ivoire.io                                      ││
│  │  Flutter, Dart, Firebase · 4 ans · Abidjan             ││
│  │  [Voir profil complet ↗]                               ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. PROPOSITIONS D'EMBAUCHE

> Après l'entretien, le recruteur envoie une proposition formelle directement depuis ivoire.io.

```
┌──────────────────────────────────────────────────────────────┐
│  🎉 Envoyer une proposition — Ulrich K.               [ ✕ ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Poste : Développeur Flutter Senior                          │
│  Type : CDI                                                  │
│  Date de début souhaitée : [01/05/2026]                      │
│                                                              │
│  Salaire mensuel proposé : [1 000 000] FCFA                 │
│                                                              │
│  Avantages :                                                 │
│  [☑] Télétravail hybride                                     │
│  [☑] Assurance santé                                         │
│  [☑] Formation continue                                     │
│  [☐] Stock options                                          │
│  [☐] Autre : [____________________]                         │
│                                                              │
│  Message personnel :                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Ulrich, l'équipe a été impressionnée par votre        │  │
│  │ entretien. Nous serions ravis de vous accueillir...  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Délai de réponse : [14 jours ▾]                             │
│                                                              │
│  [ 👁️ Prévisualiser ]  [ 📤 Envoyer la proposition ]         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Suivi des propositions envoyées

```
┌──────────────────────────────────────────────────────────────┐
│  🎉 Propositions envoyées (3)                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Ulrich K. — Dév Flutter Sr       ⏳ En attente          │   │
│  │  1M FCFA/mois · CDI · Envoyée le 14/03                 │   │
│  │  Expire le 28/03                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Fatou D. — Dév Flutter Sr        ✅ ACCEPTÉE            │   │
│  │  800K FCFA/mois · CDI · Début 1er avril                │   │
│  └────────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Awa M. — Data Engineer            ❌ DÉCLINÉE           │   │
│  │  "J'ai accepté une autre offre"                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. MESSAGES

```
┌──────────────────────────────────────────────────────────────┐
│  Messages (15)                    Filtrer : [Tous ▾]        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  (Identique au module messages dev, avec en plus            │
│   les messages reçus via la vitrine entreprise)             │
│                                                              │
│  🔵  startup@mail.ci — "Partenariat possible ?" — 2h       │
│  🔵  dev@mail.ci     — "Question sur votre offre" — 5h     │
│  ⚪  investor@fund.ci — "Présentation groupe" — 2j ✅ Lu   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. STATISTIQUES & ANALYTICS

> **Inclus dans le plan Enterprise** — pas de restriction premium.

```
┌──────────────────────────────────────────────────────────────┐
│  Analytics                   Période : [7j] [30j] [90j] [1an]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👁️  2 340    │  │ 💼  3        │  │ 📋  25       │      │
│  │ Visites      │  │ Offres       │  │ Candidatures │      │
│  │ vitrine      │  │ actives      │  │ totales      │      │
│  │ ↑ +31%       │  │              │  │ ↑ +15        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── VISITES PAR PAGE ───────────────────────────────────┐ │
│  │                                                        │ │
│  │  acme.ivoire.io (vitrine)     — 1 204 vues            │ │
│  │  Offre "Flutter Senior"       —   634 vues            │ │
│  │  Offre "Data Engineer"        —   312 vues            │ │
│  │  Offre "UX Designer" (expirée)—   190 vues            │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── CANDIDATURES PAR OFFRE (diagramme barres) ─────────┐ │
│  │                                                        │ │
│  │  Flutter Senior  ████████████████████  12              │ │
│  │  Data Engineer   █████████            5               │ │
│  │  UX Designer     ████████████████     8               │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── FUNNEL CANDIDATURES ────────────────────────────────┐ │
│  │                                                        │ │
│  │  Vues offres       — 1 136                            │ │
│  │  Candidatures       —    25  (taux 2.2%)              │ │
│  │  Entretiens         —     6  (24%)                    │ │
│  │  Retenues           —     2  (8%)                     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── PROVENANCE VISITEURS ───────────────────────────────┐ │
│  │  🇨🇮 Côte d'Ivoire — 78%  · 🇫🇷 France — 9%           │ │
│  │  🇸🇳 Sénégal — 5%  · 🌍 Autres — 8%                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ 📥 Exporter le rapport (CSV) ]                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. TEMPLATE & VITRINE

```
┌──────────────────────────────────────────────────────────────┐
│  Template                       Actuel : Corporate Dark      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Choisis le design de la page vitrine de ton entreprise.    │
│  🔗 Aperçu en direct sur acme.ivoire.io                     │
│                                                              │
│  ┌──── TEMPLATES (Enterprise — tous inclus) ──────────────┐ │
│  │                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ Corporate   │  │ Modern      │  │ Tech        │   │ │
│  │  │ Dark        │  │ Light       │  │ Startup     │   │ │
│  │  │ ✅ Actuel   │  │ [Activer]   │  │ [Activer]   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ Glass       │  │ Gradient    │  │ Bento       │   │ │
│  │  │ Premium     │  │ Pro         │  │ Grid        │   │ │
│  │  │ [Activer]   │  │ [Activer]   │  │ [Activer]   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                        │ │
│  │  + 4 templates supplémentaires...                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  (Plan Enterprise : tous les templates sont débloqués)      │
│                                                              │
│  ┌──── APERÇU ────────────────────────────────────────────┐ │
│  │  (Aperçu interactif)                                   │ │
│  │  [ 👁️ Plein écran ]  [ ✅ Appliquer ]                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. PARAMÈTRES

```
┌──────────────────────────────────────────────────────────────┐
│  Paramètres                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── COMPTE ────────────────────────────────────────────┐ │
│  │  Email           hr@acme.ci  🔒                        │ │
│  │  Slug            acme.ivoire.io  🔒                    │ │
│  │  Type            Enterprise                            │ │
│  │  Badge           🏅 Certifié le 20/02/2026             │ │
│  │  Membre depuis   15 janvier 2026                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── UTILISATEURS (multi-seat) ──────────────────────────┐ │
│  │                                                        │ │
│  │  Gérez les accès au dashboard entreprise :             │ │
│  │                                                        │ │
│  │  hr@acme.ci       — Admin       🔒 (propriétaire)    │ │
│  │  recruit@acme.ci  — Recruteur   [✏️] [🗑️]            │ │
│  │  cto@acme.ci      — Éditeur     [✏️] [🗑️]            │ │
│  │                                                        │ │
│  │  [ + Inviter un collaborateur ]                       │ │
│  │                                                        │ │
│  │  Rôles : Admin (tout) · Recruteur (offres +           │ │
│  │  candidatures) · Éditeur (profil entreprise)          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── NOTIFICATIONS ─────────────────────────────────────┐ │
│  │  📋 Email nouvelle candidature  [●] Oui [ ] Non       │ │
│  │  📨 Email nouveau message       [●] Oui [ ] Non       │ │
│  │  📊 Rapport hebdo analytics     [●] Oui [ ] Non       │ │
│  │  📣 Nouveautés ivoire.io        [●] Oui [ ] Non       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── ABONNEMENT ────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Plan : 🏢 Enterprise — 20 000 FCFA/mois              │ │
│  │  Prochaine facturation : 15/04/2026                   │ │
│  │  Méthode : Wave CI **** 1234                          │ │
│  │                                                        │ │
│  │  Inclus : ∞ offres · ∞ recherche talents ·            │ │
│  │  Analytics complet · Tous templates · Multi-seat ·    │ │
│  │  Badge certifié · Support prioritaire                 │ │
│  │                                                        │ │
│  │  [ 💳 Modifier le paiement ] [ ❌ Résilier ]          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── ZONE DANGEREUSE ───────────────────────────────────┐ │
│  │  [ 📥 Exporter toutes les données ] [ 🗑️ Supprimer ]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ENDPOINTS API ENTERPRISE

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/dashboard/company` | GET / PUT | Infos entreprise |
| `/api/dashboard/company/logo` | POST | Upload logo |
| `/api/dashboard/company/gallery` | POST / DELETE | Galerie photos |
| `/api/dashboard/jobs` | GET / POST | CRUD offres d'emploi |
| `/api/dashboard/jobs/[id]` | PUT / DELETE | Modifier / supprimer offre |
| `/api/dashboard/jobs/[id]/candidates` | GET | Candidatures par offre |
| `/api/dashboard/candidates` | GET | Toutes les candidatures |
| `/api/dashboard/candidates/[id]` | PUT | Changer statut candidature |
| `/api/dashboard/candidates/[id]/schedule` | POST | Proposer des créneaux d'entretien |
| `/api/dashboard/candidates/[id]/schedule/status` | GET | Statut confirmation créneau |
| `/api/dashboard/candidates/[id]/meeting` | POST | Créer la room visio |
| `/api/dashboard/candidates/[id]/meeting` | GET | Obtenir le lien visio |
| `/api/dashboard/candidates/[id]/evaluate` | POST | Soumettre l'évaluation post-entretien |
| `/api/dashboard/candidates/[id]/offer` | POST | Envoyer une proposition d'embauche |
| `/api/dashboard/candidates/[id]/offer` | GET | Statut de la proposition |
| `/api/dashboard/interviews` | GET | Liste de tous les entretiens planifiés |
| `/api/dashboard/talents/search` | GET | Recherche de talents |
| `/api/dashboard/talents/saved` | GET / POST / DELETE | Favoris talents |
| `/api/dashboard/messages` | GET | Messages |
| `/api/dashboard/analytics` | GET | Analytics détaillées |
| `/api/dashboard/team-access` | GET / POST / DELETE | Multi-seat |
| `/api/dashboard/template` | GET / PUT | Template vitrine |
| `/api/dashboard/settings` | GET / PUT | Paramètres |
| `/api/dashboard/billing` | GET / PUT | Facturation |

---

## PLAN TARIFAIRE ENTERPRISE

| Fonctionnalité | Inclus |
|---|:---:|
| Vitrine publique certifiée 🏅 | ✅ |
| Offres d'emploi | ∞ |
| Recherche de talents | ✅ |
| Matching automatique (% match) | ✅ |
| Candidatures (avec suivi) | ✅ |
| Pipeline Kanban (drag & drop) | ✅ |
| Planification d'entretiens | ✅ |
| Visioconférence intégrée | ✅ |
| Grille d'évaluation | ✅ |
| Propositions d'embauche | ✅ |
| Analytics complet | ✅ |
| Tous les templates | ✅ |
| Multi-seat (3 accès inclus) | ✅ |
| Export CSV/PDF | ✅ |
| Support prioritaire | ✅ |
| **Prix** | **20 000 FCFA/mois** |
