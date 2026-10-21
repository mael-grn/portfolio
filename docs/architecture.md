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
DESIGN.md                     Charte graphique et de style de référence (Alpine Engineering, tokens, animations framer-motion)
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
    Experience.ts             Modèle Experience (postes et entreprises) et schéma Zod
    Parcours.ts               Modèle Parcours (diplômes et parcours académique) et schéma Zod
    JournalActivite.ts        Modèle JournalActivite pour le traçage des modifications BDD
  services/                   Services métier serveur (server-only)
    PortfolioService.ts       Requête agrégée (1 seule transaction SQL) pour la landing page
    CompetenceService.ts      Gestion des compétences en base
    ProjetService.ts          Gestion des projets avec traductions, images et compétences associées
    ExperienceService.ts      Gestion des expériences professionnelles avec traductions
    ParcoursService.ts        Gestion du parcours académique et diplômes avec traductions
    JournalService.ts         Historique et traçage des modifications BDD (par qui et quand)
  admin/                      Espace d'administration complet
    layout.tsx                Structure de navigation de l'admin (non indexé, no-store)
    page.tsx                  Tableau de bord
    competences/page.tsx      Édition des compétences et logos
    projets/page.tsx          Édition des projets, images et compétences
    experiences/page.tsx      Édition des expériences professionnelles
    parcours/page.tsx         Édition du parcours académique et diplômes
    actions/                  Server Actions sécurisées (validation Zod, contrôle d'accès, revalidation)
    components/               Composants d'administration (Tableaux et formulaires dédiés, DernieresModifications, Tiroirs)
  no/page.tsx                 Page publique d'accès refusé (compte authentifié mais non autorisé en BDD)
  medias/[...chemin]/route.ts Route de diffusion des images du blob privé avec cache HTTP et en-têtes CSP sandbox
  components/                 Composants modulaires conformes à DESIGN.md :
    ZoomLensNav.tsx           Navigation latérale droite "Zoom Lens" (style getartcraft.com, étapes défilantes et grossissantes sur fond transparent)
    HeroAboutScrolly.tsx      Séquence de scrollytelling cinématique unifiée en 5 Actes (Hero, À propos, Vision, Compétences et Projets)
    AgentUnifiedFlight.tsx    Composant unifié pour les agents IA (cercle harmonique en Vision puis déplacement en se suivant vers le Globe 3D)
    CompetencesGlobe3D.tsx    Globe 3D interactif de compétences (icônes pures Fibonacci, auto-rotation, drag naturel et ancrage d'agents)
    CompetencesSection.tsx    Section de compétences épurée (gros Globe 3D interactif et fiche dynamique)
    ProjetsSection.tsx        Scène cinématique des projets avec grand encadré couleur primaire, carrousel animé et bandelette secondaire avec écrasement
    ExperiencesSection.tsx    Chronologie éditoriale sur axe Hairline (#c2ccd6) et cartes de jalons
    FooterSection.tsx         Pied de page compact sombre (#20272e) avec télémétrie et liens
    ProgressiveBlur.tsx       Surface de flou progressif multicouche (gradient easing spline sans coupure dure)
    Animator3000.tsx          Composant d'animation universel Anm (easing [0.16, 1, 0.3, 1])
    MonogramLogo.tsx          Monogramme MG géométrique épuré
    HexTelemetryIndicator.tsx Indicateur géométrique télémétrique pour le dashboard et l'interface
  globals.css                 Variables CSS globales et tokens Tailwind v4 conformes à DESIGN.md
docs/                         Documentation technique et fonctionnelle
```

## Flux de données

1. **Visiteur public (`/{lang}`)** :
   - Requête routée vers `app/[lang]/page.tsx` (**Server Component strict, zéro `"use client"` à la racine**).
   - La page est statique (SSG). Les données sont pré-rendues au build pour chaque langue via `generateStaticParams()`.
   - `PortfolioService.recuperer(lang)` extrait l'ensemble des compétences, projets et expériences en **une seule transaction Neon** avec agrégations JSON côté PostgreSQL (zéro requête N+1).
   - **Centralisation stricte des textes** : aucun texte en dur dans le code UI ; 100% des textes proviennent exclusivement du dictionnaire JSON correspondant (`app/dictionnaires/`), des constantes de langues (`app/lib/langues.ts`) ou de la base Neon.
   - **Dynamisme, Scrollytelling & Haute Performance** : tout le contenu du site est dynamique et animé avec `framer-motion` et `matter-js`, orchestré via des composants clients feuilles isolés au plus bas de l'arbre.
   - **Performance au scroll (60–120 FPS)** : zéro re-render React au défilement (MotionValues natives GPU), boucle physique Matter.js en sommeil complet hors de sa section active, synchronisation RAF et élimination stricte du layout thrashing (`getComputedStyle` / `elementsFromPoint` bannis de la boucle de défilement).
   - Les images privées sont servies via la route sécurisée `/medias/[...chemin]`.

2. **Édition administrative (`/admin/...`)** :
   - Les formulaires envoient des données multipart/form-data aux Server Actions (`app/admin/actions/`).
   - La Server Action vérifie l'autorisation (`assertAdmin`), valide les données avec Zod, téléverse les images dans le Blob privé après validation des magic numbers, et enregistre en base via les services dans des transactions atomiques.
   - En fin d'action, `revalidatePath('/[lang]', 'page')` invalide le cache statique de la landing page pour propager immédiatement les modifications sans re-déploiement.

## Conventions
Voir `GEMINI.md` : respect strict de la charte `DESIGN.md`, modularité et réutilisation maximale des composants existants, centralisation absolue des textes (dictionnaires/constantes/BDD), page racine Server Component sans `"use client"`, scrollytelling et motion design intégraux avec framer-motion, Tailwind uniquement (zéro transition/animation CSS), sécurité renforcée (SQL paramétré, validation Zod, blob privé), réactivité SSG/ISR.
