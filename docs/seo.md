# SSR et SEO

## Principes
Server Components par défaut, contenu textuel dans le HTML initial, `"use client"` seulement pour l'interactif et l'animation. Voir `CLAUDE.md` section 2.

## État actuel
- Page rendue côté serveur avec dictionnaire chargé côté serveur.
- Polices via `next/font`, images via `next/image` (sauf étoiles de `Competence.tsx` en `<img>`).
- Metadata statique minimale dans `layout.tsx` (titre, description).

## À faire
- `generateMetadata` localisé : title, description, canonical, hreflang, Open Graph, Twitter.
- `<html lang>` dynamique selon la langue.
- Un seul `<h1>` par page (plusieurs aujourd'hui).
- `generateStaticParams` pour `fr` et `en`.
- `sitemap.ts`, `robots.ts`, image Open Graph, JSON-LD (`Person`, `WebSite`).
- `subsets` sur la police Syne.
