# GEMINI.md — Portfolio de Maël Garnier

Ce fichier décrit l'architecture du projet, les bonnes pratiques à respecter, les choix techniques (Neon, Blob, Admin) et les conventions personnelles de l'auteur. À lire impérativement avant toute modification.

---

## 1. Vue d'ensemble

Portfolio personnel bilingue **fr / en** (en construction permanente et évolutive).

- **Stack** : Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, framer-motion, matter-js (physique interactive), `@neondatabase/serverless` (PostgreSQL), `@vercel/blob` (stockage d'images privé), `zod` (validation stricte), `next/font/google` (Syne, Outfit, JetBrains Mono).
- **Base de données** : Neon PostgreSQL (`DATABASE_URL`), requêtes SQL typées et paramétrées (anti-injection). Schéma dans `db/schema.sql`.
- **Stockage d'images** : Vercel Blob en accès privé (`BLOB_READ_WRITE_TOKEN`). Les chemins relatifs (`dossier/nom.ext`) sont stockés en base et les images sont servies publiquement avec cache et en-têtes sécurisés via la route dédiée `/medias/[...chemin]`.
- **Alias** : `@/*` → racine du projet (ex. `@/app/modeles/Projet`, `@/app/services/PortfolioService`).
- **Commandes** :
  - `pnpm dev` : serveur de développement
  - `pnpm build` : compilation de production (TypeScript + Turbopack)
  - `pnpm lint` : validation ESLint (0 erreur, 0 warning)
  - `pnpm db:migrate` : application idempotente du schéma Neon (`db/schema.sql`)
  - `pnpm db:seed` : initialisation des données et téléversement initial des assets dans le blob

---

## 2. Architecture du projet

```
DESIGN.md                         # Charte graphique et style de référence (Alpine Engineering, tokens, animations framer-motion)
proxy.ts                          # Détection de langue (Accept-Language) et redirection vers /{locale}
db/
  schema.sql                      # Schéma PostgreSQL (tables: competence, projet, projet_traduction, projet_competence, projet_image, experience, experience_traduction)
scripts/
  migrate.mjs                     # Script d'application de schema.sql
  seed.mjs                        # Migration initiale dictionnaires -> Neon & Blob
app/
  layout.tsx                      # Layout racine : polices Google, NavProvider, NavBar
  [lang]/page.tsx                 # Landing page (Server Component statique SSG, chargement optimisé via PortfolioService)
  recup-dictionnaire.ts           # getDictionary(locale) — Textes statiques de l'UI (boutons, titres génériques)
  dictionnaires/{fr,en}.json      # Dictionnaires JSON stricts pour les textes statiques
  lib/
    db.ts                         # Client Neon HTTP serverless
    blob.ts                       # Téléversement / suppression d'images Vercel Blob avec validation des types MIME réels (magic numbers)
    media.ts                      # Utilitaires d'URL `/medias/...` et validation de chemins de médias
    admin-auth.ts                 # Point unique de contrôle d'accès pour l'espace /admin
    langues.ts                    # Source unique de vérité des langues (fr, en)
    dates.ts                      # Formatage déterministe des dates (mois année) selon la locale
  modeles/                        # UN fichier .ts par entité
    Traduction.ts                 # Schémas et types de dates, couleurs, traductions
    Competence.ts                 # Types et schémas Zod pour Competence
    Projet.ts                     # Types et schémas Zod pour Projet
    Experience.ts                 # Types et schémas Zod pour Experience (parcours)
  services/                       # Logique métier serveur
    PortfolioService.ts           # Lecture agrégée et optimisée (1 seule transaction SQL) pour la landing page
    CompetenceService.ts          # CRUD complet pour l'administration des compétences
    ProjetService.ts              # CRUD complet avec traductions, compétences associées et images
    ExperienceService.ts          # CRUD complet avec traductions pour les expériences
  admin/                          # Espace d'administration complet (protégé, dynamic = 'force-dynamic')
    layout.tsx                    # Layout admin avec navigation et exclusion robots/cache
    page.tsx                      # Tableau de bord d'administration
    competences/page.tsx          # Gestion et formulaires des compétences
    projets/page.tsx              # Gestion et formulaires des projets
    experiences/page.tsx          # Gestion et formulaires des expériences
    actions/                      # Server Actions sécurisées (Zod + assertAdmin + revalidation)
      utils.ts                    # Utilitaires de formulaires, parsing, erreurs Zod, revalidatePath
      competences.ts              # Actions d'enregistrement et suppression de compétence
      projets.ts                  # Actions d'enregistrement et suppression de projet
      experiences.ts              # Actions d'enregistrement et suppression d'expérience
    components/                   # Composants d'édition admin (formulaires, champs, suppression 2 étapes)
  medias/[...chemin]/route.ts     # Route de streaming sécurisé des images du Blob privé (cache immuable, CSP sandbox)
  components/                     # Composants UI de la landing page (Anm, ProjectComp, TimeLine, Competences...)
  context/NavContext.tsx          # Contexte de navigation
  hook/useNavState.tsx            # Hook de navigation
  globals.css                     # Thème Tailwind v4 (@theme inline)
public/                           # Assets statiques publics
docs/                             # Documentation vivante du projet (voir section 12)
```

---

## 3. Règles strictes de style et d'animations

- **CHARTE GRAPHIQUE OFFICIELLE (`DESIGN.md`) :**
  - Tout développement UI, choix de typographie, espacement, découpe géométrique et composant visuel **doit impérativement respecter la charte graphique définie dans [`DESIGN.md`](DESIGN.md)** (*High-Altitude Engineering / Alpine precision & software engineering monolith on mineral slate*).
  - Couleurs strictement limitées à celles déclarées dans `globals.css` et leurs surfaces coordonnées dans `DESIGN.md`.
  - Image de landing immuable : `/hero.jpeg` (Maël en haute montagne).
  - Zéro ombre diffuse (`shadow-*`), zéro dégradé flou, surfaces planes avec découpes géométriques (notched 45°, capsules pill 28.8px, hexagones télémétriques, cercles parfaits).
- **JAMAIS DE CSS PUR, TOUJOURS DU TAILWIND.**
  - Tout le style passe par les classes utilitaires Tailwind.
  - Aucun fichier `.css` supplémentaire, aucun module CSS, aucune balise `<style>`, aucun attribut `style={{...}}` (sauf contrainte technique absolue impossible en Tailwind, ex. style branché à un `MotionValue` framer-motion).
  - `globals.css` ne contient que l'import Tailwind et les tokens de thème (`:root`, `@theme inline`).
- **JAMAIS D'ANIMATION EN CSS NI EN TAILWIND, TOUJOURS FRAMER-MOTION.**
  - Sont formellement interdits dans le code : classes `transition-*`, `duration-*`, `ease-*`, `animate-*` (`animate-spin`, `animate-pulse`, etc.), `@keyframes` CSS, et les pseudo-classes `hover:` servant à fabriquer des transitions animées.
  - Toutes les animations (apparitions au scroll, transitions de page, survols, layouts reordonnés, défilements) doivent être réalisées avec framer-motion : `motion.*`, `whileHover`, `whileTap`, `whileInView`, `AnimatePresence`, `layout`, `useScroll`, `useSpring`.
  - Réutiliser le composant `Anm` (`Animator3000`) avec son easing caractéristique `[0.16, 1, 0.3, 1]`.

---

## 4. Modèles de données (`app/modeles/`)

- Chaque entité métier possède son **propre fichier `.ts`** dans `app/modeles/` :
  - `Competence.ts` : catégories (`programmation`, `web`, `bdd`, `deploiement`, `equipe`), logo, maîtrise (0-5), ordre, schéma de validation `CompetenceSaisieSchema`.
  - `Projet.ts` : dates, taille de carte (1 à 4), couleur hex, compétences associées, liste d'images ordonnées, traductions (`nom`, `description`), schéma `ProjetSaisieSchema`.
  - `Experience.ts` : dates, traductions (`nom`, `lieu`, `description`), schéma `ExperienceSaisieSchema`.
  - `Traduction.ts` : types partagés, validation des dates ISO, schéma générique des traductions multilingues.
- Interdiction d'utiliser `any` ou des assertions `as unknown as Type`. Tout doit être typé de bout en bout avec Zod et TypeScript.

---

## 5. Base de données Neon & Stockage Blob

- **Base de données Neon** :
  - Client via `@neondatabase/serverless` (`neon(process.env.DATABASE_URL)`).
  - Toujours utiliser les tagged templates `sql`...`` avec paramètres pour empêcher toute injection SQL.
  - Les opérations multiples sont exécutées dans `sql.transaction([...])` pour garantir l'atomicité et limiter la latence réseau (1 seul aller-retour HTTP).
- **Vercel Blob Storage** :
  - Le store est configuré en **accès privé**.
  - Validation stricte des fichiers entrants dans `app/lib/blob.ts` : taille max (4 Mo), vérification du type binaire réel par les premiers octets (magic numbers : PNG, JPEG, GIF, WebP, SVG sain sans scripts ni balises dangereuses).
  - Stockage en base du **chemin relatif** uniquement (ex. `competences/nom-random.png`).
  - Distribution publique via `app/medias/[...chemin]/route.ts` avec validation du chemin (regex stricte, anti-traversal), en-têtes `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox`, et cache HTTP `immutable` d'un an.
  - Lors de la suppression ou du remplacement d'un objet en base, les fichiers Blob orphelins sont purgés.

---

## 6. SSR & SEO — Priorité absolue

- **Landing page statique et ultra-rapide** :
  - `app/[lang]/page.tsx` est pré-généré au build via `generateStaticParams()` pour chaque langue disponible (`fr`, `en`).
  - `dynamicParams = false` : toute route linguistique non définie produit immédiatement un 404.
  - Les données Neon sont chargées via `PortfolioService.recuperer(lang)` qui effectue **une seule transaction HTTP** regroupant les 3 requêtes (compétences, projets, expériences) avec agrégation JSON côté PostgreSQL (zéro problème N+1).
  - La fonction est enveloppée dans `React.cache()` pour dédoublonner au sein d'un même rendu.
- **Revalidation ISR à la demande** :
  - Lors d'une modification dans `/admin`, les Server Actions déclenchent `revalidatePath('/[lang]', 'page')`, ce qui régénère instantanément les pages du portfolio sans redémarrage.
- **SEO & Balisage** :
  - Métadonnées complètes générées par `generateMetadata()` selon la langue.
  - HTML sémantique strict : un seul `<h1>`, balises `<section>`, `<article>`, `<time>`.
  - Images servies via `next/image` avec `sizes`, `alt` pertinents et formats optimisés.

---

## 7. Espace d'administration (`/admin`) et Sécurité globale

- **Système d'authentification globale (`account.maelg.fr`)** :
  - Connexion centralisée sur `https://account.maelg.fr/login`.
  - Jeton JWT signé avec la clé partagée `JWT_SECRET` (variable d'environnement).
  - Validation cryptographique via `TokenUtil` ([app/lib/token.ts](file:///home/mael/Dev/portfolio/app/lib/token.ts)) avec la librairie `jose`.
  - Table Neon `authorized` (`id text PRIMARY KEY, nom text, created_at timestamptz`) vérifiant que l'identifiant extrait du token possède explicitement les droits d'administration.
  - Gestion CLI des administrateurs autorisés : `pnpm db:authorize list|add|remove`.
- **Défense en profondeur (2 niveaux)** :
  1. **Niveau Middleware / Proxy (`proxy.ts`)** :
     - Si aucun jeton n'est présent ou s'il est invalide : redirection vers `https://account.maelg.fr/login?redirect=<url_cible>`.
     - Si le jeton est valide mais que l'ID n'est pas dans la table `authorized` : redirection immédiate vers `/no`.
  2. **Niveau Serveur & Server Actions (`app/lib/admin-auth.ts`)** :
     - `assertAdmin()` contrôle le cookie `token`, sa signature et les droits en base avant toute exécution de Server Action.
     - `exigerAdmin()` protège le rendu des Server Components d'administration.
- **Exclusion moteurs de recherche et cache** :
  - `robots: { index: false }` et en-têtes `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: no-store`.
- Gestion complète :
  - Création, modification et suppression en 2 étapes (confirmation explicite).
  - Téléversement d'images par glisser/déposer ou sélection, réordonnancement d'images de projets, suppression d'images spécifiques.
  - Saisie multilingue avec onglets/champs pour chaque langue gérée (`fr` obligatoire, autres optionnelles avec repli automatique sur `fr`).
  - Exclusion explicite des moteurs de recherche et du cache via `robots: { index: false }` et en-têtes `X-Robots-Tag: noindex`.

---

## 8. Internationalisation (i18n)

- Deux langues officielles : `fr` (par défaut) et `en`. Source unique : `app/lib/langues.ts`.
- `proxy.ts` inspecte les en-têtes `Accept-Language` et redirige `/` vers `/{locale}` en ignorant les routes système, `/admin`, et `/medias`.
- Les données dynamiques (projets, expériences) possèdent une table de traduction en base (`projet_traduction`, `experience_traduction`). Si une traduction anglaise n'est pas renseignée, le service de lecture bascule automatiquement sur le contenu français.
- Les textes d'interface statiques sont dans `app/dictionnaires/fr.json` et `en.json`.

---

## 9. Conventions personnelles de Maël

- **Nommage** : code métier et données rédigés en **français** (`Competence`, `Projet`, `Experience`, `PortfolioService`, etc.). Concepts techniques standards en anglais.
- **Composants** : un composant par fichier, PascalCase, `export default function`. Composants interactifs isolés au plus bas de l'arbre.
- **Indentation** : 4 espaces, syntaxe propre, pas de commentaires superflus mais préservation stricte de toute documentation existante utile.
- **Communication** : toujours répondre en français, de manière concise, directe et professionnelle.

---

## 10. Workflow Git

### Développement quotidien
- **Toute modification se fait directement sur la branche `develop`** : pas de branche de fonctionnalité, **pas de Pull Request**.
- Avant de commencer : vérifier que l'on est sur `develop` et à jour.
- Valider systématiquement avec `pnpm lint` et `pnpm build` avant tout commit.
- Faire des commits atomiques avec des messages clairs (ex: `feat: ...`, `fix: ...`, `docs: ...`).
- **Pousser directement** : `git push origin develop`.
- Ne **jamais** committer ni pousser directement sur `main` en dehors d'une release officielle.

### Release sur `main`
- **Effectuée uniquement à la demande explicite de Maël.**
- Process :
  1. Vérifier que `develop` est propre (`git status`), que `docs/` est à jour, et que `pnpm lint` + `pnpm build` passent sans accroc.
  2. `git checkout main && git pull origin main`.
  3. `git merge develop` (sans PR).
  4. `git push origin main`.
  5. Revenir immédiatement sur `develop` : `git checkout develop`.
- Pas de `push --force` sur `develop` ni `main` sauf demande expresse de Maël.

---

## 11. Documentation du projet (`docs/`)

- Le dossier **`docs/`** à la racine doit rester constamment à jour :
  - `docs/README.md` : sommaire général
  - `docs/architecture.md` : architecture globale, stack, services, BDD, Blob, flux de données
  - `docs/fonctionnalites.md` : fonctionnalités publiques et back-office `/admin`
  - `docs/i18n.md` : gestion des langues en base et dictionnaires
  - `docs/seo.md` : stratégie SEO, SSG, revalidations ISR, médias
  - `docs/workflow.md` : cycle de développement, git, commandes
- **Toute modification d'architecture, de fonctionnalité ou d'outil doit être reflétée dans `docs/` dans le même commit.**

---

## 12. Checklist avant de conclure une tâche

- [ ] Respect strict de la charte graphique [`DESIGN.md`](DESIGN.md) (typographies, échelle, surfaces, pas d'ombres diffuses).
- [ ] Contenu rendu côté serveur (SSG / SSR) et indexable.
- [ ] Zéro CSS pur ; zéro animation CSS/Tailwind (framer-motion uniquement).
- [ ] Modèles séparés dans `app/modeles/*.ts`.
- [ ] Sécurité respectée (validation Zod, requêtes SQL paramétrées, sanitization des uploads).
- [ ] Documentation dans `docs/` mise à jour.
- [ ] `pnpm lint` passe avec 0 erreur et 0 warning.
- [ ] `pnpm build` compile avec succès.
