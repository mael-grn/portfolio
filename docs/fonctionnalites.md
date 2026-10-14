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

### D. Sécurité & Système de connexion globale (`account.maelg.fr`)
- **Authentification centralisée** : connexion via la plateforme `https://account.maelg.fr/login`.
- **Validation cryptographique** : contrôle du JWT signé avec `JWT_SECRET` via `TokenUtil` et la bibliothèque `jose`.
- **Autorisation relationnelle** : vérification en base Neon que l'identifiant extrait du token est enregistré dans la table `authorized` (`SELECT id FROM authorized WHERE id = ${id}`).
- **Gestion des accès** :
  - Pas de token ou token invalide : redirection vers `account.maelg.fr` avec conservation de l'URL cible (`redirect=...`).
  - Token valide mais ID non autorisé en base : redirection vers la page dédiée `/no`.
  - Commande CLI pour gérer les administrateurs : `pnpm db:authorize list|add|remove`.
- **Défense en profondeur** :
  - Filtrage réseau au niveau de `proxy.ts`.
  - Double vérification côté serveur dans `app/lib/admin-auth.ts` (`assertAdmin`, `exigerAdmin`) pour bloquer tout appel direct aux Server Actions.
- **Protection des en-têtes** :
  - Routes `/admin` exclues des robots (`X-Robots-Tag: noindex, nofollow, noarchive`).
  - Cache navigateur désactivé (`Cache-Control: no-store`).
