# CLAUDE.md — Portfolio de Maël Garnier

Ce fichier décrit l'architecture du projet, les bonnes pratiques à respecter et les conventions personnelles de l'auteur. À lire avant toute modification.

## 1. Vue d'ensemble

Portfolio personnel (en construction), bilingue **fr / en**.

- **Stack** : Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, framer-motion, matter-js (animations/physique), `next/font/google` (Syne, Outfit, JetBrains Mono).
- **Alias** : `@/*` → racine du projet (ex. `@/app/modeles`).
- **Commandes** : `npm run dev`, `npm run build`, `npm run lint`. Toujours lancer `npm run lint` et `npm run build` avant de conclure un travail.
- **Gestionnaire de paquets** : un `package-lock.json` et un `pnpm-lock.yaml` coexistent — ne pas en introduire de nouveau ; ne pas committer de divergence entre les deux sans demande.

### Architecture

```
proxy.ts                  # (ex-middleware Next 16) détecte la langue (Accept-Language) et redirige vers /fr ou /en
app/
  layout.tsx              # layout racine : polices, <NavProvider>, <header><NavBar/></header>
  [lang]/page.tsx         # page d'accueil : Server Component async, charge le dictionnaire
  recup-dictionnaire.ts   # getDictionary(locale) — `server-only`, type `Dictionary` dérivé de fr.json
  dictionnaires/{fr,en}.json  # TOUS les textes affichés
  modeles.ts              # interfaces métier (Competence, Projet, Parcour)
  services.ts             # logique métier (classe statique Services)
  context/NavContext.tsx  # contexte client (état d'ouverture de la nav)
  hook/useNavState.tsx    # hooks personnalisés
  components/             # composants (Animator3000, ProjectComp, TimeLine, Competences, ...)
  globals.css             # thème Tailwind (variables CSS --background, --primary, ...)
public/                   # images, illustrations, svg
```

### Flux de données

1. `proxy.ts` redirige `/` → `/{locale}`.
2. `app/[lang]/page.tsx` (serveur) `await params`, appelle `getDictionary(lang)`, puis passe les données aux composants en props.
3. Les composants interactifs/animés sont des Client Components (`"use client"`) qui reçoivent des données **sérialisables** déjà prêtes.

## 2. SSR & SEO — priorité absolue

Le rendu serveur et le SEO doivent rester **optimaux en toute circonstance**.

### SSR
- **Server Components par défaut.** `"use client"` uniquement quand c'est indispensable (état, effets, événements, framer-motion, matter-js, APIs navigateur). Le placer le plus bas possible dans l'arbre : isoler la partie interactive dans un petit composant feuille, garder la page et le contenu textuel côté serveur.
- Tout le contenu textuel important (titres, descriptions, parcours, projets) doit être **présent dans le HTML initial**. Les animations ne doivent jamais empêcher le contenu d'être rendu côté serveur (pas de `opacity: 0` bloquant sans fallback, pas de contenu monté uniquement dans `useEffect`).
- Éviter `window`/`document` au rendu ; les confiner dans `useEffect` ou dans un composant chargé via `next/dynamic` si besoin (en gardant le contenu SEO hors de ce composant).
- Pas d'erreur d'hydratation : pas de `Math.random()`, `Date.now()`, ou valeurs dépendant du navigateur dans le rendu initial.
- Utiliser `server-only` pour tout module qui ne doit jamais atteindre le client.
- Préférer le rendu statique : `generateStaticParams` pour `[lang]` (`fr`, `en`) afin de pré-générer les pages. Éviter `cookies()`, `headers()` ou `dynamic = 'force-dynamic'` dans les pages sauf nécessité.
- Charger les données côté serveur (fetch / imports), jamais via `useEffect` côté client pour du contenu indexable.
- Utiliser `Suspense`/`loading.tsx` pour le streaming de parties lentes, sans nuire au contenu critique.

### SEO
- **Metadata par page** via `export const metadata` ou `generateMetadata` (async, utilise `lang`) : `title` (avec `template`), `description`, `alternates.canonical`, `alternates.languages` (hreflang `fr`/`en`/`x-default`), `openGraph`, `twitter`, `robots`. Définir `metadataBase`.
- `<html lang>` doit refléter la langue réelle de la page (⚠ actuellement `lang="fr"` en dur dans `layout.tsx` : à rendre dynamique, par ex. via un layout `app/[lang]/layout.tsx`).
- Fournir `app/sitemap.ts`, `app/robots.ts`, un `favicon`/icônes et une image Open Graph (`opengraph-image`).
- **Données structurées JSON-LD** (`Person`, `WebSite`, éventuellement `CreativeWork` pour les projets) injectées via `<script type="application/ld+json">` côté serveur.
- **Un seul `<h1>` par page**, hiérarchie `h1 → h2 → h3` sans saut. (⚠ la page d'accueil contient actuellement plusieurs `h1` : à corriger en `h2` pour les sections.)
- HTML sémantique : `header`, `nav`, `main`, `section`, `article`, `footer`, `ul/li`, `time` pour les dates. Une `section` = un titre.
- Liens internes : `next/link`, textes d'ancre explicites, `aria-label` si icône seule.
- Images : toujours `next/image` avec `alt` pertinent et traduit, `width`/`height` (ou `fill` + `sizes`), `priority` uniquement sur l'image LCP, formats modernes. Éviter `<img>` brut (⚠ `Competence.tsx` en utilise pour les étoiles : préférer `next/image` ou SVG inline avec `aria-hidden`/texte alternatif global, ex. « maîtrise 4/5 »).
- Polices : `next/font` uniquement, avec `subsets`, `display: "swap"`. Charger uniquement les graisses utilisées.
- URLs propres et stables, une version par langue (`/fr`, `/en`), redirection 308/307 de `/` selon `Accept-Language`.

## 3. Performance (Core Web Vitals)

- **LCP** : image/texte hero rapide, `priority` sur l'image principale, pas de gros JS bloquant.
- **CLS** : dimensions réservées pour images et blocs animés ; pas d'animation de propriétés provoquant du reflow (animer `transform` et `opacity`).
- **INP/JS** : limiter le JS client ; charger lourd (matter-js, animations de fond) en `next/dynamic` avec `ssr: false` **uniquement** pour les éléments décoratifs ; respecter `prefers-reduced-motion`.
- Pas de dépendance ajoutée sans justification (poids du bundle). Importer seulement ce qui est utilisé (`motion` ciblé, pas de lib entière).
- Nettoyer les effets (`removeEventListener`, `cancelAnimationFrame`, destroy du moteur matter-js, `Engine.clear`) pour éviter les fuites mémoire.
- Mémoïser (`useMemo`, `useCallback`, `memo`) seulement si utile ; clés stables dans les listes (pas d'index si l'ordre peut changer).

## 4. Accessibilité (a11y)

- Contraste suffisant (WCAG AA) entre texte et fonds colorés (palette `--background #dfe5ed`, `--foreground #20272e`, `--primary #3f7694`, `--secondary #43654f`).
- Navigation clavier complète, états `focus-visible` visibles, ordre de tabulation logique.
- Éléments interactifs = `<button>`/`<a>`, jamais `div onClick`.
- `alt` descriptif sur les images informatives, `alt=""` pour les décoratives.
- Respecter `prefers-reduced-motion` pour toutes les animations.
- Attributs ARIA seulement quand le HTML sémantique ne suffit pas.

## 5. Bonnes pratiques Next.js (App Router, v16)

- `params` et `searchParams` sont des **Promises** : `const {lang} = await params;`.
- `proxy.ts` remplace `middleware.ts` (fonction exportée `proxy`). Garder le `matcher` pour exclure assets/API.
- Utiliser les types globaux générés (`PageProps<'/[lang]'>`, `LayoutProps<'/'>`) quand disponibles.
- Valider la locale : si `lang` n'est pas dans `['fr','en']`, `notFound()` plutôt qu'un repli silencieux ; centraliser la liste des locales (actuellement dupliquée entre `proxy.ts` et `recup-dictionnaire.ts` → une seule source de vérité).
- Ajouter `not-found.tsx`, `error.tsx`, `loading.tsx` au besoin.
- Config dans `next.config.ts` (typé). Pas de variables sensibles côté client ; seules les `NEXT_PUBLIC_*` sont exposées.
- Pas de `useEffect` pour ce qui peut se calculer au rendu ou côté serveur.
- Context React : à utiliser avec parcimonie, provider mince placé au plus bas possible, valeur mémoïsée si elle change.
- Vérifier que ce qui est passé d'un Server à un Client Component est sérialisable (pas de fonctions/classes). Éviter les cast `as unknown as Type` : typer le JSON correctement à la source.

## 6. TypeScript & qualité du code

- `strict: true` : **jamais de `any`**, éviter `as unknown as X` ; préférer des types dérivés (`typeof fr`) et des interfaces dans `app/modeles.ts`.
- Types explicites sur les props des composants, `interface` pour les formes d'objets, `type` pour unions/dérivés.
- Imports via l'alias `@/`, pas de chemins relatifs profonds (`../../..`).
- ESLint (`eslint-config-next` core-web-vitals + typescript) doit passer sans erreur ni warning ignoré.
- Fonctions petites, une responsabilité, early return, pas de code mort ni de `console.log` laissé.
- Pas de valeurs magiques : constantes nommées (couleurs de projets, durées d'animation, tailles).
- Gérer les cas limites (liste vide, valeur manquante, locale inconnue).
- Commits petits et ciblés, messages clairs.

## 7. Styles (Tailwind CSS v4)

- **RÈGLE STRICTE — Jamais de CSS pur, toujours du Tailwind.** Tout le style passe par des classes utilitaires Tailwind. Pas de nouveau fichier `.css`, pas de CSS modules, pas de `<style>`, pas de `style={{...}}` (sauf valeur réellement dynamique impossible en Tailwind, ex. `style` alimenté par un `MotionValue` framer-motion). `globals.css` ne contient que l'import Tailwind, les variables du thème (`:root`, `@theme inline`) et le strict minimum de styles de base déjà présents.
- **RÈGLE STRICTE — Jamais d'animation en CSS ni en Tailwind, toujours framer-motion.** Interdits : `@keyframes`, `animation-*`, `transition-*`, `duration-*`, `ease-*`, `animate-*` (`animate-spin`, `animate-pulse`...), `delay-*`, ainsi que `hover:`/`group-hover:` servant à animer. Toute animation (apparition, survol, scroll, layout, boucle) utilise `motion.*`, `whileHover`, `whileInView`, `useScroll`, `useSpring`, `animate`, `layout`, `AnimatePresence`, etc. Réutiliser `Anm` (`Animator3000`) pour les apparitions et l'easing `[0.16, 1, 0.3, 1]`. Un simple changement d'état visuel instantané (couleur au `hover:`) reste du Tailwind **sans** `transition-*` ; s'il doit être animé, passer par `whileHover`.
- Tailwind d'abord ; thème via `@theme inline` dans `globals.css` (`bg-background`, `text-primary`, ...). Ajouter les nouvelles couleurs/polices comme tokens du thème plutôt que des valeurs en dur (⚠ des hex sont actuellement passés en props dans la page).
- **Mobile-first** : classes de base pour mobile, `sm:` et plus pour les écrans larges.
- Typographie : titres `Syne` (h1–h3, graisse 900), texte `Outfit`, code `JetBrains Mono`. Utiliser les variables `--font-*` de `next/font` (⚠ `globals.css` référence les noms de familles directement : à aligner sur les variables).
- Pas de CSS inline ni de `!important` ; pas de classes dupliquées en masse → extraire un composant.
- Vérifier le rendu à 320 px, tablette et desktop ; aucun débordement horizontal.

## 8. Internationalisation (i18n)

- **Aucun texte en dur** dans les composants : tout passe par `app/dictionnaires/fr.json` et `en.json`, qui doivent avoir **exactement les mêmes clés**.
- Le type `Dictionary` est dérivé de `fr.json` : `fr.json` fait référence ; toute clé ajoutée l'est dans les deux fichiers.
- Les textes (y compris `alt`, `aria-label`, messages d'erreur) sont traduits.
- Dates : formatage via `Intl.DateTimeFormat(lang)` plutôt que des chaînes brutes `jj/mm/aaaa`.
- Les contenus placeholder (« lorem »/texte aléatoire dans les dictionnaires) sont temporaires : les remplacer avant mise en production.

## 9. Conventions personnelles de Maël (identifiées dans le code)

- **Langue** : le code métier est nommé en **français** (`Competence`, `Projet`, `Parcour`, `recup-dictionnaire`, `modeles.ts`, `dictionnaires/`, `dateDebut`, `maitrise`, `nombre_projets`). Les commentaires et messages d'erreur sont en français. Les concepts techniques standards restent en anglais (`hook`, `context`, `components`). Rester cohérent avec ce mélange ; discuter avec l'utilisateur et répondre en **français**.
- **Composants** : un composant par fichier, nom en PascalCase, `export default function`, fichiers dans `app/components/`. Composants "feuille" animés réutilisables (ex. `Anm` = `Animator3000` avec props `delay`, `scale`).
- **Données/typage** : interfaces centralisées dans `app/modeles.ts`; logique dans `app/services.ts` (classe avec méthodes `static`) ; données dans les dictionnaires JSON.
- **Hooks** dans `app/hook/`, **contexts** dans `app/context/` (avec garde : erreur explicite si le hook est utilisé hors du provider).
- **Formatage** : indentation **4 espaces**, guillemets doubles dans le JSX, `className={"..."}` fréquent (accolades + chaîne), accolades de props sans espaces dans les imports (`import {X} from ...`). Suivre le style du fichier modifié, ne pas reformater massivement.
- **Design** : esthétique moderne et animée (framer-motion, easing `[0.16, 1, 0.3, 1]`, apparitions échelonnées via `delay`), fonds dynamiques, grille « bento » de projets de tailles variées (`ProjectComp` size 1–4), palette bleu/vert sourde, ton éditorial et affirmé (« Encore un ingénieur ? »).
- **Approche** : pragmatique, itérative ; le projet évolue vite. Préférer des solutions simples et lisibles, mais ne pas laisser de dette dans le SEO/SSR.
- **Veille techno** : versions récentes privilégiées (Next 16, React 19, Tailwind 4, ESLint 9 flat config). Consulter la documentation à jour avant d'utiliser une API (`node_modules/next/dist/docs` ou nextjs.org) car certaines APIs ont changé.
- **Commentaires existants** : ne jamais supprimer les commentaires/docstrings existants non liés à la modification (ex. description des tailles dans `ProjectComp`).

## 10. Points connus à corriger (dette actuelle)

- `lang="fr"` en dur dans `app/layout.tsx` ; metadata statique et non localisée.
- Plusieurs `<h1>` sur la page d'accueil.
- Pas de `sitemap`, `robots`, hreflang, Open Graph, JSON-LD.
- `NavBar` vide ; `useNavState` et `NavContext` dupliquent la même logique.
- `Services.enrichirCompetences` est un stub.
- Le même projet (`liste[0]`) est répété dans la grille ; `descripcion` (faute) dans `Projet`/`Parcour` vs `description` dans le JSON → incohérence à corriger.
- `<img>` brut dans `Competence.tsx` ; `Syne` sans `subsets`.
- Locales dupliquées entre `proxy.ts` et `recup-dictionnaire.ts`.
- Texte placeholder dans les dictionnaires ; `README.md` par défaut.

## 11. Workflow Git (développement et releases)

### Développement quotidien
- **Toute modification se fait directement sur la branche `develop`** : pas de branche de fonctionnalité, **pas de Pull Request**.
- Avant de commencer : `git checkout develop` puis `git pull origin develop`. Vérifier avec `git branch --show-current` que l'on est bien sur `develop`.
- Une fois le travail terminé et validé (`npm run lint` + `npm run build` OK), faire des commits petits et ciblés, puis **pousser directement** : `git push origin develop`.
- Ne **jamais** committer ni pousser directement sur `main` en dehors d'une release.

### Release sur `main`
- **Une release n'est faite que sur demande explicite de Maël.** Ne jamais en déclencher une de sa propre initiative.
- Process :
  1. Vérifier que `develop` est à jour et propre (`git status`), que `docs/` est à jour, puis que `npm run lint` et `npm run build` passent.
  2. `git checkout main && git pull origin main`.
  3. Fusionner `develop` dans `main` : `git merge develop` (sans PR). Résoudre les éventuels conflits en conservant le contenu de `develop`.
  4. `git push origin main`.
  5. Revenir sur `develop` : `git checkout develop`.
- Optionnel, si Maël le demande : poser un tag de version (`git tag vX.Y.Z && git push origin vX.Y.Z`).
- Pas de `push --force` sur `develop` ni sur `main`, sauf demande explicite.

## 12. Documentation du projet (`docs/`)

- Un dossier **`docs/`** existe à la racine du projet et contient des fichiers `.md` décrivant les **fonctionnalités** et la **documentation** du projet.
- S'il n'existe pas ou s'il manque des fichiers, le créer. Fichiers conseillés (un sujet par fichier, nommage en minuscules avec tirets) :
  - `docs/README.md` : index et sommaire de la documentation ;
  - `docs/architecture.md` : structure du projet, flux de données, choix techniques ;
  - `docs/fonctionnalites.md` : liste et description des fonctionnalités (sections de la page, animations, projets, parcours, compétences) ;
  - `docs/i18n.md` : fonctionnement du multilingue (proxy, dictionnaires, ajout d'une langue) ;
  - `docs/seo.md` : stratégie SEO/SSR (metadata, hreflang, sitemap, JSON-LD) ;
  - `docs/workflow.md` : développement, branches, releases, déploiement.
- **Mise à jour régulière et obligatoire** : à chaque ajout, modification ou suppression de fonctionnalité, de composant, de route, de dépendance ou de comportement notable, mettre à jour les fichiers concernés **dans le même commit** que le code.
- Garder la documentation **fidèle au code** : supprimer ce qui n'existe plus, ne pas documenter ce qui n'est pas implémenté (ou le marquer « prévu »).
- Rédaction en français, concise, avec exemples de code ou chemins de fichiers quand c'est utile.
- Lors d'une release, vérifier que `docs/` est à jour avant de fusionner sur `main`.

## 13. Checklist avant de terminer une tâche

- [ ] Contenu rendu côté serveur et visible sans JS (hors animations).
- [ ] Metadata / hreflang / h1 unique / sémantique HTML corrects.
- [ ] Textes ajoutés dans `fr.json` **et** `en.json`.
- [ ] Pas de `any`, types à jour dans `modeles.ts`.
- [ ] Aucun CSS pur ; aucune animation CSS/Tailwind (framer-motion uniquement).
- [ ] Responsive mobile-first vérifié, a11y de base (alt, focus, contraste, reduced-motion).
- [ ] `npm run lint` et `npm run build` passent.
- [ ] Dossier `docs/` mis à jour si fonctionnalité, architecture ou comportement modifié.
