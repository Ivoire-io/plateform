# Documentation du systeme developpeur — ivoire.io

> Index principal de la documentation dev
> Date : Mars 2026

---

## Documents disponibles

| # | Fichier | Description |
|---|---------|-------------|
| 01 | [AUDIT-SYSTEME-DEVS.md](./01-AUDIT-SYSTEME-DEVS.md) | Audit complet de tout le systeme developpeur : parcours d'inscription, auth, dashboard, portfolio, annuaire, souscription, admin, DB |
| 02 | [PROBLEMES-ET-AMELIORATIONS.md](./02-PROBLEMES-ET-AMELIORATIONS.md) | Problemes identifies (critiques, majeurs, mineurs) et propositions d'amelioration classees par priorite |
| 03 | [FORMULES-SOUSCRIPTION.md](./03-FORMULES-SOUSCRIPTION.md) | Nouvelles formules d'abonnement proposees (Free/Starter/Pro/Expert), packs, strategie de conversion, projections financieres |
| 04 | [VALEUR-CIBLE-ECOSYSTEME.md](./04-VALEUR-CIBLE-ECOSYSTEME.md) | Proposition de valeur, segmentation de la cible, personas, relations inter-types, positionnement strategique, KPIs |
| 05 | [REFERENCE-TECHNIQUE.md](./05-REFERENCE-TECHNIQUE.md) | Index complet de tous les fichiers, API routes, composants, migrations lies au systeme dev |

---

## Resume executif

### Etat actuel

Le systeme developpeur d'ivoire.io est **fonctionnel mais incomplet**. Les briques de base sont en place :

- Portfolio avec sous-domaine personnalise (10 templates)
- Annuaire publique avec recherche et filtres
- Dashboard avec edition profil, projets, experiences
- Systeme de souscription avec PayPal et mobile money
- Panel admin complet

### 3 problemes critiques

1. **L'inscription est bloquante** — Le dev depend d'un admin pour acceder a la plateforme (modele waitlist sans alternative ouverte)
2. **Les plans sont incoherents** — Deux systemes coexistent en DB (legacy + dynamique)
3. **Pas de mise en relation dev-client** — L'annuaire est passif, pas de matching, pas de candidature

### 5 actions prioritaires

1. Activer l'inscription ouverte (le mode existe dans la config)
2. Standardiser les plans d'abonnement
3. Ajouter la pagination serveur a l'annuaire
4. Creer un onboarding wizard pour les nouveaux inscrits
5. Generer des OG Images dynamiques pour les portfolios

### Formules proposees

| Plan | Prix | Cible |
|------|------|-------|
| Free | 0 | Tout le monde (viralite) |
| Starter | 2 000 FCFA/mois ou 20 000/an | Devs actifs |
| Pro | 15 000 FCFA/an | Freelancers, seniors |
| Expert | Sur mesure | Influenceurs tech |
| Etudiant | 1 000 FCFA/mois | Etudiants verifies |

### Objectifs M6

- 300 developpeurs inscrits
- 8% de conversion Free -> Payant
- ~128 750 FCFA de MRR
- 76% de profils complets

---

*Derniere mise a jour : Mars 2026*
