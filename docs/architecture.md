# Architecture

## Stack technique
- **Framework** : Next.js 16 (App Router avec Turbopack), React 19.
- **Langage & Typage** : TypeScript strict, schémas de validation Zod.
- **Base de données** : Neon PostgreSQL serverless via `@neondatabase/serverless`.
- **Stockage d'images** : Vercel Blob (store privé) via `@vercel/blob`.
- **Styles & Animations** : Tailwind CSS v4, framer-motion (physique interactive matter-js).
- **Polices** : `next/font/google` (Syne, Outfit, JetBrains Mono).
- **Alias** : `@/*` pointant vers la racine du projet.

## Arborescence
```
proxy.ts                      Détection de la langue du navigateur et redirection vers /{locale}
db/
  schema.sql                  Schéma relationnel PostgreSQL (tables: competence, projet, projet_traduction, projet_competence, projet_image, experience, experience_traduction)
scripts/
  migrate.mjs                 Migration idempotente de schema.sql sur Neon
  seed.mjs                    Peuplement initial (import des JSON historiques et téléversement des images dans le blob privé)
app/
  layout.tsx                  Layout racine : polices Google, NavProvider, NavBar
  [lang]/page.tsx             Landing page du portfolio (Server Component statique SSG)
  recup-dictionnaire.ts       getDictionary(locale) — Dictionnaires JSON stricts pour les textes statiques
  dictionnaires/{fr,en}.json  Textes UI fixes (hero, dev, titres des catégories)
  lib/
    db.ts                     Client Neon SQL (requêtes paramétrées anti-injection)
    blob.ts                   Gestionnaire d'upload/suppression Vercel Blob avec validation des octets magiques
    media.ts                  Constructeur d'URL `/medias/...` et validation des chemins
    admin-auth.ts             Contrôle d'accès à l'espace /admin (exigerAdmin, assertAdmin)
    token.ts                  TokenUtil : validation JWT (jose) et vérification dans la table authorized
    langues.ts                Source unique de vérité des langues (fr, en)
    dates.ts                  Formatage déterministe des dates selon la locale (serveur et client)
  modeles/                    Un fichier .ts par modèle de données
    Traduction.ts             Types et schémas partagés (dates ISO, couleurs, helpers multilingues)
    Competence.ts             Modèle Competence et schéma Zod de saisie
    Projet.ts                 Modèle Projet, tailles de cartes (1 à 4) et schéma Zod
    Experience.ts             Modèle Experience (parcours chronologique) et schéma Zod
  services/                   Services métier serveur (server-only)
    PortfolioService.ts       Requête agrégée (1 seule transaction SQL) pour la landing page
    CompetenceService.ts      Gestion des compétences en base
    ProjetService.ts          Gestion des projets avec traductions, images et compétences associées
    ExperienceService.ts      Gestion des expériences avec traductions
  admin/                      Espace d'administration complet
    layout.tsx                Structure de navigation de l'admin (non indexé, no-store)
    page.tsx                  Tableau de bord
    competences/page.tsx      Édition des compétences et logos
    projets/page.tsx          Édition des projets, images et compétences
    experiences/page.tsx      Édition des expériences et traductions
    actions/                  Server Actions sécurisées (validation Zod, contrôle d'accès, revalidation)
    components/               Composants formulaires de l'admin
  no/page.tsx                 Page publique d'accès refusé (compte authentifié mais non autorisé en BDD)
  medias/[...chemin]/route.ts Route de diffusion des images du blob privé avec cache HTTP et en-têtes CSP sandbox
  components/                 Composants UI interactifs de la landing page (framer-motion)
  globals.css                 Variables CSS de thème Tailwind v4
docs/                         Documentation technique et fonctionnelle
```

## Flux de données

1. **Visiteur public (`/{lang}`)** :
   - Requête routée vers `app/[lang]/page.tsx`.
   - La page est statique (SSG). Les données sont pré-rendues au build pour chaque langue via `generateStaticParams()`.
   - `PortfolioService.recuperer(lang)` extrait l'ensemble des compétences, projets et expériences en **une seule transaction Neon** avec agrégations JSON côté PostgreSQL (zéro requête N+1).
   - Les textes fixes proviennent du dictionnaire JSON correspondant.
   - Les images privées sont servies via la route sécurisée `/medias/[...chemin]`.

2. **Édition administrative (`/admin/...`)** :
   - Les formulaires envoient des données multipart/form-data aux Server Actions (`app/admin/actions/`).
   - La Server Action vérifie l'autorisation (`assertAdmin`), valide les données avec Zod, téléverse les images dans le Blob privé après validation des magic numbers, et enregistre en base via les services dans des transactions atomiques.
   - En fin d'action, `revalidatePath('/[lang]', 'page')` invalide le cache statique de la landing page pour propager immédiatement les modifications sans re-déploiement.

## Conventions
Voir `GEMINI.md` : Tailwind uniquement, animations framer-motion exclusivement, sécurité renforcée (SQL paramétré, validation Zod, blob privé), réactivité SSG/ISR.
