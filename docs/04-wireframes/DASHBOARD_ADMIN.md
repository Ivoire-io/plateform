# 📐 DASHBOARD ADMIN — Spécification Complète 100%

> **Rôle** : `is_admin = true` dans la table `ivoireio_profiles`  
> **URL** : `ivoire.io/admin`  
> **Sécurité** : RLS strict + vérification `is_admin` côté serveur sur chaque endpoint  
> **Accès** : Uniquement les comptes manuellement promus par le propriétaire

## ✅ IMPLÉMENTÉ — 14 mars 2026

| Composant | Fichier | Statut |
|-----------|---------|--------|
| Layout sécurisé | `app/admin/layout.tsx` | ✅ |
| Page + data fetching | `app/admin/page.tsx` | ✅ |
| AdminShell + sidebar | `components/admin/admin-shell.tsx` | ✅ |
| Vue générale | `tabs/overview-tab.tsx` | ✅ |
| Utilisateurs | `tabs/users-tab.tsx` | ✅ |
| Waitlist | `tabs/waitlist-tab.tsx` | ✅ |
| Messages | `tabs/messages-tab.tsx` | ✅ |
| Modération | `tabs/moderation-tab.tsx` | ✅ |
| Analytics | `tabs/analytics-tab.tsx` | ✅ |
| Abonnements | `tabs/subscriptions-tab.tsx` | ✅ |
| Configuration | `tabs/config-tab.tsx` | ✅ |
| Logs | `tabs/logs-tab.tsx` | ✅ |
| Feature Flags | `tabs/feature-flags-tab.tsx` | ✅ |
| Broadcasting | `tabs/broadcasting-tab.tsx` | ✅ |
| Templates | `tabs/templates-tab.tsx` | ✅ |
| API `/api/admin/*` | 22 routes | ✅ |
| Helper sécurité | `lib/admin-guard.ts` | ✅ |
| Migration SQL | `supabase/migrations/003_admin_schema.sql` | ✅ |

---

## TABLE DES MATIÈRES

1. [Dashboard Général](#1-dashboard-général)
2. [Gestion des Utilisateurs](#2-gestion-des-utilisateurs)
3. [Waitlist](#3-waitlist)
4. [Gestion des Startups](#4-gestion-des-startups)
5. [Gestion des Offres d'emploi](#5-gestion-des-offres-demploi)
6. [Messages & Contact](#6-messages--contact)
7. [Modération & Signalements](#7-modération--signalements)
8. [Analytics Plateforme](#8-analytics-plateforme)
9. [Abonnements & Revenus](#9-abonnements--revenus)
10. [Configuration](#10-configuration)
11. [Logs d'activité](#11-logs-dactivité)
12. [Feature Flags — Activation Progressive](#12-feature-flags--activation-progressive)
13. [Broadcasting — Notifications de Masse](#13-broadcasting--notifications-de-masse)
14. [Gestion des Templates](#14-gestion-des-templates)

---

## SIDEBAR — Navigation Admin

```
┌────────────────────────────────┐
│  [logo] ivoire.io              │
│  🔴 Administration              │
│                                │
│  ┌──────────┐                  │
│  │  Avatar  │ Admin            │
│  │          │ admin@ivoire.io  │
│  └──────────┘                  │
│                                │
│──────────────────────────────│
│  📌 VUE GÉNÉRALE             │
│  └── 📊  Dashboard            │
│                                │
│  📌 UTILISATEURS             │
│  ├── 👥  Profils (1 247)      │
│  ├── ⏳  Waitlist (89)        │
│  └── 🚫  Comptes suspendus (3)│
│                                │
│  📌 CONTENU                   │
│  ├── 🚀  Startups (34)        │
│  ├── 💼  Offres d'emploi (12) │
│  └── 📨  Messages contact (23)│
│                                │
│  📌 MODÉRATION               │
│  ├── 🚨  Signalements (2)     │
│  └── ✅  Validations (4)      │
│                                │
│  📌 BUSINESS                  │
│  ├── 📈  Analytics            │
│  ├── 💳  Abonnements          │
│  └── 💰  Revenus              │
│                                │
│  📌 CONTRÔLE                  │
│  ├── 🎛️  Feature Flags        │
│  ├── 📢  Broadcasting         │
│  └── 🎨  Templates            │
│                                │
│  📌 SYSTÈME                   │
│  ├── ⚙️  Configuration        │
│  ├── 📋  Logs d'activité      │
│  └── 🔧  Maintenance          │
│                                │
│  📌 FOOTER                    │
│  └── ⬅️  Déconnexion          │
│                                │
└────────────────────────────────┘
```

---

## 1. DASHBOARD GÉNÉRAL

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard Admin             Dernière mise à jour : 14/03/26 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── MÉTRIQUES CLÉS ──                                       │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ 👥 1 247   │ │ 🚀 34      │ │ 🏢 12      │ │ 💼 6     ││
│  │ Profils    │ │ Startups   │ │ Entreprises│ │ Offres   ││
│  │ total      │ │ listées    │ │ certifiées │ │ actives  ││
│  │ +87 ce mois│ │ +3 ce mois │ │ +1 ce mois │ │          ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐│
│  │ ⏳ 89      │ │ 📨 23      │ │ 🚨 2       │ │ 💰 $2.4K ││
│  │ Waitlist   │ │ Messages   │ │ Signalements│ │ MRR      ││
│  │ en attente │ │ non lus    │ │ en attente │ │ ↑ +18%   ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘│
│                                                              │
│  ── RÉPARTITION DES PROFILS ──                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │                                                        ││
│  │  🧑‍💻 Développeurs █████████████████████████  78% (973) ││
│  │  🚀 Startups      █████                      12% (150) ││
│  │  🏢 Entreprises   ██                           5% (62)  ││
│  │  👤 Autres        ██                           5% (62)  ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── INSCRIPTIONS (30 derniers jours — courbe) ──            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  30│              ╱╲                                   ││
│  │    │    ╱╲       ╱  ╲  ╱╲                             ││
│  │  20│   ╱  ╲  ╱╲╱    ╲╱  ╲                            ││
│  │    │  ╱    ╲╱                ╲                         ││
│  │  10│ ╱                        ╲                        ││
│  │    └──┬──┬──┬──┬──┬──┬──┬──┬──                        ││
│  │     14/2  21/2 28/2  7/3  14/3                        ││
│  │                                                        ││
│  │  ── Total  ── Devs  ── Startups                       ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── ACTIVITÉ RÉCENTE ──                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  🟢  ulrich.ivoire.io  — Profil créé        — 2h     ││
│  │  🟢  fatou.ivoire.io   — Profil créé        — 5h     ││
│  │  🔵  TechCI            — Startup ajoutée    — hier   ││
│  │  🟡  jean@test.ci      — Inscrit waitlist   — hier   ││
│  │  🔴  spammer@mail.com  — Compte signalé     — hier   ││
│  │  💳  Acme Corp          — Abonnement Enterprise— 2j  ││
│  │  🏅  InfoTech CI        — Badge certifié     — 3j    ││
│  │                                                        ││
│  │  [ Voir tous les logs → ]                              ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── ACTIONS URGENTES ──                                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  🚨 2 signalements en attente de revue                ││
│  │  ✅ 4 entreprises en attente de certification          ││
│  │  ⏳ 89 inscrits waitlist à convertir                   ││
│  │  📨 23 messages contact non répondus                   ││
│  │                                                        ││
│  │  [ Traiter les signalements ]  [ Certifier ]           ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. GESTION DES UTILISATEURS

### Liste des profils

```
┌──────────────────────────────────────────────────────────────┐
│  Profils (1 247)                     [ 📥 Export CSV ]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher par nom, email, slug...           ]       │
│                                                              │
│  Filtres :                                                   │
│  Type : [Tous ▾] [Dev ▾] [Startup ▾] [Enterprise ▾] [Autre]│
│  Statut : [Tous ▾] [Actif ▾] [Suspendu ▾]                  │
│  Date : [Tous ▾] [Ce mois ▾] [Cette semaine ▾]             │
│  Plan : [Tous ▾] [Gratuit ▾] [Premium ▾] [Enterprise ▾]    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  │ Avatar │ Nom / Slug      │ Email      │ Type │ Plan │ Statut │ Inscrit │ Actions │
│  │  ├────────┼─────────────────┼────────────┼──────┼──────┼────────┼─────────┼─────────│
│  │  │ [img]  │ Ulrich Kouamé   │ ul@m.ci    │ dev  │ ⭐🆓 │ ✅     │ 14/03  │ ⚙️     │
│  │  │        │ ulrich.ivoire.io│            │      │      │        │        │         │
│  │  ├────────┼─────────────────┼────────────┼──────┼──────┼────────┼─────────┼─────────│
│  │  │ [img]  │ TechCI          │ t@ci.com   │ strt │ 🆓   │ ✅     │ 10/02  │ ⚙️     │
│  │  │        │ techci.ivoire.io│            │      │      │        │        │         │
│  │  ├────────┼─────────────────┼────────────┼──────┼──────┼────────┼─────────┼─────────│
│  │  │ [img]  │ Acme Corp       │ h@acme.ci  │ ent  │ 🏢   │ ✅ 🏅 │ 15/01  │ ⚙️     │
│  │  │        │ acme.ivoire.io  │            │      │      │        │        │         │
│  │  ├────────┼─────────────────┼────────────┼──────┼──────┼────────┼─────────┼─────────│
│  │  │ [img]  │ Spammer         │ sp@sp.biz  │ other│ 🆓   │ 🚫    │ 12/03  │ ⚙️     │
│  │  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Page 1 / 52   [ ← ]  1  2  3  ...  52  [ → ]              │
│  20 / page     [20 ▾] [50 ▾] [100 ▾]                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Détail / Actions sur un profil (Sheet)

```
┌──────────────────────────────────────────────────────────────┐
│  Profil : Ulrich Kouamé                               [ ✕ ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Avatar]  ulrich.ivoire.io                                  │
│  Email : ul@mail.ci · Type : developer · Plan : Gratuit     │
│  Inscrit le 14/03/2026 · Dernière connexion : il y a 2h     │
│                                                              │
│  ── QUICK STATS ──                                          │
│  Projets : 6 · Expériences : 4 · Messages reçus : 12       │
│  Visites portfolio : 342 ce mois                            │
│                                                              │
│  ── ACTIONS ADMIN ──                                        │
│                                                              │
│  [ 👁️ Voir portfolio ]  [ ✏️ Modifier le profil ]           │
│  [ ⭐ Forcer Premium ]  [ 🔄 Changer de type ]             │
│  [ 🚫 Suspendre le compte ]  [ ✅ Réactiver ]              │
│  [ 🗑️ Supprimer définitivement ]                            │
│  [ 📧 Envoyer un email ]                                    │
│  [ 🏅 Ajouter badge vérifié ]                               │
│  [ 🔑 Promouvoir admin ]                                    │
│                                                              │
│  ── NOTES ADMIN ──                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │ (notes internes, non visibles par l'utilisateur)   │    │
│  └────────────────────────────────────────────────────┘    │
│  [ 💾 Sauvegarder les notes ]                               │
│                                                              │
│  ── HISTORIQUE ──                                           │
│  14/03 10:00 — Profil créé                                  │
│  14/03 10:15 — Avatar uploadé                               │
│  14/03 11:00 — 6 projets ajoutés                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. WAITLIST

```
┌──────────────────────────────────────────────────────────────┐
│  Waitlist (89 en attente)                                    │
│  [ ✅ Inviter tous ]  [ 📧 Email de rappel ]  [ 📥 Export ] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher...  ]   Filtre : [Tous ▾] [dev] [startup] │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Nom        │ Email       │ Slug désiré│ Type │ Date │ WhatsApp │ Action │
│  ├─────────────┼─────────────┼────────────┼──────┼──────┼──────────┼────────│
│  │ Jean Koné   │ j@mail.ci   │ jean       │ dev  │ 13/3 │ +225...  │ [✅🗑️]│
│  │ Acme Corp   │ h@acme.ci   │ acme       │ ent. │ 12/3 │ —        │ [✅🗑️]│
│  │ Marie D.    │ m@test.ci   │ marie      │ dev  │ 10/3 │ +225...  │ [✅🗑️]│
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ✅ = Envoyer l'invitation (crée le compte + email)         │
│  🗑️ = Supprimer de la waitlist                              │
│                                                              │
│  ── STATS WAITLIST ──                                       │
│  Total inscrits : 312 · Invités : 223 · En attente : 89    │
│  Taux de conversion (invité → profil actif) : 67%           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. GESTION DES STARTUPS

```
┌──────────────────────────────────────────────────────────────┐
│  Startups (34)                               [ 📥 Export ]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher...  ]   Filtre : [Secteur ▾] [Stade ▾]   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Logo │ Nom       │ Secteur  │ Stade    │ Votes │ Actions │
│  ├───────┼───────────┼──────────┼──────────┼───────┼─────────│
│  │ [img] │ TechCI    │ Fintech  │ Pré-seed │ 47    │ ⚙️ 🚫 │
│  │ [img] │ AgriSmart │ Agritech │ Seed     │ 54    │ ⚙️ 🚫 │
│  │ [img] │ EduPro    │ Edtech   │ Idée     │ 12    │ ⚙️ 🚫 │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Actions : ⚙️ Détails/Modifier · 🚫 Suspendre              │
│            🏅 Mettre en avant · 🗑️ Supprimer                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. GESTION DES OFFRES D'EMPLOI

```
┌──────────────────────────────────────────────────────────────┐
│  Offres d'emploi (12)                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 [  Rechercher...  ]   Statut : [Toutes ▾] [Actives ▾]  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Entreprise │ Poste          │ Lieu    │ Type │ Candidats │ Statut │ Actions │
│  ├─────────────┼────────────────┼─────────┼──────┼───────────┼────────┼─────────│
│  │ Acme Corp   │ Flutter Senior │ Abidjan │ CDI  │ 12        │ 🟢    │ ⚙️     │
│  │ Acme Corp   │ Data Engineer  │ Remote  │ CDI  │ 5         │ 🟢    │ ⚙️     │
│  │ TechCI      │ Backend Dev    │ Abidjan │ Free │ 3         │ 🟢    │ ⚙️     │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Actions admin : Voir détails · Désactiver · Supprimer ·   │
│  Marquer comme sponsorisée                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. MESSAGES & CONTACT

```
┌──────────────────────────────────────────────────────────────┐
│  Messages de contact (23)                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Messages reçus via les formulaires de contact sur tous     │
│  les profils de la plateforme.                              │
│                                                              │
│  Filtre : [Tous ▾] [Non lus ▾] [Destinataire ▾]            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  De            │ À (profil)     │ Extrait    │ Date │ Lu │
│  ├────────────────┼────────────────┼────────────┼──────┼────│
│  │ marie@tech.ci  │ ulrich.ivoire  │ "Bonjour.."│ 2h  │ 🔵│
│  │ hr@acme.ci     │ fatou.ivoire   │ "Nous ch.."│ 5h  │ 🔵│
│  │ jean@mail.ci   │ techci.ivoire  │ "Question."│ 1j  │ ⚪│
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ⚠️ Vue en lecture seule — les messages sont privés        │
│     entre l'expéditeur et le destinataire.                  │
│  L'admin peut voir pour modération uniquement.              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. MODÉRATION & SIGNALEMENTS

```
┌──────────────────────────────────────────────────────────────┐
│  Modération                                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── SIGNALEMENTS EN ATTENTE (2) ──                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🚨  spammer@mail.com (spammer.ivoire.io)           │   │
│  │      Signalé par 2 utilisateurs                      │   │
│  │      Motifs : "Contenu trompeur", "Spam"             │   │
│  │      Date du premier signalement : 12/03/2026        │   │
│  │                                                      │   │
│  │  [ 👁️ Voir profil ] [ 🚫 Suspendre ] [ ✅ Ignorer ] │   │
│  │  [ 🗑️ Supprimer définitivement ]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🚨  fakestartup.ivoire.io                          │   │
│  │      Signalé par 1 utilisateur                       │   │
│  │      Motif : "Startup inexistante / faux profil"     │   │
│  │                                                      │   │
│  │  [ 👁️ Voir profil ] [ 🚫 Suspendre ] [ ✅ Ignorer ] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ── VALIDATION ENTREPRISES (Badge certifié 🏅) ──          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Logo] Acme Corp — acme.ivoire.io                  │   │
│  │  Demande de certification reçue le 10/03            │   │
│  │  Documents fournis : RCCM, logo officiel            │   │
│  │                                                      │   │
│  │  [ 👁️ Voir docs ] [ 🏅 Certifier ] [ ❌ Refuser ]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Logo] InfoTech CI — infotech.ivoire.io            │   │
│  │  Demande reçue le 09/03                             │   │
│  │  Documents : Attestation DFE                        │   │
│  │                                                      │   │
│  │  [ 👁️ Voir docs ] [ 🏅 Certifier ] [ ❌ Refuser ]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ── COMPTES SUSPENDUS (3) ──                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  spammer.ivoire.io — Suspendu le 13/03              │   │
│  │  Motif : Spam                                        │   │
│  │  [ ✅ Réactiver ] [ 🗑️ Supprimer définitivement ]    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. ANALYTICS PLATEFORME

```
┌──────────────────────────────────────────────────────────────┐
│  Analytics Plateforme        Période : [7j] [30j] [90j] [1an]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── TRAFIC GLOBAL ──                                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 👁️  12 456   │  │ 🧑‍🤝‍🧑 5 234    │  │ ⏱️  3m 12s    │      │
│  │ Pages vues   │  │ Visiteurs    │  │ Durée moy.  │      │
│  │ ↑ +22%       │  │ uniques      │  │ session     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──── TRAFIC PAR PORTAIL ──────────────────────────────────┐│
│  │                                                        ││
│  │  ivoire.io (landing)  ████████████████  3 402 (27%)    ││
│  │  devs.ivoire.io       ████████████     1 889 (15%)     ││
│  │  Portfolios (*.io)    ███████████████████  4 234 (34%) ││
│  │  startups.ivoire.io   ████████         1 012 (8%)      ││
│  │  jobs.ivoire.io       ██████            756 (6%)       ││
│  │  Autres portails      ████████         1 163 (10%)     ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──── TOP PORTFOLIOS ──────────────────────────────────────┐│
│  │  1. ulrich.ivoire.io   — 445 visites                   ││
│  │  2. fatou.ivoire.io    — 312 visites                   ││
│  │  3. yapi.ivoire.io     — 287 visites                   ││
│  │  4. awa.ivoire.io      — 198 visites                   ││
│  │  5. jean.ivoire.io     — 156 visites                   ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──── PROVENANCE GÉOGRAPHIQUE ──────────────────────────┐  │
│  │  🇨🇮 Côte d'Ivoire  — 65%   ████████████████████      │  │
│  │  🇫🇷 France          — 14%   ████                      │  │
│  │  🇸🇳 Sénégal         — 6%    ██                        │  │
│  │  🇧🇫 Burkina Faso    — 4%    █                         │  │
│  │  🇺🇸 États-Unis      — 3%    █                         │  │
│  │  🌍 Autres           — 8%    ██                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──── SOURCES DE TRAFIC ──────────────────────────────────┐ │
│  │  🔍 Google Search   — 38%                              │ │
│  │  🔗 Direct          — 24%                              │ │
│  │  💼 LinkedIn         — 18%                              │ │
│  │  🐦 Twitter/X       — 11%                              │ │
│  │  📱 Autres           — 9%                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── COURBE INSCRIPTIONS ────────────────────────────────┐ │
│  │  (Graphique : inscriptions cumulées + par jour)        │ │
│  │  Total : 1 247 profils · Objectif : 2 000              │ │
│  │  [████████████████████░░░░░░░░]  62%                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [ 📥 Exporter le rapport complet (CSV) ]                   │
│  [ 📄 Générer le rapport mensuel (PDF) ]                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. ABONNEMENTS & REVENUS

```
┌──────────────────────────────────────────────────────────────┐
│  Abonnements & Revenus                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── RÉSUMÉ FINANCIER ──                                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 💰  $2 400   │  │ 📈  $28 800  │  │ 💳  47       │      │
│  │ MRR          │  │ ARR projeté  │  │ Abonnés      │      │
│  │ ↑ +18%       │  │              │  │ actifs       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ── DÉTAIL PAR PLAN ──                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Plan            │ Abonnés │ Prix unit.  │ Total/mois ││
│  ├──────────────────┼─────────┼─────────────┼────────────││
│  │ Dev Premium      │ 23      │ 3 000 FCFA  │ 69 000 F   ││
│  │ Startup Premium  │ 12      │ 5 000 FCFA  │ 60 000 F   ││
│  │ Enterprise       │ 12      │ 20 000 FCFA │ 240 000 F  ││
│  ├──────────────────┼─────────┼─────────────┼────────────││
│  │ **TOTAL**        │ **47**  │             │ **$2 400** ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── DERNIÈRES TRANSACTIONS ──                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  14/03  Acme Corp       Enterprise  20 000 F  ✅ Payé ││
│  │  13/03  ulrich@mail.ci  Dev Premium  3 000 F  ✅ Payé ││
│  │  12/03  TechCI          Startup Prem 5 000 F  ✅ Payé ││
│  │  10/03  fatou@mail.ci   Dev Premium  3 000 F  ⚠️ Échec││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── CHURN ──                                                │
│  Résiliations ce mois : 2 · Taux de churn : 4.2%          │
│                                                              │
│  [ 📥 Export rapport financier ]                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. CONFIGURATION

```
┌──────────────────────────────────────────────────────────────┐
│  Configuration Plateforme                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──── INSCRIPTIONS ──────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Mode d'inscription                                   │ │
│  │  [●] Sur invitation (waitlist)                        │ │
│  │  [ ] Ouvert à tous                                    │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── EMAILS ────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Email de bienvenue       [●] Activé  [ ] Désactivé  │ │
│  │  Email de contact         [●] Activé  [ ] Désactivé  │ │
│  │  Rapport hebdo admin      [●] Activé  [ ] Désactivé  │ │
│  │  Rappel waitlist (7j)     [●] Activé  [ ] Désactivé  │ │
│  │                                                        │ │
│  │  Expéditeur : noreply@ivoire.io                       │ │
│  │  Provider : Resend (re_xxx...)                        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── SLUGS RÉSERVÉS ────────────────────────────────────┐ │
│  │                                                        │ │
│  │  www · mail · api · admin · app · devs · startups ·   │ │
│  │  jobs · learn · health · data · events · invest ·     │ │
│  │  blog · docs · status · support · help · about ·      │ │
│  │  contact · pricing · terms · privacy                  │ │
│  │                                                        │ │
│  │  [ + Ajouter un slug réservé ]                        │ │
│  │  [___________________] [ ✅ Ajouter ]                 │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── TARIFICATION ──────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Dev Premium      [3 000] FCFA/mois  (~$5)            │ │
│  │  Startup Premium  [5 000] FCFA/mois  (~$8)            │ │
│  │  Enterprise       [20 000] FCFA/mois (~$33)           │ │
│  │                                                        │ │
│  │  Méthode de paiement : Wave, Orange Money, Carte     │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── SEO & SOCIAL ──────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Titre SEO      [ivoire.io — L'OS Digital de la CI]   │ │
│  │  Description     [Le hub central des développeurs...] │ │
│  │  OG Image        [og-image.webp]  [ 📷 Changer ]     │ │
│  │  Twitter handle  [@ivoire_io]                         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──── MAINTENANCE ───────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Mode maintenance                                     │ │
│  │  [ ] Activé (affiche "Maintenance en cours")          │ │
│  │  [●] Désactivé                                        │ │
│  │                                                        │ │
│  │  [ 🔄 Purger le cache CDN ]                           │ │
│  │  [ 🗄️ Backup base de données ]                        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                          [ 💾 Enregistrer la configuration ] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. LOGS D'ACTIVITÉ

```
┌──────────────────────────────────────────────────────────────┐
│  Logs d'activité                         [ 📥 Export CSV ]   │
│  Filtre : [Tous ▾] [Profils ▾] [Système ▾] [Paiements ▾]  │
│  Période : [Aujourd'hui ▾] [7 jours ▾] [30 jours ▾]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  14/03 12:00  🟢 PROFIL  ulrich — Profil créé              │
│  14/03 12:05  🟢 PROFIL  ulrich — Avatar uploadé            │
│  14/03 12:10  🔵 CONTENU ulrich — 6 projets ajoutés         │
│  14/03 11:00  💳 PAIEMENT Acme Corp — Enterprise renouvelé  │
│  14/03 10:30  🟡 WAITLIST jean@mail.ci — Inscription        │
│  14/03 10:00  🔴 MODÉRA  spammer — Signalé (2x)            │
│  13/03 18:00  🟢 PROFIL  fatou — Profil mis à jour          │
│  13/03 15:00  🏅 CERTIF  Acme Corp — Badge certifié émis    │
│  13/03 12:00  ⚙️ SYSTÈME — Purge cache CDN                 │
│  ...                                                        │
│                                                              │
│  Page 1 / 234  [ ← ]  1  2  3  ...  [ → ]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. FEATURE FLAGS — Activation Progressive

> **Objectif** : Activer/désactiver n'importe quel portail ou fonctionnalité en un clic.  
> Permet un déploiement progressif : lancer en beta privée, puis beta publique, puis GA.  
> Évite le "Big Bang" où tout arrive d'un coup sans contrôle.

```
┌──────────────────────────────────────────────────────────────┐
│  🎛️ Feature Flags — Activation Progressive                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── PORTAILS ─────────────────────────────────────────────  │
│  Chaque portail peut être : 🔴 OFF  🟡 BETA  🟢 PUBLIC     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Portail             │ État    │ Accès            │ ⚙️ ││
│  ├──────────────────────┼─────────┼──────────────────┼────││
│  │  devs.ivoire.io      │ 🟢 PUBLIC│ Tous            │ [⚙]││
│  │  [slug].ivoire.io    │ 🟢 PUBLIC│ Tous            │ [⚙]││
│  │  startups.ivoire.io  │ 🟡 BETA │ Invités (34)    │ [⚙]││
│  │  jobs.ivoire.io      │ 🟡 BETA │ Entreprises     │ [⚙]││
│  │  learn.ivoire.io     │ 🔴 OFF  │ —               │ [⚙]││
│  │  events.ivoire.io    │ 🔴 OFF  │ —               │ [⚙]││
│  │  health.ivoire.io    │ 🔴 OFF  │ —               │ [⚙]││
│  │  invest.ivoire.io    │ 🔴 OFF  │ —               │ [⚙]││
│  │  data.ivoire.io      │ 🔴 OFF  │ —               │ [⚙]││
│  │  blog.ivoire.io      │ 🟢 PUBLIC│ Tous            │ [⚙]││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── DÉTAIL (clic sur ⚙️) ─── Sheet latéral ───────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  ⚙️ jobs.ivoire.io                                    ││
│  │                                                        ││
│  │  État                                                  ││
│  │  ( ) 🔴 OFF — Page "Bientôt disponible" affichée      ││
│  │  (●) 🟡 BETA — Accès restreint à une liste            ││
│  │  ( ) 🟢 PUBLIC — Accès ouvert à tous                  ││
│  │                                                        ││
│  │  ── Si BETA ──                                        ││
│  │  Qui peut accéder ?                                    ││
│  │  [●] Par type : [☑ enterprise] [☐ startup] [☐ dev]   ││
│  │  [ ] Par liste d'emails : [textarea]                  ││
│  │  [ ] Les N premiers inscrits : [____]                 ││
│  │                                                        ││
│  │  ── Page "Coming Soon" (si OFF) ──                    ││
│  │  Message personnalisé :                                ││
│  │  [Ce portail arrive bientôt ! 🚀____________]         ││
│  │  Afficher waitlist spécifique : [●] Oui [ ] Non      ││
│  │                                                        ││
│  │  ── Historique ──                                     ││
│  │  14/03 — Passé de OFF → BETA (par admin@ivoire.io)   ││
│  │  01/03 — Créé en état OFF                             ││
│  │                                                        ││
│  │  [ 💾 Enregistrer ]  [ ✖ Annuler ]                   ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── FONCTIONNALITÉS INDIVIDUELLES ────────────────────────  │
│  (Activer/désactiver des briques à l'intérieur d'un portail)│
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Fonctionnalité           │ Portail      │ État       ││
│  ├───────────────────────────┼──────────────┼────────────││
│  │  Messagerie interne       │ Global       │ [🟢 ON ]  ││
│  │  Visioconférence          │ jobs.        │ [🔴 OFF]  ││
│  │  Calendrier d'entretiens  │ jobs.        │ [🔴 OFF]  ││
│  │  Votes & Commentaires     │ startups.    │ [🟢 ON ]  ││
│  │  Paiement Mobile Money    │ Global       │ [🟡 BETA] ││
│  │  Paiement Stripe          │ Global       │ [🟢 ON ]  ││
│  │  Export PDF Portfolio      │ [slug].      │ [🟢 ON ]  ││
│  │  Domaine personnalisé     │ [slug].      │ [🔴 OFF]  ││
│  │  Analytics portfolio       │ [slug].      │ [🟡 BETA] ││
│  │  Open Data API            │ data.        │ [🔴 OFF]  ││
│  │  Système de quiz          │ learn.       │ [🔴 OFF]  ││
│  │  Mentorat                 │ learn.       │ [🔴 OFF]  ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ℹ️  Un portail OFF masque automatiquement toutes ses       │
│     fonctionnalités. Un portail BETA rend les features      │
│     disponibles uniquement aux utilisateurs autorisés.      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Fonctionnement technique

| Concept | Implémentation |
|---|---|
| **Stockage** | Table `ivoireio_feature_flags` (key, state, allowed_types, allowed_emails, coming_soon_message, updated_by) |
| **Lecture** | API `/api/admin/flags` + cache Redis/bord 60s |
| **Côté client** | Hook `useFeatureFlag("jobs")` → retourne `off/beta/public` |
| **Middleware** | `proxy.ts` vérifie l'état du portail avant de router. Si OFF → page coming soon. Si BETA → vérif accès. |
| **Logs** | Chaque changement de flag est loggé avec timestamp + admin |

---

## 13. BROADCASTING — Notifications de Masse

> **Objectif** : Envoyer des notifications, emails, ou messages in-app à tout ou partie des utilisateurs.  
> Filtrage chirurgical pour ne jamais spammer inutilement.

```
┌──────────────────────────────────────────────────────────────┐
│  📢 Broadcasting — Notifications de Masse                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── NOUVEAU BROADCAST ─────────────────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  📝 Composer un message                                ││
│  │                                                        ││
│  │  Objet :                                               ││
│  │  [🚀 jobs.ivoire.io est en ligne !___________]        ││
│  │                                                        ││
│  │  Message :                                             ││
│  │  ┌──────────────────────────────────────────────────┐ ││
│  │  │  Éditeur rich text (Markdown)                    │ ││
│  │  │                                                  │ ││
│  │  │  Bonjour {prénom},                               │ ││
│  │  │                                                  │ ││
│  │  │  Le portail emploi d'ivoire.io est maintenant    │ ││
│  │  │  disponible ! Publiez vos offres et trouvez      │ ││
│  │  │  les meilleurs talents de Côte d'Ivoire.         │ ││
│  │  │                                                  │ ││
│  │  │  👉 Accéder → jobs.ivoire.io                     │ ││
│  │  │                                                  │ ││
│  │  │  Variables : {prénom} {nom} {slug} {type}        │ ││
│  │  └──────────────────────────────────────────────────┘ ││
│  │                                                        ││
│  │  ── CANAUX D'ENVOI ──                                  ││
│  │  [☑] 📧 Email (via Resend)                            ││
│  │  [☑] 🔔 Notification in-app                           ││
│  │  [☐] 💬 SMS (via provider — futur)                    ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── CIBLAGE (filtres combinables) ─────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  🎯 Audience cible                                     ││
│  │                                                        ││
│  │  Par type de profil :                                  ││
│  │  [☑] Développeurs  [☑] Startups  [☑] Entreprises     ││
│  │  [☐] Autres        [☐] Admins                        ││
│  │                                                        ││
│  │  Par plan :                                            ││
│  │  [☑] Gratuit  [☑] Premium  [☑] Enterprise            ││
│  │                                                        ││
│  │  Par ville :                                           ││
│  │  [Toutes ▾]  ou  [☑ Abidjan] [☑ Bouaké] [☐ Yamoussoukro]││
│  │                                                        ││
│  │  Par date d'inscription :                              ││
│  │  ( ) Tous                                              ││
│  │  (●) Inscrits depuis le : [01/01/2026]                ││
│  │  ( ) Inscrits les N derniers jours : [30]             ││
│  │                                                        ││
│  │  Par activité :                                        ││
│  │  ( ) Tous                                              ││
│  │  ( ) Actifs (connexion < 30j)                         ││
│  │  ( ) Inactifs (connexion > 30j)                       ││
│  │  ( ) Jamais connectés                                 ││
│  │                                                        ││
│  │  Par compétence (devs uniquement) :                    ││
│  │  [React] [Node.js] [+Ajouter]                        ││
│  │                                                        ││
│  │  Par disponibilité :                                   ││
│  │  [☑] Disponibles  [☑] Non disponibles                ││
│  │                                                        ││
│  │  ──────────────────────────────────────────────         ││
│  │  📊 Estimation : **847 destinataires**                 ││
│  │  ──────────────────────────────────────────────         ││
│  │                                                        ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── PROGRAMMATION ──────────────────────────────────────────  │
│                                                              │
│  (●) Envoyer maintenant                                     │
│  ( ) Programmer : [__/__/____]  [__:__]                     │
│                                                              │
│  [ 👁️ Prévisualiser ]  [ 📤 Envoyer à 847 destinataires ]  │
│                                                              │
│  ⚠️  Confirmation requise avant envoi                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Vous allez envoyer à 847 personnes via Email + App  │   │
│  │  Objet : "🚀 jobs.ivoire.io est en ligne !"         │   │
│  │                                                      │   │
│  │  [ ✖ Annuler ]        [ ✅ Confirmer l'envoi ]      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ── HISTORIQUE DES BROADCASTS ──────────────────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Date       │ Objet                  │ Dest. │ Canaux  ││
│  ├────────────┼────────────────────────┼───────┼─────────││
│  │  10/03/26  │ Bienvenue sur ivoire.io│ 1 247 │ 📧 🔔   ││
│  │  01/03/26  │ Phase 2 lancée !       │   500 │ 📧      ││
│  │  15/02/26  │ Votre portfolio est prêt│  200 │ 📧 🔔   ││
│  └────────────────────────────────────────────────────────┘│
│  [Voir détail → taux d'ouverture, clics, désabonnements]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### API Broadcasting

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/admin/broadcasts` | GET | Historique des broadcasts |
| `/api/admin/broadcasts` | POST | Créer & envoyer un broadcast |
| `/api/admin/broadcasts/preview` | POST | Prévisualiser (rendu + estimation) |
| `/api/admin/broadcasts/[id]` | GET | Détail + stats d'un broadcast |
| `/api/admin/broadcasts/[id]/cancel` | POST | Annuler un broadcast programmé |

---

## 14. GESTION DES TEMPLATES

> **Objectif** : Contrôler quels templates de pages publiques sont disponibles pour les utilisateurs.  
> Activer progressivement les templates au fur et à mesure qu'ils sont prêts.  
> Définir lesquels sont gratuits vs Premium.

```
┌──────────────────────────────────────────────────────────────┐
│  🎨 Gestion des Templates                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ── TEMPLATES PORTFOLIOS (pages publiques) ─────────────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  #  │ Template     │ État     │ Plan     │ Utilisé │ ⚙ ││
│  ├─────┼──────────────┼──────────┼──────────┼─────────┼───││
│  │  1  │ 📄 Classic   │ 🟢 Actif │ Gratuit  │ 423     │ ⚙ ││
│  │  2  │ ✨ Minimal   │ 🟢 Actif │ Gratuit  │ 198     │ ⚙ ││
│  │  3  │ 🧩 Bento     │ 🟢 Actif │ Premium  │ 87      │ ⚙ ││
│  │  4  │ 💻 Terminal  │ 🟢 Actif │ Premium  │ 56      │ ⚙ ││
│  │  5  │ 📰 Magazine  │ 🟡 Beta  │ Premium  │ 12      │ ⚙ ││
│  │  6  │ ⏰ Timeline  │ 🟡 Beta  │ Premium  │ 8       │ ⚙ ││
│  │  7  │ 🃏 Card Stack│ 🔴 OFF   │ Premium  │ 0       │ ⚙ ││
│  │  8  │ ↔️ Split     │ 🔴 OFF   │ Premium  │ 0       │ ⚙ ││
│  │  9  │ 🚀 Startup   │ 🟢 Actif │ Gratuit  │ 34      │ ⚙ ││
│  │  10 │ 🏢 Corporate │ 🟡 Beta  │ Enterprise│ 5      │ ⚙ ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── DÉTAIL TEMPLATE (clic sur ⚙️) ── Sheet latéral ────────  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │  ⚙️ Template — Bento Grid                             ││
│  │                                                        ││
│  │  État :                                                ││
│  │  ( ) 🔴 OFF — Non visible dans le sélecteur           ││
│  │  ( ) 🟡 BETA — Visible mais avec badge "BETA"         ││
│  │  (●) 🟢 Actif — Disponible pour tous (selon plan)    ││
│  │                                                        ││
│  │  Plan requis :                                         ││
│  │  ( ) Gratuit (tous)                                    ││
│  │  (●) Premium (payant)                                  ││
│  │  ( ) Enterprise                                        ││
│  │                                                        ││
│  │  Types autorisés :                                     ││
│  │  [☑] developer  [☑] startup  [☑] enterprise  [☑] other││
│  │                                                        ││
│  │  Aperçu :                                              ││
│  │  ┌──────────────────────────────────────────────────┐ ││
│  │  │  [Miniature prévisualisation du template]        │ ││
│  │  │  423 utilisations actives                        │ ││
│  │  └──────────────────────────────────────────────────┘ ││
│  │                                                        ││
│  │  ⚠️ Si désactivé, les utilisateurs actuels gardent    ││
│  │  leur template mais ne peuvent plus le sélectionner.  ││
│  │                                                        ││
│  │  [ 💾 Enregistrer ]  [ ✖ Annuler ]                   ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ── STATISTIQUES TEMPLATES ──                               │
│                                                              │
│  ┌──── RÉPARTITION D'UTILISATION ──────────────────────┐   │
│  │                                                      │   │
│  │  Classic   ██████████████████████████████  423 (52%) │   │
│  │  Minimal   ████████████████               198 (24%) │   │
│  │  Bento     ██████                          87 (11%) │   │
│  │  Terminal  ████                            56 (7%)  │   │
│  │  Startup   ██                              34 (4%)  │   │
│  │  Autres    █                               25 (3%)  │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ── CONVERSION FREE → PREMIUM ──                            │
│  Templates Premium les + demandés :                         │
│  1. Bento Grid — 45 tentatives de sélection (→ upsell)     │
│  2. Terminal — 23 tentatives                                │
│  3. Magazine — 18 tentatives                                │
│  Taux de conversion vers Premium : 12%                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### API Templates Admin

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/admin/templates` | GET | Liste des templates + état |
| `/api/admin/templates/[id]` | PUT | Modifier état / plan / types autorisés |
| `/api/admin/templates/stats` | GET | Statistiques d'utilisation |

---

## ENDPOINTS API ADMIN

| Endpoint | Méthode | Fonction |
|---|---|---|
| `/api/admin/dashboard` | GET | Métriques globales |
| `/api/admin/profiles` | GET | Liste paginée + filtres |
| `/api/admin/profiles/[id]` | GET / PUT / DELETE | Détail / Modifier / Supprimer |
| `/api/admin/profiles/[id]/suspend` | POST | Suspendre un compte |
| `/api/admin/profiles/[id]/activate` | POST | Réactiver |
| `/api/admin/profiles/[id]/promote` | POST | Promouvoir admin |
| `/api/admin/profiles/[id]/badge` | POST / DELETE | Badge vérifié |
| `/api/admin/waitlist` | GET | Liste waitlist |
| `/api/admin/waitlist/invite` | POST | Inviter un inscrit |
| `/api/admin/waitlist/invite-all` | POST | Inviter tous |
| `/api/admin/startups` | GET | Liste startups |
| `/api/admin/startups/[id]` | PUT / DELETE | Modifier / Supprimer |
| `/api/admin/jobs` | GET | Liste offres |
| `/api/admin/jobs/[id]` | PUT / DELETE | Modifier / Supprimer |
| `/api/admin/reports` | GET | Signalements |
| `/api/admin/reports/[id]` | PUT | Traiter signalement |
| `/api/admin/certifications` | GET / POST | Demandes certification |
| `/api/admin/analytics` | GET | Analytics plateforme |
| `/api/admin/subscriptions` | GET | Abonnements |
| `/api/admin/revenue` | GET | Rapport revenus |
| `/api/admin/config` | GET / PUT | Configuration globale |
| `/api/admin/logs` | GET | Logs d'activité |
| `/api/admin/maintenance` | POST | Mode maintenance |
| `/api/admin/export` | GET | Export données globales |
| `/api/admin/flags` | GET | Liste feature flags |
| `/api/admin/flags/[key]` | PUT | Modifier un flag (état, accès, message) |
| `/api/admin/flags/history` | GET | Historique des changements de flags |
| `/api/admin/broadcasts` | GET / POST | Historique / Créer un broadcast |
| `/api/admin/broadcasts/preview` | POST | Prévisualiser + estimer audience |
| `/api/admin/broadcasts/[id]` | GET | Détail + stats d'un broadcast |
| `/api/admin/broadcasts/[id]/cancel` | POST | Annuler broadcast programmé |
| `/api/admin/templates` | GET | Liste templates + état |
| `/api/admin/templates/[id]` | PUT | Modifier état / plan / types autorisés |
| `/api/admin/templates/stats` | GET | Statistiques d'utilisation templates |
