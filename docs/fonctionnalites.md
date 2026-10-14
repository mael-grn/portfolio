# Fonctionnalités

## 1. Landing Page publique (`/{lang}`)

Accessible en `/fr` et `/en` (redirection automatique depuis `/`).

| Section | Identifiant | Description & Source des données |
|---|---|---|
| **Intro** | `#intro` | Titre d'accroche et présentation générale (`dict.ui.hero`), plein écran. |
| **Moi** | `#content` | Photo de profil, texte de positionnement (`dict.ui.moi`), bulles interactives (`BubbleAnimaned`). |
| **Développement** | | Texte sur l'ingénierie moderne / agentique (`dict.dev`). |
| **Compétences** | `#code` | Catégories défilantes automatiquement (`Competences`) : Programmation, Web, Bases de données, Déploiement, Travail d'équipe. Données issues de la table `competence` de Neon. |
| **Projets** | `#code` | Grille bento adaptative (`ProjectComp`) selon la taille de chaque projet (1 à 4). Données issues de la table `projet` avec compétences associées et images stockées sur Vercel Blob. |
| **Parcours** | `#code` | Timeline chronologique progressive liée au défilement (`TimeLine`). Données issues de la table `experience` de Neon. |

### Animations
Toutes les animations sont pilotées par **framer-motion** :
- Révélation d'éléments avec le composant `Anm` (`Animator3000`) et son easing `[0.16, 1, 0.3, 1]`.
- Fond dynamique asservi à la position de défilement (`DynamicBackground`).
- Défilement continu horizontal des logos de compétences (`Competences`).
- Ligne verticale de la timeline qui s'étire en fonction du scroll (`useScroll` + `useSpring`).
- Physique interactive des bulles avec matter-js (`BubbleAnimaned`).

---

## 2. Espace d'administration (`/admin`)

Interface d'administration complète permettant de créer, modifier et supprimer les contenus du portfolio sans toucher au code ni aux fichiers JSON.

### A. Gestion des compétences (`/admin/competences`)
- Ajout et modification avec saisie du nom, de la catégorie (`programmation`, `web`, `bdd`, `deploiement`, `equipe`), de la maîtrise (étoiles 0 à 5), et de l'ordre d'affichage.
- Téléversement direct du logo (PNG, JPEG, WebP, GIF, SVG) vers le Blob privé.
- Remplacement du logo ou suppression du logo existant.
- Suppression de la compétence avec confirmation en deux temps, alerte si la compétence est liée à des projets, et nettoyage automatique du logo orphelin sur le Blob.

### B. Gestion des projets (`/admin/projets`)
- Saisie des métadonnées générales : date de début, date de fin (ou en cours), ordre d'affichage, taille de la carte bento (1 = carré, 2 = vertical, 3 = horizontal, 4 = grand), couleur hexadécimale.
- Édition multilingue : titre et description en français (obligatoire) et en anglais (optionnel avec repli).
- Association de compétences : sélection par cases à cocher parmi les compétences existantes en base.
- Galerie d'images :
  - Téléversement multiple de nouvelles images vers le Blob privé.
  - Réordonnancement des images existantes (boutons fléchés gauche/droite).
  - Suppression unitaire d'images.
- Suppression complète du projet (cascade sur traductions, liens et images Blob associées).

### C. Gestion des expériences (`/admin/experiences`)
- Période : date de début et date de fin (ou en cours).
- Édition multilingue : intitulé, lieu/organisme, et description en français et en anglais.
- Suppression avec confirmation sécurisée.

### D. Sécurité & Performance de l'admin
- Les routes `/admin` sont exclues des moteurs de recherche (`X-Robots-Tag: noindex, nofollow, noarchive`).
- Le cache navigateur est désactivé (`Cache-Control: no-store`).
- Point unique d'authentification (`app/lib/admin-auth.ts`) rejetant les accès en production tant que le système d'authentification n'est pas déployé.
- Server Actions validées par Zod et protégées contre les attaques CSRF par les mécanismes natifs de Next.js.
