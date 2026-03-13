# 🎨 CHARTE GRAPHIQUE — ivoire.io

---

## IDENTITÉ DE MARQUE

| Attribut | Valeur |
|----------|--------|
| **Nom** | ivoire.io |
| **Prononciation** | "ivoire point io" |
| **Écriture** | Toujours en minuscules : **ivoire.io** |
| **Persona** | Professionnel, moderne, souverain, accessible |
| **Inspirations** | Vercel, Stripe, Linear, Notion |

---

## COULEURS

### Palette principale

| Nom | Hex | Usage |
|-----|-----|-------|
| **Noir profond** | `#0A0A0A` | Fond principal |
| **Nuit** | `#0D1117` | Fond secondaire (cards, sections) |
| **Orange ivoire** | `#FF6B00` | Accent principal, CTA, liens |
| **Vert nation** | `#00A651` | Accent secondaire, badges, succès |
| **Blanc** | `#FFFFFF` | Texte principal sur fond sombre |
| **Gris clair** | `#A0A0A0` | Texte secondaire, sous-titres |
| **Gris foncé** | `#1A1A2E` | Bordures, séparateurs |

### Utilisation

- **Fond** : Toujours sombre (#0A0A0A ou #0D1117)
- **Texte** : Blanc (#FFF) pour le principal, gris (#A0A0A0) pour le secondaire
- **Accent** : Orange (#FF6B00) pour les boutons, liens, éléments actifs
- **Succès / Validation** : Vert (#00A651)
- **Mode clair** : Non prioritaire pour le MVP. Dark mode = identité de marque.

### Drapeau Côte d'Ivoire (référence subtile)
- Orange 🟧 + Blanc ⬜ + Vert 🟩
- On intègre ces couleurs de façon **subtile** (pas de drapeau littéral)

---

## TYPOGRAPHIE

### Police principale : **Inter** (gratuite, Google Fonts)
- Utilisation : Titres, corps de texte, interface
- Alternatives : Geist Sans (Vercel), DM Sans

### Police monospace : **JetBrains Mono** (gratuite)
- Utilisation : Code, URLs, slugs (nom.ivoire.io)
- Alternative : Fira Code

### Hiérarchie typographique

| Élément | Taille | Poids | Police |
|---------|--------|-------|--------|
| H1 (Hero) | 48-64px | Bold (700) | Inter |
| H2 (Section) | 32-40px | Semibold (600) | Inter |
| H3 (Sous-section) | 24px | Semibold (600) | Inter |
| Body | 16-18px | Regular (400) | Inter |
| Small / Caption | 14px | Regular (400) | Inter |
| Code / URL | 16px | Regular (400) | JetBrains Mono |
| Bouton | 16px | Medium (500) | Inter |

---

## LOGO

### Règles d'utilisation

- Toujours en **minuscules** : `ivoire.io`
- Le ".io" peut être dans la couleur accent (orange)
- Espace libre autour du logo : minimum 1x la hauteur du "i"
- Ne jamais déformer, incliner ou ajouter d'effets

### Variantes

| Variante | Fond | Usage |
|----------|------|-------|
| Logo blanc + orange ".io" | Fond sombre | Principal |
| Logo noir + orange ".io" | Fond clair | Impression, docs |
| Icône seule (i ou io) | Fond orange | Favicon, avatar RS |
| Logo blanc complet | Fond sombre | Quand l'accent n'est pas possible |

---

## COMPOSANTS UI

### Boutons

| Type | Style |
|------|-------|
| **Primaire** | Fond orange (#FF6B00), texte blanc, bords arrondis 8px |
| **Secondaire** | Bordure blanche 1px, texte blanc, fond transparent |
| **Ghost** | Texte orange, pas de fond, pas de bordure |

### Cards (cartes)

- Fond : #0D1117 ou #1A1A2E
- Bordure : 1px solid rgba(255,255,255,0.1)
- Border-radius : 12px
- Hover : bordure orange subtile ou légère élévation

### Inputs (champs de formulaire)

- Fond : #0D1117
- Bordure : 1px solid #333
- Focus : bordure orange (#FF6B00)
- Texte : blanc
- Placeholder : #666
- Border-radius : 8px

---

## ICONOGRAPHIE

- Style : **Outline** (pas filled), trait fin
- Source recommandée : **Lucide Icons** (open source, cohérent)
- Taille par défaut : 20-24px
- Couleur : blanc ou gris, orange quand actif

---

## IMAGES & ILLUSTRATIONS

| Aspect | Direction |
|--------|-----------|
| Style | Flat design, minimaliste, géométrique |
| Photos | Éviter les photos stock. Préférer les illustrations ou mockups |
| Mockups | Style macOS/browser dark mode |
| Tons | Toujours dominante sombre avec accents colorés |

---

## ESPACEMENT & LAYOUT

- Système de grille : **8px** (multiples de 8 pour tout l'espacement)
- Max-width contenu : **1200px**
- Padding sections : 80px vertical, 24px horizontal (mobile)
- Gap entre cards : 24px
- Border-radius global : 8-12px

---

## ANIMATION & MOUVEMENT

- Transitions : 200-300ms, ease-out
- Pas d'animations lourdes ou flashy
- Hover subtil sur les cards et boutons
- Scroll reveal léger (fade-in from bottom) pour les sections

---

## RÉSUMÉ RAPIDE

```
Fond       : #0A0A0A (noir profond)
Accent     : #FF6B00 (orange)
Secondaire : #00A651 (vert)
Texte      : #FFFFFF (blanc)
Police     : Inter + JetBrains Mono
Style      : Dark mode, minimaliste, premium
Inspiration: Vercel × Stripe × Linear
```
