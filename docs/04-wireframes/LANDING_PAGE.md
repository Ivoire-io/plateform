# 📐 WIREFRAME — Landing Page (ivoire.io)

> Page unique "Coming Soon" → objectif : capturer des emails et valider l'intérêt.
> URL : **https://ivoire.io**

---

## STRUCTURE DE LA PAGE

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [logo] ivoire.io          [À propos] [Rejoindre ↗]  │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HERO SECTION                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │     🇨🇮                                               │   │
│  │                                                       │   │
│  │     La porte d'entrée digitale                        │   │
│  │     de la tech ivoirienne                             │   │
│  │                                                       │   │
│  │     (sous-titre en gris)                              │   │
│  │     Le hub des développeurs, startups et services     │   │
│  │     de Côte d'Ivoire. Réclame ton espace.             │   │
│  │                                                       │   │
│  │     ┌──────────────────┐  ┌────────────────────┐     │   │
│  │     │ ton-nom           │  │ .ivoire.io         │     │   │
│  │     └──────────────────┘  └────────────────────┘     │   │
│  │                                                       │   │
│  │     [ 🚀 Réclamer mon sous-domaine ]  ← bouton CTA  │   │
│  │                                                       │   │
│  │     "147 personnes déjà inscrites"                    │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SECTION "C'EST QUOI"                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ 🧑‍💻       │  │ 🚀       │  │ 🏢       │           │   │
│  │  │ Talents  │  │ Startups │  │ Services │           │   │
│  │  │          │  │          │  │          │           │   │
│  │  │ Ton      │  │ Lance    │  │ Accède   │           │   │
│  │  │ portfolio│  │ ton      │  │ aux      │           │   │
│  │  │ pro sur  │  │ produit  │  │ services │           │   │
│  │  │ nom.     │  │ devant   │  │ tech du  │           │   │
│  │  │ ivoire.io│  │ toute la │  │ pays     │           │   │
│  │  │          │  │ communaut│  │          │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SECTION "APERÇU" (mockup du portfolio)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  "À quoi ressemble ton portfolio ivoire.io ?"         │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │  ╔═══════════════════════════════════════╗   │     │   │
│  │  │  ║  🔴 🟡 🟢  ulrich.ivoire.io          ║   │     │   │
│  │  │  ╠═══════════════════════════════════════╣   │     │   │
│  │  │  ║                                       ║   │     │   │
│  │  │  ║  [Photo]  Ulrich Kouamé               ║   │     │   │
│  │  │  ║           Lead Developer               ║   │     │   │
│  │  │  ║           Flutter · Dart · Firebase    ║   │     │   │
│  │  │  ║                                       ║   │     │   │
│  │  │  ║  [Projet 1]  [Projet 2]  [Projet 3]  ║   │     │   │
│  │  │  ║                                       ║   │     │   │
│  │  │  ║  [ Me contacter ]                     ║   │     │   │
│  │  │  ║                                       ║   │     │   │
│  │  │  ╚═══════════════════════════════════════╝   │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SECTION "ROADMAP" (ce qui arrive)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  ✅ Portfolios développeurs  ← "Bientôt"             │   │
│  │  ⏳ Annuaire devs.ivoire.io                           │   │
│  │  ⏳ Product Hunt des startups CI                      │   │
│  │  ⏳ Marketplace & Jobs                                │   │
│  │  ⏳ Services (santé, éducation, logement)             │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SECTION "INSCRIPTION" (formulaire complet)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  "Rejoins les premiers bâtisseurs"                    │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────┐             │   │
│  │  │  Nom complet      [_______________] │             │   │
│  │  │  Email             [_______________] │             │   │
│  │  │  Sous-domaine      [____].ivoire.io  │             │   │
│  │  │  Tu es :                             │             │   │
│  │  │  ( ) Développeur                     │             │   │
│  │  │  ( ) Fondateur / Startup             │             │   │
│  │  │  ( ) Entreprise                      │             │   │
│  │  │  ( ) Autre                           │             │   │
│  │  │                                      │             │   │
│  │  │  [ 🚀 Réclamer mon .ivoire.io ]     │             │   │
│  │  └─────────────────────────────────────┘             │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FOOTER                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  ivoire.io — Fait avec ❤️ depuis Abidjan              │   │
│  │                                                       │   │
│  │  [LinkedIn] [Twitter] [Instagram] [Telegram]          │   │
│  │                                                       │   │
│  │  © 2026 ivoire.io — Tous droits réservés              │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## DÉTAIL DES SECTIONS

### 1. Navbar
- Logo à gauche (texte "ivoire.io")
- 2 liens à droite : "À propos" (scroll vers section) + "Rejoindre" (scroll vers formulaire)
- Position : **sticky** (reste en haut au scroll)
- Style : transparent → fond sombre au scroll
- Hauteur : 64px

### 2. Hero Section
- Centré verticalement, hauteur 100vh (plein écran)
- Titre H1 : "La porte d'entrée digitale de la tech ivoirienne"
- Sous-titre : description en gris
- **Input inline** : champ texte + ".ivoire.io" affiché à droite (preview du sous-domaine)
- Bouton CTA orange : "Réclamer mon sous-domaine"
- Compteur animé : nombre d'inscrits en temps réel (query Supabase)
- Animation subtile : fade-in au chargement

### 3. Section "C'est quoi" — 3 colonnes
- 3 cards côte à côte (empilées sur mobile)
- Chaque card : icône + titre + description courte
- **Talents** : "Ton portfolio professionnel sur nom.ivoire.io"
- **Startups** : "Lance ton produit devant toute la communauté tech CI"
- **Services** : "Les services essentiels du pays, centralisés"

### 4. Section Aperçu
- Titre : "À quoi ressemble ton portfolio ivoire.io ?"
- Mockup navigateur (cadre macOS) montrant un exemple de portfolio
- Peut être une image statique (générée via prompt Midjourney)
- Ou une animation/carrousel de 2-3 exemples

### 5. Section Roadmap
- Timeline verticale simple
- Icônes ✅ (fait) et ⏳ (à venir) 
- 5 étapes listées
- Style : minimaliste, pas de dates précises

### 6. Section Inscription (formulaire)
- Titre : "Rejoins les premiers bâtisseurs"
- Formulaire avec 4 champs :
  - Nom complet (text)
  - Email (email)
  - Sous-domaine souhaité (text + ".ivoire.io" affiché)
  - Type (radio buttons : Dev / Startup / Entreprise / Autre)
- Bouton : "Réclamer mon .ivoire.io"
- **Action** : INSERT dans table `waitlist` Supabase
- Message de succès : "Bienvenue ! Tu es le Xème à rejoindre ivoire.io 🇨🇮"

### 7. Footer
- Texte centré : "Fait avec ❤️ depuis Abidjan"
- Icônes RS (LinkedIn, Twitter, Instagram, Telegram)
- Copyright

---

## RESPONSIVE (Mobile)

- Navbar : logo seul + bouton hamburger
- Hero : titre plus petit (32px), formulaire empilé verticalement
- 3 cards : empilées en colonne
- Mockup : taille réduite mais visible
- Formulaire : pleine largeur
- Footer : icônes centrées

---

## INTERACTIONS

| Élément | Action |
|---------|--------|
| Champ sous-domaine (hero) | Vérifie en temps réel si le slug est disponible (query Supabase) |
| Bouton CTA | Scroll smooth vers le formulaire d'inscription |
| Compteur inscrits | Mise à jour temps réel via Supabase Realtime |
| Cards "C'est quoi" | Léger hover scale (1.02) + bordure orange |
| Formulaire submit | Loading state → message succès / erreur |
