# SSR, SEO et Performance

Le rendu côté serveur et le référencement naturel sont au cœur de l'architecture.

## 1. Rendu statique (SSG) et revalidation (ISR)

- **Pré-génération statique** :
  - `app/[lang]/page.tsx` exporte `generateStaticParams()` pour pré-générer les pages `/fr` et `/en` lors du build (`pnpm build`).
  - `dynamicParams = false` garantit qu'aucune page avec un paramètre invalide ne sera générée à la volée.
- **Requête unique agrégée** :
  - `PortfolioService.recuperer(lang)` rassemble en une seule transaction SQL Neon toutes les données nécessaires (compétences, projets avec leurs tags et images, expériences).
  - Aucune requête n'est effectuée lors de la visite des utilisateurs : le HTML est déjà pré-généré sur le CDN.
- **Revalidation à la demande (ISR)** :
  - Lorsqu'un élément est créé, modifié ou supprimé dans `/admin`, la Server Action appelle `revalidatePath('/[lang]', 'page')`.
  - La landing page est ainsi instantanément reconstruite en arrière-plan et servie aux futurs visiteurs.

## 2. Métadonnées & Balisage sémantique

- **Metadata localisées** : `generateMetadata` injecte le titre et la description selon la langue demandée.
- **Structure HTML sémantique** :
  - Les sections utilisent des balises `<section>`, `<article>`, `<time>`.
  - Hiérarchie de titres respectée (`<h1>` unique pour le titre principal, `<h2>` et `<h3>` pour les sous-sections).
- **Accessibilité (a11y)** :
  - Étoiles de notation des compétences pourvues d'attributs `aria-label` descriptifs (ex. « Niveau : 5 sur 5 »).
  - Images décoratives marquées avec `alt=""` et `aria-hidden`.
  - Les contrôles interactifs sont des vrais `<button>` ou liens `<Link>`.

## 3. Optimisation des images & Médias

- Composant `next/image` utilisé partout :
  - Image de fond dynamique (`DynamicBackground`) marquée en `priority`, `fill` et `sizes="100vw"` pour optimiser le LCP.
  - Logos et aperçus de projets dimensionnés avec `width` et `height` explicites pour éviter tout décalage de mise en page (CLS = 0).
  - Images vectorielles SVG servies avec `unoptimized` pour conserver la netteté et éviter le re-traitement serveur inutile.
- **Route de streaming `/medias/[...chemin]`** :
  - Sert les images privées du Blob storage.
  - En-tête de cache immuable : `Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable` avec support de l'`ETag`.
  - Protection stricte : en-têtes `X-Content-Type-Options: nosniff` et `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox` pour bloquer toute exécution de script même en cas d'ouverture directe d'un SVG.

## 4. Sécurité des en-têtes HTTP (`next.config.ts`)

- `poweredByHeader: false` (suppression du header `X-Powered-By: Next.js`).
- En-têtes globaux appliqués :
  - `X-Frame-Options: DENY` (anti-clickjacking).
  - `X-Content-Type-Options: nosniff` (anti-MIME-sniffing).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS).
  - `Permissions-Policy` désactivant caméra, microphone, géolocalisation et paiements.
- En-têtes d'administration (`/admin/*`) :
  - `X-Robots-Tag: noindex, nofollow, noarchive`.
  - `Cache-Control: no-store`.
