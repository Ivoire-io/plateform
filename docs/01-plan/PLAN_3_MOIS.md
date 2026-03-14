# 📅 PLAN 3 MOIS — ivoire.io

> **Contrainte** : Clause de non-concurrence → Communication sous la marque **ivoire.io** uniquement (pas de profil personnel).
> **Domaine** : ✅ Acheté.
> **Objectif à 3 mois** : Landing page live + 100 inscrits + portfolios nom.ivoire.io fonctionnels + 1ère startup listée.
> **Mis à jour le 14 mars 2026**

---

## VUE D'ENSEMBLE

```
MOIS 1 — FONDATIONS
├── S1 : Branding + Réseaux sociaux + Landing page
├── S2 : Landing page live + début communication      ← EN COURS
├── S3 : Développement MVP portfolios
├── S4 : Test interne + premiers invités

MOIS 2 — LANCEMENT
├── S5 : Lancement public portfolios (nom.ivoire.io)
├── S6 : Annuaire devs.ivoire.io
├── S7 : Communication active + croissance
├── S8 : Itérations feedback utilisateurs

MOIS 3 — PRODUIT
├── S9  : Module startups (Product Hunt local)
├── S10 : Système de votes + classement
├── S11 : Premiers partenariats
├── S12 : Bilan + plan mois 4-6
```

---

## MOIS 1 — FONDATIONS

### Semaine 1 : Branding & Réseaux Sociaux
- [x] Finaliser le logo
- [x] Définir la charte graphique
- [x] Préparer les bannières et avatars pour chaque RS
- [x] Rédiger les posts programmés (LinkedIn, Twitter, Instagram, Facebook, Telegram)
- [ ] Créer les comptes réseaux sociaux
  - [ ] LinkedIn (Page entreprise ivoire.io)
  - [ ] Twitter/X (@ivoireio)
  - [ ] Instagram (@ivoireio)
  - [ ] Telegram (groupe communauté)

### Semaine 2 : Landing Page Live
- [x] Setup technique (Supabase + Next.js 16)
- [x] Développer la landing page complète (navbar, hero, features, preview, roadmap, waitlist, footer)
- [x] Formulaire de capture emails/waitlist avec validation complète
- [x] Vérification disponibilité domaine en temps réel
- [x] SEO complet (OG image, JSON-LD, sitemap, webmanifest)
- [ ] **Exécuter la migration SQL sur Supabase** ← BLOQUANT
- [ ] **Remplir RESEND_API_KEY** dans .env.local
- [ ] **Déployer sur Railway** (voir guide ci-dessous)
- [ ] **Configurer DNS Cloudflare** : `CNAME ivoire.io → [domaine Railway]`, `CNAME * → [domaine Railway]`
- [ ] Publier le premier post "Annonce" depuis la page LinkedIn ivoire.io
- [ ] Partager dans groupes WhatsApp/Telegram tech CI

---

## GUIDE DÉPLOIEMENT RAILWAY

### 1. Prérequis
- Compte sur [railway.app](https://railway.app) (plan Hobby — ~5$/mois pour supporters subdomain wildcard)

### 2. Déployer depuis GitHub
```bash
# Push le projet sur GitHub
cd /Users/ulrichkouame/Documents/Projets/codeur/ivoire.io
git add . && git commit -m "feat: MVP ivoire.io"
git push origin main
```
Dans Railway : New Project → Deploy from GitHub → sélectionner le repo → choisir le dossier `app/`.

### 3. Variables d'environnement (Railway Dashboard → Variables)
```
NEXT_PUBLIC_SUPABASE_URL=https://xgcmyktcgwqdeqfudkzl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=https://ivoire.io
NEXT_PUBLIC_APP_NAME=ivoire.io
```

### 4. Domaines personnalisés (Railway Dashboard → Settings → Domains)
- Ajouter `ivoire.io`
- Ajouter `*.ivoire.io`
- Railway affiche un CNAME cible (ex: `abc123.up.railway.app`)

### 5. DNS Cloudflare
```
CNAME  ivoire.io   →  abc123.up.railway.app  (Proxied ✔)
CNAME  *           →  abc123.up.railway.app  (Proxied ✔)
```
> Activer le mode **Full (strict)** dans Cloudflare SSL/TLS.

### Semaine 3 : Développement MVP Portfolios
- [x] Système d'inscription + choix du slug
- [x] Page portfolio dynamique SSR (profil + projets + expériences)
- [x] Wildcard subdomain routing fonctionnel (`proxy.ts`)
- [ ] Interface de création/édition de profil (dashboard)
- [ ] Upload avatar vers Supabase Storage
- [ ] Import projets depuis GitHub API (optionnel)

### Semaine 4 : Tests & Invitations Privées
- [ ] Tester sur 5-10 beta testeurs
- [ ] Corriger les bugs critiques
- [ ] Inviter les premiers inscrits de la waitlist
- [ ] Collecter les feedbacks

---

## MOIS 2 — LANCEMENT

### Semaine 5 : Lancement Public Portfolios
- [ ] Ouvrir les inscriptions à tous
- [ ] Post LinkedIn de lancement officiel (depuis la page ivoire.io)
- [ ] Thread Twitter/X de lancement
- [ ] Reel/Story Instagram montrant un portfolio en action
- [ ] Objectif : **50 portfolios créés en 7 jours**

### Semaine 6 : Annuaire devs.ivoire.io
- [ ] Développer la page annuaire (voir `04-wireframes/ANNUAIRE_DEVS.md`)
- [ ] Filtres : technologie, ville, disponibilité
- [ ] Recherche par nom/compétence
- [ ] Lien vers chaque portfolio nom.ivoire.io
- [ ] Mettre en ligne devs.ivoire.io

### Semaine 7 : Communication Active
- [ ] Publier 4-5 posts RS par semaine
- [ ] Contenu : portraits de devs inscrits ("Découvrez le profil de...")
- [ ] DM à 10 dev/fondateurs par jour depuis la page ivoire.io
- [ ] Répondre à tous les commentaires/messages
- [ ] Objectif : **100 portfolios + 500 visiteurs uniques**

### Semaine 8 : Itérations
- [ ] Analyser les données (analytics, inscrits, rétention)
- [ ] Améliorer le template portfolio selon les feedbacks
- [ ] Ajouter des fonctionnalités demandées (badge, dark mode, etc.)
- [ ] Préparer le terrain pour le module Startups

---

## MOIS 3 — PRODUIT

### Semaine 9 : Module Startups
- [ ] Développer startups.ivoire.io (voir section wireframes)
- [ ] Formulaire de soumission de startup
- [ ] Fiche startup : logo, description, fondateurs, liens
- [ ] Lien avec les profils devs existants

### Semaine 10 : Système de Votes
- [ ] Système d'upvote/downvote
- [ ] Classement "Top Startups de la Semaine"
- [ ] Commentaires de la communauté
- [ ] Badge "Lancé sur ivoire.io"

### Semaine 11 : Premiers Partenariats
- [ ] Identifier 5 incubateurs/accélérateurs en CI
- [ ] Proposer un partenariat de visibilité
- [ ] Explorer la monétisation (premium entreprises)
- [ ] Préparer l'offre "Sous-domaine entreprise certifié"

### Semaine 12 : Bilan & Plan Suite
- [ ] Bilan des KPIs :
  - Nombre d'inscrits total
  - Portfolios actifs
  - Startups listées
  - Trafic mensuel
  - Revenus (si déjà lancés)
- [ ] Définir le plan Mois 4-6 (jobs, marketplace, monétisation)
- [ ] Documenter les apprentissages

---

## KPIs À SUIVRE

| Métrique | Fin Mois 1 | Fin Mois 2 | Fin Mois 3 |
|----------|:----------:|:----------:|:----------:|
| Inscrits waitlist/users | 100 | 300 | 500 |
| Portfolios actifs | 10 (beta) | 100 | 200 |
| Startups listées | 0 | 0 | 20 |
| Visiteurs uniques/mois | 500 | 2 000 | 5 000 |
| Followers RS (tous) | 200 | 500 | 1 000 |
| Posts RS publiés | 15 | 35 | 60 |

---

## BUDGET ESTIMÉ (3 mois)

| Poste | Coût | Note |
|-------|------|------|
| Domaine ivoire.io | ✅ Fait | ~40$ |
| Cloudflare | 0$ | Free plan |
| Vercel | 0$ | Hobby plan |
| Supabase | 0$ | Free tier (50K users) |
| Logo (si IA) | 0$ | Midjourney/DALL-E |
| Logo (si designer) | 50-150$ | Optionnel |
| Outils RS (Buffer/Later) | 0$ | Free plan |
| **TOTAL** | **0-150$** | Hors domaine |
