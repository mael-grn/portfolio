# Architecture

## Stack
Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, framer-motion, matter-js, `next/font/google` (Syne, Outfit, JetBrains Mono). Alias `@/*` pointant vers la racine.

## Arborescence
```
proxy.ts                      Détection de langue + redirection (ex-middleware)
app/
  layout.tsx                  Layout racine : polices, NavProvider, header/NavBar
  [lang]/page.tsx             Page d'accueil (Server Component async)
  recup-dictionnaire.ts       getDictionary(locale), `server-only`, type Dictionary
  dictionnaires/{fr,en}.json  Tous les textes et données (projets, parcours, compétences)
  modeles.ts                  Interfaces Competence, Projet, Parcour
  services.ts                 Services (classe statique, stub pour l'instant)
  context/NavContext.tsx      Contexte client d'ouverture de la navigation
  hook/useNavState.tsx        Hook d'état ouvert/fermé
  components/                 Composants UI (voir ci-dessous)
  globals.css                 Thème Tailwind (couleurs, polices)
public/                       Images et illustrations
```

## Flux de données
1. `proxy.ts` redirige toute URL sans locale vers `/fr` ou `/en` (selon `Accept-Language`, défaut `fr`).
2. `app/[lang]/page.tsx` fait `await params`, charge le dictionnaire côté serveur et passe les données en props aux composants.
3. Les composants animés sont des Client Components recevant des données sérialisables.

## Composants (`app/components/`)
| Composant | Rôle |
|---|---|
| `Animator3000` (`Anm`) | Apparition animée au scroll (`whileInView`), props `delay`, `x`, `y`, `scale` |
| `DynamicBackground` | Fond dont l'opacité suit le scroll (sections `#content` et `#code`) |
| `BubbleAnimaned` | `BubbleContainer` / `Bubble` : bulles flottantes interactives (physique, souris) |
| `Competences` / `Competence` | Défilement horizontal automatique de compétences avec niveau en étoiles |
| `ResizeGroup` / `LayoutContainer` | `LayoutGroup` et `motion.div layout` de framer-motion |
| `ProjectComp` | Carte projet « bento », tailles 1 à 4, couleur en prop |
| `TimeLine` | Parcours chronologique avec ligne progressive liée au scroll |
| `NavBar` | Barre de navigation (vide pour l'instant) |

## Conventions
Voir `CLAUDE.md` : Tailwind uniquement, animations framer-motion uniquement, textes dans les dictionnaires, SSR/SEO prioritaires.
