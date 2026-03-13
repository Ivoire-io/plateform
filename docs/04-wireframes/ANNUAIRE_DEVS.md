# 📐 WIREFRAME — Annuaire Développeurs (devs.ivoire.io)

> Page listant tous les développeurs inscrits sur ivoire.io.
> URL : **https://devs.ivoire.io**

---

## STRUCTURE DE LA PAGE

```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [logo] ivoire.io / devs      [Accueil] [S'inscrire] │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HERO (compact)                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Développeurs de Côte d'Ivoire                        │   │
│  │  247 talents inscrits sur ivoire.io                   │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  BARRE DE RECHERCHE & FILTRES                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  🔍 [  Rechercher un développeur...              ]    │   │
│  │                                                       │   │
│  │  Filtres :                                            │   │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐    │   │
│  │  │Techno ▾│ │Ville  ▾│ │Dispo    ▾│ │Trier  ▾│    │   │
│  │  └────────┘ └────────┘ └──────────┘ └─────────┘    │   │
│  │                                                       │   │
│  │  Tags actifs : [Flutter ✕] [Abidjan ✕] [Disponible ✕]│   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  GRILLE DES DÉVELOPPEURS                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────┐ │   │
│  │  │  ┌───┐        │  │  ┌───┐        │  │  ┌───┐   │ │   │
│  │  │  │ 📷│ Ulrich  │  │  │ 📷│ Fatou   │  │  │ 📷│..│ │   │
│  │  │  └───┘ Kouamé  │  │  └───┘ Diallo  │  │  └───┘  │ │   │
│  │  │                │  │                │  │          │ │   │
│  │  │  Lead Dev      │  │  Mobile Dev    │  │  Full St│ │   │
│  │  │  Abidjan       │  │  Abidjan       │  │  Bouaké │ │   │
│  │  │                │  │                │  │          │ │   │
│  │  │  [Flutter]     │  │  [React Native]│  │  [Larave│ │   │
│  │  │  [Dart] [Go]   │  │  [TypeScript]  │  │  [Vue.js│ │   │
│  │  │                │  │                │  │          │ │   │
│  │  │  🟢 Disponible │  │  🔴 Occupé     │  │  🟢 Disp│ │   │
│  │  │                │  │                │  │          │ │   │
│  │  │  [Voir profil →]│  │  [Voir profil →]│  │  [Voir │ │   │
│  │  └───────────────┘  └───────────────┘  └──────────┘ │   │
│  │                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────┐ │   │
│  │  │  [Dev 4]      │  │  [Dev 5]      │  │  [Dev 6] │ │   │
│  │  └───────────────┘  └───────────────┘  └──────────┘ │   │
│  │                                                       │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────┐ │   │
│  │  │  [Dev 7]      │  │  [Dev 8]      │  │  [Dev 9] │ │   │
│  │  └───────────────┘  └───────────────┘  └──────────┘ │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           [ ← Précédent ]  1 2 3 ... [ Suivant → ]   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  BANNIÈRE CTA                                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Tu es développeur en Côte d'Ivoire ?                 │   │
│  │  Rejoins la communauté et obtiens ton portfolio       │   │
│  │  nom.ivoire.io gratuitement.                          │   │
│  │                                                       │   │
│  │  [ 🚀 Créer mon profil ]                             │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  FOOTER                                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   ivoire.io — L'OS digital de la Côte d'Ivoire 🇨🇮    │   │
│  │   [LinkedIn] [Twitter] [Instagram] [Telegram]         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## DÉTAIL DES SECTIONS

### 1. Navbar
- Logo "ivoire.io / devs" (indique qu'on est dans le portail devs)
- Liens : "Accueil" (→ ivoire.io) + "S'inscrire" (→ formulaire)
- Sticky

### 2. Hero compact
- Titre : "Développeurs de Côte d'Ivoire"
- Compteur dynamique : "X talents inscrits sur ivoire.io"
- Hauteur réduite (~200px), pas de full screen

### 3. Recherche & Filtres
- **Barre de recherche** : recherche par nom, compétence, ville
- **Filtres dropdown** :
  - Technologie : Flutter, React, Laravel, Python, etc.
  - Ville : Abidjan, Bouaké, Yamoussoukro, etc.
  - Disponibilité : Disponible / Tous
  - Tri : Récent, Populaire, Alphabétique
- **Tags actifs** : affichés sous les filtres, cliquables pour retirer
- Mise à jour de la liste en temps réel à chaque filtre

### 4. Grille des développeurs
- **3 colonnes** (desktop), **2 colonnes** (tablette), **1 colonne** (mobile)
- Chaque card :
  - Avatar (rond, 64px)
  - Nom complet
  - Titre / rôle
  - Ville
  - Tags technologies (3 max visibles)
  - Statut disponibilité (🟢 Disponible / 🔴 Occupé)
  - Lien "Voir profil →" (redirige vers nom.ivoire.io)
- **Hover** : légère élévation + bordure orange
- **Pagination** : 12 profils par page, navigation en bas

### 5. Bannière CTA
- Fond légèrement différent (card sombre avec bordure orange)
- Message d'incitation à s'inscrire
- Bouton CTA vers le formulaire d'inscription

### 6. Footer
- Identique aux autres pages

---

## FILTRES DISPONIBLES

### Technologies

| Catégorie | Options |
|-----------|---------|
| Frontend | React, Next.js, Vue.js, Angular, Svelte |
| Mobile | Flutter, React Native, Swift, Kotlin |
| Backend | Node.js, Laravel, Django, Go, Rust |
| Database | PostgreSQL, MongoDB, Firebase, Supabase |
| Cloud | AWS, GCP, Azure, Vercel |
| Autre | Python, Java, C#, PHP |

### Villes

| Ville |
|-------|
| Abidjan |
| Bouaké |
| Yamoussoukro |
| San-Pédro |
| Daloa |
| Korhogo |
| Autre / Remote |

---

## RESPONSIVE

- **Desktop** : 3 colonnes, filtres en ligne
- **Tablette** : 2 colonnes, filtres en ligne
- **Mobile** : 1 colonne, filtres empilés avec un bouton "Filtres" qui ouvre un panel

---

## SEO

- Title : `Développeurs de Côte d'Ivoire | ivoire.io`
- Meta : `Trouvez les meilleurs développeurs ivoiriens. X talents Flutter, React, Laravel sur ivoire.io.`
- URL canonique : `https://devs.ivoire.io`
- Chaque card de dev = lien vers son portfolio (bon pour le maillage interne)
