# 📐 DASHBOARD STARTUP — Spécification Complète V2
> Intègre le module **Project Builder** (onboarding intelligent IA)

> **Type** : `startup`
> **URL Dashboard** : `ivoire.io/dashboard`
> **URL Publique** : `[slug].ivoire.io` (vitrine startup)
> **Portail dédié** : `startups.ivoire.io` (Product Hunt ivoirien)

---

## TABLE DES MATIÈRES

0. [Project Builder — Onboarding IA](#0-project-builder--onboarding-ia) ⭐ NOUVEAU
1. [Vue d'ensemble](#1-vue-densemble) *(modifié)*
2. [Ma Startup](#2-ma-startup) *(modifié)*
3. [Équipe](#3-équipe)
4. [Produits](#4-produits)
5. [Messages & Candidatures](#5-messages--candidatures)
6. [Statistiques](#6-statistiques)
7. [Levée de fonds](#7-levée-de-fonds)
8. [Template & Vitrine](#8-template--vitrine)
9. [Paramètres](#9-paramètres)
10. [Recrutement & Pipeline](#10-recrutement--pipeline)

---

## SIDEBAR — Navigation Complète *(modifiée)*

```
┌────────────────────────────────┐
│  [logo] ivoire.io              │
│                                │
│  ┌──────────┐                  │
│  │  Logo    │ TechCI           │
│  │  startup │ tech@ci.com      │
│  └──────────┘                  │
│  🚀 Startup · Pré-seed         │
│  ████████████░░░░  72% prêt   │  ← NOUVEAU : score projet
│                                │
│──────────────────────────────│
│  📌 GÉNÉRAL                   │
│  ├── 🏠  Vue d'ensemble       │
│  ├── 🧱  Project Builder  🆕  │  ← NOUVEAU
│  ├── 🚀  Ma Startup           │
│  └── 🎨  Template             │
│                                │
│  📌 ÉQUIPE & PRODUITS         │
│  ├── 👥  Équipe               │
│  └── 💡  Produits             │
│                                │
│  📌 CROISSANCE                │
│  ├── 📨  Messages  (5)        │
│  ├── 📊  Statistiques         │
│  └── 💰  Levée de fonds       │
│                                │
│  📌 RECRUTEMENT               │
│  ├── 💼  Offres  (1)          │
│  ├── 📋  Candidatures  (4)    │
│  └── 📅  Entretiens           │
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

## 0. PROJECT BUILDER — ONBOARDING IA ⭐ NOUVEAU

> Point d'entrée unique pour tout nouveau porteur de projet.
> Accessible avant le dashboard complet — c'est la **porte d'entrée**.
> Trois modes selon le niveau d'avancement du porteur.

### 0.0 Écran d'accueil — Choix du mode

```
┌──────────────────────────────────────────────────────────────┐
│  🧱 Project Builder — ivoire.io                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bienvenue ! Commençons à construire ton projet.             │
│  Dis-nous où tu en es :                                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  🗂️  MODE A — J'ai déjà tout                       │    │
│  │       Logo, nom de domaine, pitch, documents...     │    │
│  │       J'uploade mes fichiers existants.             │    │
│  │                                    [ Choisir → ]   │    │
│  │                                                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  ✏️  MODE B — J'ai l'idée + quelques éléments      │    │
│  │       Nom, quelques notes, esquisse de logo...      │    │
│  │       On construit ensemble ce qui manque.          │    │
│  │                                    [ Choisir → ]   │    │
│  │                                                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  💡  MODE C — J'ai juste l'idée                    │    │
│  │       Je décris mon projet, l'IA génère tout.       │    │
│  │       Logo, pitch, domaine, documents complets.     │    │
│  │                                    [ Choisir → ]   │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ✨ Résultat garanti : projet 100% prêt pour les            │
│     financiers, présentable au grand public, protégé.        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 0.1 MODE A — Upload & Intégration

```
┌──────────────────────────────────────────────────────────────┐
│  🗂️ Mode A — Import de tes fichiers          Étape 1 / 4    │
│  [████░░░░░░░░░░░░░░░░]  25%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Dépose tout ce que tu as. On classe automatiquement.        │
│                                                              │
│  ┌──── ZONE DE DÉPÔT ──────────────────────────────────┐    │
│  │                                                     │    │
│  │        [ ☁️ Glisser-déposer tes fichiers ici ]      │    │
│  │              ou  [ 📁 Parcourir ]                   │    │
│  │                                                     │    │
│  │  Formats acceptés :                                 │    │
│  │  PDF · DOCX · PNG · JPG · SVG · MP4 · ZIP          │    │
│  │  Taille max : 50 Mo par fichier                     │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── FICHIERS DÉTECTÉS & CLASSÉS ───────────────────┐     │
│  │                                                     │     │
│  │  logo-final.png      → 🎨 Logo           ✅ Détecté│     │
│  │  pitch-deck-v3.pdf   → 📊 Pitch deck     ✅ Détecté│     │
│  │  business-plan.docx  → 💰 Business plan  ✅ Détecté│     │
│  │  charte-graphique.pdf→ 🎨 Charte         ✅ Détecté│     │
│  │  techci.com          → 🌐 Domaine        ❓ À vérifier│   │
│  │  notes-brutes.txt    → ❓ Non reconnu    [Classer ▾]│    │
│  │                                                     │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  ⚠️  1 fichier non reconnu — choisis sa catégorie           │
│                                                              │
│                    [ Suivant — Audit IA → ]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│  🗂️ Mode A — Audit IA de tes fichiers         Étape 2 / 4   │
│  [████████░░░░░░░░░░░░]  50%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✨ Analyse en cours...  L'IA examine chaque document.       │
│                                                              │
│  ┌──── RAPPORT D'AUDIT ────────────────────────────────┐    │
│  │                                                     │    │
│  │  IDENTITÉ                              ████████ 90%│    │
│  │  ✅ Logo haute qualité (PNG 512px)                  │    │
│  │  ✅ Charte graphique complète                       │    │
│  │  ⚠️  Tagline absente — suggestion IA disponible    │    │
│  │                                                     │    │
│  │  VISION & STRATÉGIE                    ████░░░░ 55%│    │
│  │  ✅ Pitch deck (10 slides détectés)                 │    │
│  │  ❌ Analyse de concurrents manquante               │    │
│  │  ❌ Personas non définis                           │    │
│  │                                                     │    │
│  │  TECHNIQUE                             ██░░░░░░ 30%│    │
│  │  ❌ Cahier des charges absent                      │    │
│  │  ❌ MVP non défini                                 │    │
│  │                                                     │    │
│  │  FINANCIER                             ██████░░ 70%│    │
│  │  ✅ Business plan présent                           │    │
│  │  ⚠️  Prévisionnel 3 ans incomplet                 │    │
│  │                                                     │    │
│  │  SCORE GLOBAL                          █████░░░ 61%│    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── CONCURRENTS DÉTECTÉS IA ────────────────────────┐    │
│  │  Recherche automatique effectuée (21 mars 2026)     │    │
│  │  🔴 PayDunya CI — solution similaire active         │    │
│  │  🟡 Flutterwave — concurrent régional indirect      │    │
│  │  🟢 Aucun concurrent direct sur le segment mobile   │    │
│  │  [ 📄 Voir rapport complet ]                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│              [ ← Retour ]  [ Compléter les gaps → ]         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│  🗂️ Mode A — Complétion des gaps              Étape 3 / 4   │
│  [████████████░░░░░░░░]  75%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Voici ce qui manque. L'IA peut générer chaque élément.     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ❌ Tagline                                         │    │
│  │  Suggestions IA :                                   │    │
│  │  ○ "Le paiement mobile pensé pour l'Afrique"        │    │
│  │  ○ "Paye simple, paye rapide, paye TechCI"          │    │
│  │  ○ [Autre — saisir manuellement]                    │    │
│  │                           [ ✅ Valider ce choix ]   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ❌ Analyse concurrents          [ 🤖 Générer IA ]  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ❌ Personas cibles              [ 🤖 Générer IA ]  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ❌ Cahier des charges           [ 🤖 Générer IA ]  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ❌ MVP défini          [ ✏️ Remplir manuellement ] │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ☑  Générer tous les éléments manquants automatiquement     │
│                  [ 🤖 Tout générer d'un coup ]               │
│                                                              │
│              [ ← Retour ]  [ Finaliser le projet → ]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│  🗂️ Mode A — Projet intégré                  Étape 4 / 4   │
│  [████████████████████]  100%                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🎉 Ton projet est prêt sur ivoire.io !                     │
│                                                              │
│  ┌──── RÉCAPITULATIF ──────────────────────────────────┐    │
│  │  Nom          TechCI                                │    │
│  │  Domaine      techci.ivoire.io  ✅ Vérifié          │    │
│  │  Logo         ✅ Intégré (PNG 512px)                │    │
│  │  Score        ████████████████░  91%                │    │
│  │  Horodatage   21 mars 2026 — 14:32 UTC  🔒 Protégé │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── PROCHAINES ÉTAPES ──────────────────────────────┐    │
│  │  [ 🌐 Voir ma vitrine publique ]                    │    │
│  │  [ 💰 Configurer la levée de fonds ]                │    │
│  │  [ 👥 Inviter mon équipe ]                          │    │
│  │  [ 💼 Publier une offre de recrutement ]            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│               [ 🏠 Aller au dashboard → ]                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 0.2 MODE B — Construction guidée

```
┌──────────────────────────────────────────────────────────────┐
│  ✏️ Mode B — Entretien de découverte          Étape 1 / 4   │
│  [████░░░░░░░░░░░░░░░░]  25%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  L'IA te pose 8 questions. Réponds librement.                │
│  Durée estimée : 5 à 10 minutes.                             │
│                                                              │
│  ┌──── CONVERSATION IA ────────────────────────────────┐    │
│  │                                                     │    │
│  │  🤖  Quel problème concret ton projet résout-il ?   │    │
│  │      Décris-le comme tu l'expliquerais à un ami.   │    │
│  │                                                     │    │
│  │  👤  Les gens en Côte d'Ivoire ne peuvent pas       │    │
│  │      payer facilement en ligne sans carte Visa.     │    │
│  │      Mon app permet de payer avec Mobile Money.     │    │
│  │                                                     │    │
│  │  🤖  Super. Et qui est exactement la personne       │    │
│  │      qui a ce problème ? Âge, situation, habitudes? │    │
│  │                                                     │    │
│  │  👤  [___________________________________________]  │    │
│  │      [ 🎤 Parler ]  [ 💬 Écrire ]  [ Envoyer → ]  │    │
│  │                                                     │    │
│  │  ── Question 2 / 8 ──────────────────────────────  │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Questions couvertes :                                       │
│  ✅ Problème    ○ Cible    ○ Solution    ○ Revenu            │
│  ○ Concurrents  ○ Équipe   ○ Besoins     ○ Nom/secteur       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│  ✏️ Mode B — Upload de tes éléments           Étape 2 / 4   │
│  [████████░░░░░░░░░░░░]  50%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Uploade ce que tu as déjà — même partiel, même brouillon.  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🎨 Logo / esquisse     [Choisir fichier] ou [Passer]│   │
│  │  📝 Notes / idées       [Choisir fichier] ou [Passer]│   │
│  │  🌐 Nom de domaine      [techci.ci ou techci.com___] │   │
│  │  📸 Photos équipe       [Choisir fichier] ou [Passer]│   │
│  │  🎥 Vidéo de présentation [Choisir fichier] ou [Passer]  │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 Tu peux tout passer — l'IA génère ce qui manque.        │
│                                                              │
│              [ ← Retour ]  [ Générer les documents → ]      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│  ✏️ Mode B — Génération & Validation          Étape 3 / 4   │
│  [████████████░░░░░░░░]  75%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  L'IA génère chaque document. Tu valides ou modifies.        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📄 Description courte                   ✅ Généré  │    │
│  │  "Solution de paiement Mobile Money pour les        │    │
│  │   ivoiriens non bancarisés."                        │    │
│  │  [ ✅ Valider ]  [ ✏️ Modifier ]  [ 🔄 Regénérer ] │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  🎨 Logo — 3 propositions                ✅ Généré  │    │
│  │  ┌──────┐  ┌──────┐  ┌──────┐                       │    │
│  │  │Logo 1│  │Logo 2│  │Logo 3│  [ 🔄 Nouvelles ] │    │
│  │  └──────┘  └──────┘  └──────┘                       │    │
│  │  [ Choisir Logo 1 ] [ Choisir Logo 2 ] [Logo 3]    │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  🌐 Nom de domaine                       ✅ Vérifié │    │
│  │  techci.io       ✅ Disponible  — 15 €/an            │    │
│  │  techci.ci       ✅ Disponible  — 8 000 FCFA/an     │    │
│  │  techci.com      ❌ Pris                             │    │
│  │  [ Réserver techci.io ]  [ Réserver techci.ci ]     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  📊 Pitch deck 10 slides             🔄 En cours... │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  📋 Cahier des charges               🔄 En cours... │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  🔍 Analyse concurrents              ✅ Généré      │    │
│  │  [ 📄 Voir le rapport ]                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│              [ ← Retour ]  [ Finaliser le projet → ]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 0.3 MODE C — Génération complète depuis l'idée

```
┌──────────────────────────────────────────────────────────────┐
│  💡 Mode C — Décris ton idée                  Étape 1 / 4   │
│  [████░░░░░░░░░░░░░░░░]  25%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Parle librement. Pas besoin d'être structuré.               │
│                                                              │
│  ┌──── TON IDÉE EN QUELQUES MOTS ─────────────────────┐    │
│  │                                                     │    │
│  │  ┌───────────────────────────────────────────────┐ │    │
│  │  │ Je veux créer une application qui permet aux  │ │    │
│  │  │ petits commerçants d'Abidjan de gérer leurs   │ │    │
│  │  │ stocks et ventes depuis leur téléphone...      │ │    │
│  │  │                                               │ │    │
│  │  └───────────────────────────────────────────────┘ │    │
│  │  [ 🎤 Dicter à la place ]                          │    │
│  │                                                     │    │
│  │  Secteur *                                          │    │
│  │  [ E-commerce ▾ ]                                  │    │
│  │                                                     │    │
│  │  Pays cible *                                       │    │
│  │  [ Côte d'Ivoire ▾ ]  + [ Ajouter un pays ]        │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  💡 L'IA va maintenant construire ton projet complet.        │
│     Cela prend environ 2 à 3 minutes.                        │
│                                                              │
│                  [ 🚀 Lancer la génération → ]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│  💡 Mode C — Génération en cours              Étape 2 / 4   │
│  [████████░░░░░░░░░░░░]  50%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✨ L'IA construit ton projet...                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ✅ Nom du projet        "StockFacile"               │    │
│  │  ✅ Tagline              "Gère ton stock, libère-toi"│    │
│  │  ✅ Description courte   Générée                     │    │
│  │  ✅ Description longue   Générée                     │    │
│  │  ✅ Personas cibles      3 profils générés           │    │
│  │  ✅ Modèle économique    Freemium + abonnement       │    │
│  │  ✅ Analyse concurrents  8 concurrents identifiés    │    │
│  │  🔄 Logo — génération en cours...                   │    │
│  │  🔄 Pitch deck — génération en cours...             │    │
│  │  ⏳ Cahier des charges   En attente                  │    │
│  │  ⏳ Roadmap 12 mois      En attente                  │    │
│  │  ⏳ Vérif. nom de domaine En attente                 │    │
│  │  ⏳ Recherche OAPI       En attente                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ████████████░░░░░░░░░░░░  60% complété                     │
│                                                              │
│  ⏱ Environ 1 minute restante...                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────┐
│  💡 Mode C — Vérifications légales & domaine  Étape 3 / 4   │
│  [████████████░░░░░░░░]  75%                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── NOM DU PROJET ──────────────────────────────────┐    │
│  │  "StockFacile" — proposé par l'IA                   │    │
│  │                                                     │    │
│  │  🔍 OAPI (Afrique francophone)   ✅ Disponible      │    │
│  │  🔍 RCCM Côte d'Ivoire           ✅ Non déposé      │    │
│  │  🔍 Réseaux sociaux              ⚠️ @stockfacile pris│   │
│  │                                                     │    │
│  │  Alternatives IA :                                  │    │
│  │  ○ StockoPro     ○ MonStock.ci    ○ GestoCi         │    │
│  │                              [ Garder StockFacile ] │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── DOMAINE ────────────────────────────────────────┐    │
│  │  stockfacile.ci    ✅ Disponible — 8 000 FCFA/an   │    │
│  │  stockfacile.io    ✅ Disponible — 18 €/an          │    │
│  │  stockfacile.com   ❌ Pris                          │    │
│  │  stockfacile.africa ✅ Disponible — 12 €/an        │    │
│  │                                                     │    │
│  │  [ Réserver .ci ] [ Réserver .io ] [ Plus tard ]   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── RISQUES IDENTIFIÉS ─────────────────────────────┐    │
│  │  ⚠️  Concurrent direct : "GestionStock" (beta, CI)  │    │
│  │  ✅  Aucun brevet bloquant identifié                │    │
│  │  💡  Recommandation : différencier par le offline   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│              [ ← Retour ]  [ Finaliser → ]                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 0.4 Écran final commun aux 3 modes — Dossier Projet

```
┌──────────────────────────────────────────────────────────────┐
│  🎉 Ton projet est prêt !                     Étape 4 / 4   │
│  [████████████████████]  100%                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── DOSSIER COMPLET ────────────────────────────────┐    │
│  │                                                     │    │
│  │  🎨 IDENTITÉ          ████████████████  100%        │    │
│  │  ✅ Nom · Tagline · Logo · Charte · Domaine         │    │
│  │                                                     │    │
│  │  📋 VISION            ████████████░░░░   80%        │    │
│  │  ✅ Pitch deck · Problème/Solution · Personas        │    │
│  │  ⚠️  Roadmap à compléter                            │    │
│  │                                                     │    │
│  │  💰 FINANCIER         ████████░░░░░░░░   55%        │    │
│  │  ✅ Modèle économique · One-pager                   │    │
│  │  ❌ Business plan · Prévisionnel 3 ans              │    │
│  │                                                     │    │
│  │  🔧 TECHNIQUE         ████████████████  100%        │    │
│  │  ✅ Cahier des charges · MVP · Stack                 │    │
│  │                                                     │    │
│  │  ⚖️  PROTECTION       ████████░░░░░░░░   50%        │    │
│  │  ✅ Horodatage ivoire.io (21 mars 2026 — 14:32)     │    │
│  │  ❌ Dépôt OAPI · Statuts juridiques                 │    │
│  │                                                     │    │
│  │  SCORE GLOBAL         ████████████░░░░   77%        │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── TÉLÉCHARGER MON DOSSIER ────────────────────────┐    │
│  │  [ 📥 Dossier complet ZIP ]                         │    │
│  │  [ 📄 One-pager PDF ]                               │    │
│  │  [ 📊 Pitch deck PDF ]                              │    │
│  │  [ 📋 Cahier des charges DOCX ]                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──── CONTINUER SUR IVOIRE.IO ────────────────────────┐    │
│  │  [ 🌐 Voir ma vitrine publique ]                    │    │
│  │  [ 💼 Confier le développement à ivoire.io ]        │    │
│  │  [ 👥 Recruter mon équipe ]                         │    │
│  │  [ 💰 Configurer ma levée de fonds ]                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│               [ 🏠 Aller au dashboard → ]                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. VUE D'ENSEMBLE *(modifiée)*

> Ajout du bloc "Score projet" et d'un CTA Project Builder si le score < 80%.

```
┌──────────────────────────────────────────────────────────────┐
│  Vue d'ensemble                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bienvenue, TechCI 🚀                                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👁️  1 204    │  │ ⭐  47       │  │ 📨  5        │      │
│  │ Visites      │  │ Votes reçus  │  │ Messages     │      │
│  │ ce mois      │  │ sur startups │  │ non lus      │      │
│  │ ↑ +24%       │  │ .ivoire.io   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👥  4        │  │ 💡  2        │  │ 🏆  #12      │      │
│  │ Membres      │  │ Produits     │  │ Classement   │      │
│  │ d'équipe     │  │ listés       │  │ startups CI  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── 🧱 SCORE PROJET — NOUVEAU ────────────────────────┐  │  ← NOUVEAU
│  │                                                        │  │
│  │  Dossier projet complété à 72%                        │  │
│  │  [██████████████████░░░░░░]                            │  │
│  │                                                        │  │
│  │  ✅ Identité complète      ✅ Logo validé              │  │
│  │  ✅ Pitch deck présent     ⚠️  Cahier des charges      │  │
│  │  ❌ Business plan         ❌ Analyse concurrents       │  │
│  │                                                        │  │
│  │  [ 🧱 Continuer dans le Project Builder → ]           │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── COMPLÉTION DU PROFIL ─────────────────────────────┐  │
│  │  Profil complété à 70%                                │  │
│  │  [██████████████░░░░░░]                                │  │
│  │  ✅ Infos de base        ✅ Logo uploadé              │  │
│  │  ✅ Description           ✅ 1+ produit ajouté         │  │
│  │  ❌ Équipe incomplète    ❌ Liens réseaux (1/4)       │  │
│  │  ❌ Info levée de fonds                                │  │
│  │  [ Compléter mon profil → ]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── CLASSEMENT startups.ivoire.io ─────────────────────┐  │
│  │  🏆 Top Startups de la semaine                        │  │
│  │  #10  MobileMoney+ (67 votes)                         │  │
│  │  #11  AgriTech CI (54 votes)                          │  │
│  │  #12  TechCI ← vous êtes ici (47 votes)              │  │
│  │  #13  LogiCI (41 votes)                               │  │
│  │  [ Voir le classement complet → ]                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── ACTIVITÉ RÉCENTE ──────────────────────────────────┐  │
│  │  ⭐  +5 votes cette semaine sur startups.ivoire.io    │  │
│  │  📨  Nouveau message de investisseur@fund.ci          │  │
│  │  👥  Marie Koné a rejoint votre équipe                │  │
│  │  👁️  68 nouvelles visites de votre vitrine            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── ACTIONS RAPIDES ───────────────────────────────────┐  │
│  │  [ 🚀 Modifier ma startup ]  [ 💡 Ajouter un produit ]│  │
│  │  [ 👥 Inviter un membre ]    [ 📣 Partager ma fiche ] │  │
│  │  [ 🧱 Project Builder ]      [ 📥 Télécharger dossier]│  │  ← NOUVEAU
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. MA STARTUP *(modifiée)*

> Ajout du bouton "Améliorer avec l'IA" sur les champs texte libres.
> Ajout du bloc "Documents générés" en bas de page.

```
┌──────────────────────────────────────────────────────────────┐
│  Ma Startup                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── IDENTITÉ ──────────────────────────────────────────┐ │
│  │                                                        │ │
│  │   ┌──────────┐   Nom de la startup *                  │ │
│  │   │          │   [________________________________]   │ │
│  │   │  LOGO    │                                        │ │
│  │   │  128px   │   Tagline * (1 phrase max 80 car.)     │ │
│  │   └──────────┘   [________________________________]   │ │
│  │   [ 📷 Changer ] [ 🤖 Générer logo IA ]              │ │  ← NOUVEAU
│  │                                                        │ │
│  │   Slug : techci.ivoire.io  🔒 définitif               │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── INFORMATIONS ──────────────────────────────────────┐ │
│  │  (identique à V1)                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── DESCRIPTION ───────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Description longue                                    │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ (texte libre, max 1000 caractères)             │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │  456 / 1000 caractères                                │ │
│  │  [ 🤖 Améliorer avec l'IA ]  [ 🔄 Réécrire ]        │ │  ← NOUVEAU
│  │                                                        │ │
│  │  Problème résolu (en 1 phrase)                        │ │
│  │  [________________________________]                   │ │
│  │  [ 🤖 Suggérer une formulation ]                     │ │  ← NOUVEAU
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── STACK TECHNIQUE ───────────────────────────────────┐ │
│  │  (identique à V1)                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── LIENS ─────────────────────────────────────────────┐ │
│  │  (identique à V1)                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── RECHERCHE EN COURS ────────────────────────────────┐ │
│  │  (identique à V1)                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── DOCUMENTS DU PROJET ───────────────────────────────┐ │  ← NOUVEAU
│  │                                                        │ │
│  │  Pitch deck         📊 pitch-techci.pdf   [👁️] [🗑️] │ │
│  │  Cahier des charges 📋 Non généré   [ 🤖 Générer ]   │ │
│  │  Business plan      💰 Non uploadé  [ 📤 Uploader ]  │ │
│  │  One-pager          📄 Non généré   [ 🤖 Générer ]   │ │
│  │  Analyse concurrents🔍 Non généré   [ 🤖 Générer ]   │ │
│  │                                                        │ │
│  │  Horodatage projet : 21 mars 2026 — 14:32 UTC 🔒     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                     [ 💾 Enregistrer les modifications ]     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. ÉQUIPE *(inchangé)*
## 4. PRODUITS *(inchangé)*
## 5. MESSAGES & CANDIDATURES *(inchangé)*
## 6. STATISTIQUES *(inchangé)*
## 7. LEVÉE DE FONDS *(inchangé)*
## 8. TEMPLATE & VITRINE *(inchangé)*
## 9. PARAMÈTRES *(inchangé)*
## 10. RECRUTEMENT & PIPELINE *(inchangé)*

---

## ENDPOINTS API — PROJECT BUILDER (nouveaux)

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/project-builder/mode` | POST | Initialiser avec le mode A/B/C |
| `/api/project-builder/upload` | POST | Upload et classification auto des fichiers |
| `/api/project-builder/audit` | POST | Lancer l'audit IA du dossier |
| `/api/project-builder/generate` | POST | Générer un document spécifique |
| `/api/project-builder/generate/all` | POST | Générer tous les documents manquants |
| `/api/project-builder/interview` | POST | Soumettre une réponse d'entretien IA |
| `/api/project-builder/domain/check` | POST | Vérifier disponibilité domaine |
| `/api/project-builder/oapi/check` | POST | Vérifier disponibilité nom OAPI |
| `/api/project-builder/competitors` | POST | Lancer analyse concurrents |
| `/api/project-builder/finalize` | POST | Finaliser et intégrer au dashboard |
| `/api/project-builder/export` | GET | Télécharger le dossier complet ZIP |
| `/api/project-builder/score` | GET | Score de complétude du projet |

---

## GRATUIT vs PREMIUM — Mise à jour

| Fonctionnalité | 🆓 Gratuit | ⭐ Premium |
|---|:---:|:---:|
| Project Builder (mode A) | ✅ | ✅ |
| Project Builder (mode B) | ✅ | ✅ |
| Project Builder (mode C) | ✅ | ✅ |
| Génération description courte | ✅ | ✅ |
| Génération logo (3 propositions) | ✅ | ✅ |
| Génération pitch deck | ✅ | ✅ |
| Génération cahier des charges | ❌ | ✅ |
| Analyse concurrents | 1 fois | Illimitée |
| Vérification domaine | ✅ | ✅ |
| Vérification OAPI | ❌ | ✅ |
| Export dossier ZIP | ❌ | ✅ |
| Régénération documents | 3x | Illimitée |
| Business plan complet | ❌ | ✅ |
| Prévisionnel financier | ❌ | ✅ |
| Vitrine publique | ✅ | ✅ |
| Infos startup | ✅ | ✅ |
| Équipe | 5 membres | ∞ |
| Produits | 2 max | ∞ |
| Stats avancées | ❌ | ✅ |
| Templates | 3 gratuits | 10+ tous |
| Levée de fonds (tracker) | ❌ | ✅ |
| Offres d'emploi | 1 max | ∞ |
| Entretiens visio intégrés | ❌ | ✅ |
