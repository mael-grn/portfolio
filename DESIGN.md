# High-Altitude Engineering — Style Reference
> Alpine precision & software engineering monolith on mineral slate

**Theme:** mixed (mineral light editorial / obsidian abyssal code)

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

High-Altitude Engineering treats software architecture and elite development as high-altitude alpine exploration: a cool mineral-slate canvas, stark obsidian terminal chambers, and authentic alpine mountain imagery that reframes elite software craft, systems reliability, and agentic autonomy as an uncompromising discipline of precision, endurance, and adaptability. Typography is the protagonist — a sculpted display type at sizes up to 374px carries the engineer's signature with dramatic negative tracking, paired with a neutral Swiss grotesk for utility and an uncompromising monospace for telemetry, metrics, and code. Sections alternate between wide, airy mineral editorial spreads and pitch-black terminal rooms, with zero blurred shadows, zero muddy gradients, and strict geometric cuts (notched card corners, 28.8px pill capsules, telemetry hexagons, and circular focus lenses). Every surface is flat, every dividing line is hairline, and visual contrast is driven by the palette defined in `app/globals.css`: the mineral slate canvas (`#dfe5ed`), the deep obsidian ink (`#20272e`), the alpine steel blue (`#3f7694`), and the high-altitude pine green (`#43654f`).

---

## Tokens — Colors

Toutes les couleurs découlent des variables fondamentales déclarées dans `app/globals.css`, complétées de teintes intermédiaires coordonnées pour les bordures et surfaces secondaires.

| Name | Value | Token | Role |
|------|-------|-------|------|
| Slate Canvas | `#dfe5ed` | `--color-background` (`--background`) | Dominant light canvas — the cool, mineral gray-blue that fills the hero background and light editorial sections. Evokes alpine mist and mountain granite |
| Obsidian Ink | `#20272e` | `--color-foreground` (`--foreground`) | Deep abyssal slate-black. Dominant surface for code rooms and terminal blocks; primary text fill on light canvas; hairline borders on elevated light elements |
| Alpine Steel | `#3f7694` | `--color-primary` (`--primary`) | High-altitude engineering blue. Used for active indicators, telemetry highlights, skill mastery accents, and technical focus strokes |
| Alpine Pine | `#43654f` | `--color-secondary` (`--secondary`) | Conifer evergreen. Signifies runtime stability, organic adaptability across environments, verified milestones, and secondary actions |
| Mineral Slate Card | `#cfd7e3` | `--color-slate-card` | Elevated card surface on light sections. One subtle step above Slate Canvas for structural elevation without shadows |
| Hairline Wire | `#9aaaba` | `--color-hairline` | Ultra-fine 1px border dividers, technical grid separators, and telemetry crosshairs |
| Muted Rock | `#5d6b79` | `--color-muted-rock` | Muted secondary text fills, subtitles, and telemetry metadata labels on light backgrounds |
| Pure Summit | `#ffffff` | `--color-summit` | Text on dark terminal sections, inverted micro-labels, and crisp reverse strokes. Never used as a large background canvas |
| Carbon Surface | `#29323b` | `--color-carbon-surface` | Elevated card surface within dark obsidian sections. Sits one notch above `#20272e` |

---

## Tokens — Typography

Le système combine trois familles complémentaires :
1. **Display & Heading** (`Syne` / substitute: `Davinci`, `Canela`, `Instrument Serif`, `GT Super`) : Brand voice monumentale, titrage sculpté, titrage hero jusqu'à 374px avec tracking négatif agressif.
2. **Utility Grotesk** (`Outfit` / substitute: `Helvetica Now`, `Inter`, `Neue Haas Grotesk`) : Rigueur suisse pour le corps de texte, la navigation, les labels de formulaires et les descriptions.
3. **Telemetry & Code** (`JetBrains Mono`) : Précision d'ingénieur pour les métriques, logs, horodatages ISO, coordonnées géométriques, stats système et extraits de code.

### Display & Heading — Syne · `--font-syne`
- **Substitute:** Davinci, Instrument Serif, Canela, Playfair Display
- **Weights:** 700, 800
- **Sizes:** 22, 26, 43, 52, 94, 374px
- **Line height:** 0.84, 1.00, 1.10, 1.33
- **Letter spacing:** -0.0090em, -0.0050em, -0.0020em
- **Role:** Voix de marque et autorité technique. Porte le wordmark hero de 374px, les titres de sections de 94px et les sous-titres d'impact à 52px. Le tracking négatif serré aux grandes échelles fait lire le texte comme une pièce monolithique gravée dans la roche.

### Utility Grotesk — Outfit · `--font-outfit`
- **Substitute:** Helvetica Now, Inter, Neue Haas Grotesk, Söhne
- **Weights:** 400, 500, 600
- **Sizes:** 12, 14, 15, 16, 20, 24px
- **Line height:** 1.25, 1.50
- **Role:** Lisibilité utilitaire irréprochable. Navigation, paragraphes de parcours, descriptions de projets, boutons d'action.

### Telemetry Monospace — JetBrains Mono · `--font-jetbrains`
- **Substitute:** Fira Code, SF Mono, Roboto Mono
- **Weights:** 400, 500, 700
- **Sizes:** 9, 11, 13, 15, 18px
- **Line height:** 1.20, 1.40
- **Role:** Métriques d'ingénierie, tags de technologies, statuts agentiques, paires de télémétrie (`SYS.ONLINE`, `COMMIT: 0x4F`), indices de sections.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| telemetry-xs | JetBrains Mono | 500 | 9px | 1.2 | +0.05em | `--text-telemetry-xs` |
| telemetry-sm | JetBrains Mono | 400 | 12px | 1.3 | 0 | `--text-telemetry-sm` |
| body-sm | Outfit | 400 | 15px | 1.5 | 0 | `--text-body-sm` |
| body-md | Outfit | 400 | 16px | 1.5 | 0 | `--text-body-md` |
| subheading | Syne | 700 | 22px | 1.33 | -0.11px | `--text-subheading` |
| heading-sm | Syne | 700 | 26px | 1.33 | -0.13px | `--text-heading-sm` |
| heading | Syne | 700 | 43px | 1.1 | -0.215px | `--text-heading` |
| heading-lg | Syne | 700 | 52px | 1.0 | -0.47px | `--text-heading-lg` |
| section-title | Syne | 700 | 94px | 0.84 | -0.85px | `--text-section-title` |
| display | Syne | 700 | 374px | 0.84 | -3.37px | `--text-display` |

---

## Tokens — Spacing & Shapes

**Base unit:** 4px  
**Density:** compact & technique

### Spacing Scale

| Name | Value | Token | Role |
|------|-------|-------|------|
| 4 | 4px | `--spacing-4` | Micro-gap entre étiquettes et badges |
| 8 | 8px | `--spacing-8` | Espacement interne minimal des capsules |
| 16 | 16px | `--spacing-16` | Padding standard des éléments compacts |
| 20 | 20px | `--spacing-20` | Marges des composants de grille |
| 28 | 28px | `--spacing-28` | Gouttière entre colonnes d'ingénierie |
| 32 | 32px | `--spacing-32` | Séparateurs de blocs logiques |
| 40 | 40px | `--spacing-40` | Espacement moyen entre titres et corps |
| 52 | 52px | `--spacing-52` | Décalage vertical des grilles bento |
| 80 | 80px | `--spacing-80` | Section gap standard |
| 96 | 96px | `--spacing-96` | Respiration des titres de sections |
| 168 | 168px | `--spacing-168` | Sas de transition entre l'ambiance claire et la salle de code |

### Border Radius

| Element | Value | Usage |
|---------|-------|-------|
| links / tags | 2px | Micro-badges télémétriques, puces de compétences |
| cards | 9px | Cartes de projets, panneaux de compétences |
| buttons | 28.8px | Capsules compactes d'action primaire et boutons de filtre |
| lenses | 9999px (full circle) | Vignettes de profil et lentilles d'observation circulaire |
| notched cuts | 45° chamfer (12px) | Cartes monolithiques de code et boîtiers de démonstration |

### Layout

- **Section gap:** 80px
- **Card padding:** 24px
- **Element gap:** 6px
- **Page container:** Pleine largeur décompressée (full-bleed responsive), avec paddings latéraux `px-4 sm:px-16`.

---

## Composants d'ingénierie & Signature visuelle

### 1. Pill Action Button
**Role:** Bouton d'action primaire et interaction décisive.  
- **Structure :** Capsule dense à bord arrondi de 28.8px (`rounded-full`), fond `#20272e` (Obsidian Ink) sur surface claire ou `#3f7694` (Alpine Steel) en accent, typographie Outfit 12px weight 500, padding 9px 17px.  
- **Effets :** Zéro ombre diffuse, zéro dégradé. Interaction `whileHover={{ scale: 1.03 }}` et `whileTap={{ scale: 0.97 }}` gérées via Framer-Motion.

### 2. Ghost Text Link
**Role:** Navigation d'en-tête et hyperliens inline.  
- **Structure :** Texte pur, sans fond ni bordure, couleur `#20272e` sur fond clair ou `#dfe5ed` sur fond sombre, Outfit 12–16px weight 500.  
- **Effets :** Soulignement net animé au survol via un trait sous-jacent Framer-Motion (`layoutId`), zéro transition CSS.

### 3. Circular Feature Vignette / Topographic Lens
**Role:** Focus personnel ou technologique (portrait de Maël, logo d'agent IA).  
- **Structure :** Découpe circulaire pure (diamètre ~200px à 500px), sans bordure ni ombre portée floue.  
- **Agencement :** Titre Syne (22–26px) au-dessus, trio d'indicateurs hexagonaux en dessous. Référence directe à une lentille d'instrument optique de haute montagne.

### 4. Notched Monolith Card
**Role:** Boîtier d'ingénierie et présentation technique d'un projet phare.  
- **Structure :** Carte géométrique noire/obsidienne (`#20272e`), chanfreins géométriques à 45° aux angles (coins entaillés de 12px), bordure hairline 1px `#3f7694`/30.  
- **Détail signature :** Micro-label télémétrique dans le coin inférieur gauche : `SYS.EXEC // SCROLL` en JetBrains Mono 9px blanc `#ffffff`.

### 5. Hero Wordmark
**Role:** Signature visuelle identitaire inoubliable.  
- **Structure :** Typographie Syne à 374px weight 700, couleur `#20272e`, tracking extrême à -3.37px, line-height 0.84.  
- **Positionnement :** Dépasse volontairement des marges gauche et droite de l'écran (intentionally cropped at viewport edges). L'ingénieur affirme sa stature : le nom et le titre sont plus grands que le cadre d'affichage.

### 6. Telemetry Stat Pair
**Role:** Affichage télémétrique des compétences et métriques de performance.  
- **Structure :** Paires de données côte à côte, séparées par un double slash ou un espacement fixe : `STACK: TYPESCRIPT // AGENTS: LEVEL 5` ou `TERRAIN: ALL-STACK // RELIABILITY: 99.9%`. JetBrains Mono 14–16px weight 500, couleur `#20272e` sur canevas clair ou `#3f7694` sur salle sombre.

### 7. Hexagonal Telemetry Indicator
**Role:** Indicateurs de pagination, nœuds de graphe et repères de section.  
- **Structure :** Petite silhouette hexagonale filaire (~12px), stroke 1.5px `#20272e` ou `#ffffff`, fond transparent. Disposés par groupes de 3 sous les lentilles circulaires et les titres de rubriques. Évoque la cristallisation minérale, les maillages réseau et l'équipement d'alpinisme.

### 8. Monogram Logo Mark
**Role:** Empreinte d'identité dans l'en-tête minimal.  
- **Structure :** Monogramme « M » ou « MG » inscrit dans un hexagone ou un cercle de 32px, trait filaire 1.5px `#20272e`, fond transparent. Épuré, sans fioriture décorative.

### 9. Section Header
**Role:** Titrage d'impact pour chaque module de contenu.  
- **Structure :** Syne 94px weight 700, centré, tracking -0.85px, line-height 0.84. Accompagné aux deux angles de micro-labels de positionnement en JetBrains Mono 11px uppercase (`SEC // 02 : PROJETS`).

### 10. Alpine Expedition Panel (Landing Hero Image)
**Role:** Immersion atmosphérique héroïque et ancrage personnel authentique.  
- **Asset immuable :** L'image `/hero.jpeg` (Maël en haute montagne).  
- **Traitement :** Plein écran bord à bord (full-bleed) sans bordure ni coins arrondis, sans filtre couleur dénaturant. Elle incarne la lucidité, la prise de hauteur ("futur ingénieur éclairé"), l'endurance et la capacité à naviguer en environnement extrême ou hostile.

---

## Règles strictes d'Animations & Effets au Scroll (Framer-Motion)

Conformément à la règle absolue du projet : **ZÉRO CSS PUR, ZÉRO ANIMATION CSS/TAILWIND, TOUJOURS FRAMER-MOTION.**

### 1. Composant Signature `Anm` (`Animator3000`)
Toute apparition à l'écran doit transiter par l'easing caractéristique du portfolio :
```typescript
transition: {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1], // Courbe exponentielle suisse : impulsion rapide, décélération ultra-feutrée
  delay: delay
}
```
- Translation verticale standard : `y: 40px → 0` combinée à `opacity: 0 → 1`.
- Échelle initiale pour les éléments héroïques ou circulaires : `scale: 0.95 → 1` ou `scale: 1.5 → 1` (pour l'image de fond).

### 2. Système de Scrub Dynamique au Défilement (`BackgroundScrubber`)
Le défilement orchestre une traversée en 3 actes sans rupture brutale mais par paliers francs :
1. **Acte I — Le Sommet (Hero) :** L'image `/hero.jpeg` apparaît nette en pleine page (`scale: 1.5 → 1` sous `Anm`).
2. **Acte II — Le Canevas Minéral (#content) :** Au scroll, un flou optique progressif (`blur(0px) → blur(30px)`) et un masque d'opacité s'activent pour révéler la surface minérale `--background: #dfe5ed`. Le profil et le manifeste de l'ingénieur émergent.
3. **Acte III — La Salle de Commande & Terminal (#code) :** En poursuivant la descente, l'opacité bascule sur `--foreground: #20272e`. Le visiteur plonge dans la salle technique sombre : démonstrations de physique interactive, bulles agentiques, grille bento des projets et timeline du parcours.

### 3. Physique Interactive & Bulles Agentiques (Matter.js + Framer-Motion)
- Les écosystèmes d'IA (Gemini, Claude, ChatGPT) sont modélisés sous forme de corps rigides circulaires en chute et collision réelles via Matter.js.
- Ils entrent en contact physique avec l'avatar de Maël, illustrant visuellement l'alliance entre le développeur humain d'élite et les agents autonomes.
- Apparition avec `scale: 0 → 1` et easing `[0.16, 1, 0.3, 1]`.

### 4. Micro-interactions Mécaniques de Précision
- **Boutons & Cartes :** `whileHover={{ scale: 1.02 }}` et `whileTap={{ scale: 0.98 }}`.
- **Grille de Projets (Bento) :** Chaque carte s'anime au viewport avec un décalage déterministe (`delay = (index % 3) * 0.1s`).
- **Aucune transition CSS** (`transition-*`, `duration-*`) n'est tolérée dans le code source.

---

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Slate Canvas | `#dfe5ed` | Fond par défaut des sections éditoriales claires et du hero |
| 1 | Mineral Slate Card | `#cfd7e3` | Cartes surélevées et conteneurs secondaires sur fond clair |
| 2 | Obsidian Ink Room | `#20272e` | Salle sombre immersive : modules de code, compétences, projets et parcours |
| 3 | Carbon Elevated Card | `#29323b` | Cartes de projets et tiroirs de compétences au sein de la salle sombre |

---

## Imagery & Direction Visuelle

1. **Photographie Alpine Réelle :**  
   L'image `/hero.jpeg` (Maël en haute montagne) est la pierre angulaire visuelle. Elle n'est pas un arrière-plan décoratif anodin : elle témoigne d'un goût du défi réel, d'une prise de hauteur intellectuelle et d'une rigueur tout-terrain. Traitement bord à bord, sans encadrement plastique.
2. **Lentilles Circulaires :**  
   Les portraits personnels et les focus technologiques utilisent une découpe circulaire pure (`rounded-full`), évoquant l'objectif télémétrique, la lunette d'observation ou le hublot pressurisé.
3. **Zéro Stock Photography :**  
   Aucune image d'agence générique, aucun faux mockup avec reflets 3D ou néons cyberpunk. Seuls le code réel, les architectures système, les projets authentiques et la montagne réelle sont admis.

---

## Do's and Don'ts

### Do
- Utiliser la typographie Syne à 94px+ pour les titres majeurs et jusqu'à 374px pour le wordmark signature avec un tracking négatif d'au moins -3px.
- Laisser le wordmark de 374px déborder naturellement des côtés gauche et droit du viewport pour créer un effet de gigantisme géologique.
- Alterner avec autorité entre le canevas clair Slate Canvas (`#dfe5ed`) et la chambre de code Obsidian Ink (`#20272e`).
- Respecter le rayon de 28.8px pour toutes les capsules boutons et le rayon de 9px pour les cartes standards (ou la découpe notched 45°).
- Rendre toutes les animations exclusivement via `framer-motion` et le composant `Anm` avec l'easing `[0.16, 1, 0.3, 1]`.
- Utiliser JetBrains Mono pour toutes les métriques chiffrées, coordonnées, tags de technologies et statuts d'ingénieur.
- Intégrer les hexagones filaires comme indicateurs de rythme ou de pagination discrète.

### Don't
- Ne jamais ajouter de dégradés multicolores, de reflets brillants ou d'ombres portées floues (`shadow-xl`, `box-shadow`) : le design est strictement plat, minéral et fondé sur le contraste de découpe.
- Ne jamais injecter de couleurs vives non prévues : la palette se restreint strictement aux 4 variables de `globals.css` (`#dfe5ed`, `#20272e`, `#3f7694`, `#43654f`) et leurs dérivés directs.
- Ne jamais animer avec des classes CSS Tailwind (`transition-all`, `animate-bounce`, `hover:scale-105`) : cela contrevient à la règle fondamentale du portfolio.
- Ne jamais remplacer la photo de montagne `/hero.jpeg` par une illustration abstraite ou un visuel commercial.
- Ne jamais descendre le corps de texte utilitaire Outfit sous 12px ni utiliser Syne pour de longs paragraphes de lecture.

---

## Typographic Philosophy

Le système utilise l'échelle et le resserrement typographique (tracking négatif) pour créer une intensité dramatique, et non des artifices de couleurs ou de fausses ombres. À 94px–374px, la typographie Syne est si serrée qu'elle agit comme un monolithe taillé au burin. Le texte utilitaire Outfit à 14–16px offre un repos de lecture parfait, tandis que JetBrains Mono injecte la rigueur mathématique du code et de l'ingénieur. Syne incarne la vision et la stature ; Outfit assure la clarté opérationnelle ; JetBrains Mono certifie la précision technique.

---

## Agent Prompt Guide

### Quick Color Reference
- Background (light canvas): `#dfe5ed` (`--background`)
- Background (dark code room): `#20272e` (`--foreground`)
- Card surface (light): `#cfd7e3`
- Card surface (dark): `#29323b`
- Primary engineering accent: `#3f7694` (`--primary`)
- Secondary organic/stability accent: `#43654f` (`--secondary`)
- Primary text on light: `#20272e`
- Primary text on dark: `#ffffff`
- Muted telemetry text: `#5d6b79`

### Example Component Prompts

1. **Hero Wordmark Section :**  
   Fond plein écran `#dfe5ed` ou transition dynamique depuis `/hero.jpeg`. En haut à gauche : monogramme hexagonal `M` en stroke 1.5px `#20272e`. En haut à droite : lien texte discret `CONTACT // DISPO` en JetBrains Mono 12px. Centre : sous-titre `INGÉNIEUR INFORMATIQUE ÉCLAIRÉ` en Syne 52px weight 700 letter-spacing -0.47px. Ligne de télémétrie : `SYS: ALL-TERRAIN // AI-NATIVE` en JetBrains Mono 14px. Bouton pill capsule noir `#20272e`, texte `#ffffff`, 9px 17px padding, radius 28.8px, `EXPLORER LES TRAVAUX`. En base : wordmark monumental `GARNIER` ou `INGÉNIEUR` à 374px Syne 700 letter-spacing -3.37px, rogné aux extrémités de l'écran.

2. **Dark Code Chamber Header :**  
   Fond pleine largeur `#20272e`. Titre centré `CE QUE JE MAÎTRISE` en Syne 94px weight 700, texte `#ffffff`, letter-spacing -0.85px. Au-dessus : microlabel `SEC // 02 — ARCHITECTURE & COMPÉTENCES` en JetBrains Mono 11px couleur `#3f7694`. Grille bento en dessous avec cartes en `#29323b`, bordure hairline 1px `#3f7694`/20, coins 9px.

3. **Notched Monolith Project Showcase :**  
   Carte carrée d'ingénierie ~400px sur fond `#20272e` avec découpes chanfreinées aux 4 angles. Bordure 1px `#3f7694`. Dans le coin inférieur gauche : `SYS.EXEC // 01` en JetBrains Mono 9px blanc. Au centre : capture d'écran nette du projet ou schéma d'architecture.

4. **Telemetry Stat Pair :**  
   Ligne horizontale sur fond `#dfe5ed`. Deux paires de données : `STACK: TYPESCRIPT // AGENTS: AUTONOMOUS` et `PROD: 100% RELIABILITY` en JetBrains Mono 14px weight 500, texte `#20272e`, séparées par 32px de vide. Zéro bordure, zéro fioriture.

---

## Quick Start Configuration

### CSS Custom Properties (`app/globals.css`)

```css
:root {
  /* Couleurs fondamentales */
  --background: #dfe5ed;
  --foreground: #20272e;
  --primary: #3f7694;
  --secondary: #43654f;

  /* Surfaces & déclinaisons coordonnées */
  --slate-card: #cfd7e3;
  --carbon-surface: #29323b;
  --hairline: #9aaaba;
  --muted-rock: #5d6b79;
  --summit-white: #ffffff;

  /* Typographie */
  --font-syne: 'Syne', sans-serif;
  --font-outfit: 'Outfit', sans-serif;
  --font-jetbrains: 'JetBrains Mono', monospace;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-28: 28px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-52: 52px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-168: 168px;

  /* Radii */
  --radius-sm: 2px;
  --radius-cards: 9px;
  --radius-buttons: 28.8px;
}
```

### Tailwind v4 Theme Configuration

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);

  --color-slate-card: #cfd7e3;
  --color-carbon-surface: #29323b;
  --color-hairline: #9aaaba;
  --color-muted-rock: #5d6b79;
  --color-summit-white: #ffffff;

  --font-syne: var(--font-syne);
  --font-outfit: var(--font-outfit);
  --font-jetbrains: var(--font-jetbrains);

  --radius-cards: 9px;
  --radius-buttons: 28.8px;
}
```
