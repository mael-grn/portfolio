# Fonctionnalités

## 1. Landing Page publique (`/{lang}`)

Accessible en `/fr` et `/en` (redirection automatique depuis `/`).

| Section | Identifiant | Description & Source des données |
|---|---|---|
| **Hero Monumental & Scrollytelling** | `#intro` | Panorama de haute montagne `hero.jpeg`, titre apparaissant mot par mot avec fondu de flou au centre puis décalé en bas à gauche. Au scroll, zoom avant cinématique orienté vers la silhouette de Maël (à droite) et estompement brumeux du paysage. |
| **Profil & Présentation** | `#moi` | Apparition de la photo à l'extrême droite en grandissant depuis une échelle miniature, glissement complet jusqu'à son ancrage à gauche, et dévoilement du texte au fur et à mesure après le passage de la photo (`dict.ui.moi`). |
| **Vision & Développement Agentique** | `#vision` | Réduction totale de la photo de profil vers zéro et éclosion continue des 5 bulles d'IA (logos Claude, Gemini, Mistral, ChatGPT, DeepSeek purs et totalement arrondis, chargés dynamiquement depuis la BDD Neon via la catégorie `agentique`) disposées en constellation pentagonale aérée à gauche, pendant que le texte à droite vit une transition éditoriale cinématographique. Au scroll vers le bas ($p \ge 0.66$), les bulles temporisent dans leur flottaison pendant que le Globe 3D fait son apparition animée en bas à droite, puis s'envolent majestueusement à vitesse ralentie une à une vers leurs coordonnées réelles sur le Globe 3D où elles s'ancrent sans couture. |
| **Matrice de Compétences** | `#competences` | Layout épuré sans badge ni filet : zone gauche libre (en attente), et à droite gros Globe 3D resserré apparaissant plus tôt avec animation cinématique alpine (bloom d'échelle, rotation tridimensionnelle et défloutage optique), regroupant les icônes pures de chaque compétence (dont les compétences `agentique`), rotatif en grab/drag avec direction directe naturelle, inertie physique et clic (`dict.competences`). |
| **Monolithes & Projets** | `#projets` | Scène cinématique unifiée au scroll avec ralentissement et plateau de lecture : grand titre "Ce que j'ai fait" avec éclosion mot-à-mot (même gabarit que Compétences), grand encadré couleur primaire (`#3f7694`) pour le dernier projet par date avec détails à gauche et carrousel photos animé moderne à droite (transitions, swipe, pagination, pause au survol), et bandeau inférieur horizontal de cartes secondaires couleur secondaire (`#43654f`) avec effet d'écrasement cinétique aux extrémités gauches et droites (`dict.projets`). |
| **Chronologie & Parcours** | `#parcours` | Timeline éditoriale sur axe Hairline (#c2ccd6), cartes de jalons précises avec dates (`dict.parcours`). |
| **Pied de Page** | | Bandeau sombre compact (#20272e), monogramme MG, liens sociaux et contact. |

### Animations & Charte Graphique
Le design et l'identité visuelle sont régis par [`DESIGN.md`](../DESIGN.md) (*Brutalist editorial showroom on cool slate canvas*).
Toutes les animations sont pilotées exclusivement par **framer-motion** et **matter-js** (zéro animation/transition CSS) :
- Easing caractéristique `[0.16, 1, 0.3, 1]` via le composant `Anm` (`Animator3000`).
- Séquence de scrollytelling cinématique unifiée en 3 Actes (`HeroAboutScrolly`) : zoom caméra, glissement de la photo avec masque cinétique sans coupure résiduelle, réduction totale de la photo, éclosion soignée des 5 logos d'IA en constellation pentagonale spacieuse sur place à gauche, et métamorphose textuelle typographique avancée (cascade mot par mot avec défloutage optique, tracking étiré et élévation de la description).
- Contrôle de défilement cinétique étiré et finalisation automatique posée des transitions (durée cinématographique équilibrée de $1{,}2\text{s}$ à $1{,}6\text{s}$ avec courbe cubique in-out sans secousse) : états de repos stables pour chaque acte (Hero, À propos à $p = 0.34$, Vision à $p = 0.60$ avec icônes en cercle à gauche et texte à droite, Globe à $p = 1.0$).
- Composant unifié pour les agents IA (`AgentUnifiedFlight`) : zéro swap d'icônes, éclosion en cercle à gauche avec flottaison harmonique dans la Vision ($p \in [0.36, 0.66]$), puis temps d'attente initial et envolée étalée en procession vers les 5 places dédiées du Globe 3D ($p \ge 0.66$), avec achèvement complet garanti et transfert sans couture vers la sphère 3D avant $s = 0.85$ (disparition totale de la couche d'animation `fixed z-30`).
- Globe 3D interactif de compétences (`CompetencesGlobe3D` & `CompetencesSection`) : apparition précoce au défilement avec bloom d'échelle doux et net sans distorsion angulaire, agencement sphérique de Fibonacci doré resserré pour les icônes pures de chaque compétence (sans fond, sans bordure, sans corner radius), 5 places dédiées réservées sur la face avant visible pour les agents IA (`indices 7, 10, 15, 18, 28`), intégration 3D native dans la pile de profondeur (les logos IA passent naturellement derrière et devant les compétences traditionnelles selon l'axe Z et le `zIndex` orbital), auto-rotation continue 60-120 FPS, manipulation directe haut/bas au drag avec inertie fluide, échelle de perspective avec occultation arrière et détection de clic.
- Navigation "Zoom Lens" en angle supérieur droit façon getartcraft.com avec défilement de traits optiques, réglette de focalisation, adaptation chromatique dynamique (sombre/clair) sur fond 100% transparent (aucun flou ni opacité résiduelle).
- Interactions mécaniques de précision : `whileHover={{ y: -2 }}` et `whileTap={{ scale: 0.98 }}`.
- Flat design absolu : zéro ombre diffuse (`shadow-*`), zéro dégradé flou, surfaces planes découpées avec des border-radius amples (24px-64px).

---

## 2. Espace d'administration (`/admin`) — Dashboard d'Administration

Interface d'administration complète avec tableau de bord (Dashboard), tuiles métriques interactives (3D tilt physique et grossissement au survol), barre de navigation à flou progressif non-linéaire (Progressive Blur exponentiel), journal en direct des dernières modifications de la base de données (entité, action, nom de la cible, auteur et horodatage), navigation par capsules pill coulissantes, et formulaires modulaires.

### A. Journal des modifications de la base de données
- Traçage automatique à chaque création, modification ou suppression d'une compétence, d'un projet ou d'un jalon d'expérience.
- Enregistrement de l'identifiant et du nom de l'administrateur authentifié (`authorized`).
- Affichage chronologique sur le dashboard via le composant unifié `TableauAdmin` aux teintes claires avec micro-animations Framer Motion `layout`.

### B. Gestion des compétences (`/admin/competences`)
- Affichage sous forme de tableau classique épuré via `TableauAdmin` (en-tête clair, tri par nom, catégorie, maîtrise, ordre, projets liés, et filtre par catégorie).
- Bouton de création tout rond avec `+` utilisant `BoutonAdmin` (couleurs `#2b455b` -> `#385c7a`, physique 3D tilt élastique calquées sur les tuiles, et indicateur de chargement rotatif 100% Framer Motion remplaçant l'icône pendant les soumissions asynchrones).
- Création et modification via menu latéral coulissant (`TiroirAdmin`) flottant à droite avec coins totalement arrondis (`rounded-[32px]`), marges périphériques et ressort Framer Motion haute fidélité. Titre intégré directement dans le contenu défilant (pas de bandeau fixe). Formulaire 100% vertical sans éléments côte à côte, avec composants personnalisés animés (`ChampSaisie`, `ChampSelection`, `ChampImage`). Fermeture par le bouton « Annuler » fixé dans la barre d'actions en bas.
- Téléversement direct et réactif du logo via `ChampImage` : import immédiat dès sélection (parcours ou glisser-déposer), prévisualisation locale instantanée avec opacité réduite et loader rotatif Framer Motion superposé. Désactivation automatique du bouton d'action (Ajouter/Modifier) pendant l'importation. Affichage du nom et de l'aperçu une fois importé, avertissement rouge en cas de divergence avec la référence enregistrée en base. À l'enregistrement, mise à jour atomique de la référence en base Neon et suppression automatique de l'ancienne image du Blob. Suppression de l'ancienne case à cocher de suppression.
- Suppression sécurisée directe par double clic (« Supprimer » -> « Confirmer » avec réinitialisation automatique en l'absence de confirmation).

### C. Gestion des projets (`/admin/projets`)
- Affichage sous forme de tableau classique épuré via `TableauAdmin` (en-tête clair, tri par titre, période, gabarit, images, ordre).
- Création et modification via menu latéral flottant `TiroirAdmin` avec formulaire 100% vertical et composants animés (`ChampSaisie`, `ChampSelection`, `ChampZoneTexte`) et barre d'actions fixe en bas (bouton « Annuler »).
- Saisie des métadonnées générales : date de début, date de fin, ordre d'affichage (position dans la liste), taille bento, couleur d'ingénierie gérée de manière transparente, traductions multilingues et association de compétences.
- Galerie d'images réordonnable (`GalerieImagesReordonnable`) : réorganisation intuitive par glisser-déposer (drag-and-drop fluide avec `Reorder.Group` et `Reorder.Item` Framer Motion), badge d'ordre dynamique (`#1`, `#2`...), suppression unitaire via une petite croix en haut à droite apparaissant uniquement au survol de la carte, téléversement direct immédiat avec prévisualisation et loader rotatif en superposition, désactivation du bouton d'action pendant les imports, et purge automatique des fichiers retirés du Blob à l'enregistrement.

### D. Gestion des expériences (`/admin/experiences`)
- Affichage sous forme de tableau classique épuré via `TableauAdmin` (en-tête clair, tri par poste, entreprise, période).
- Création et modification via menu latéral flottant `TiroirAdmin` avec formulaire 100% vertical et composants animés (`ChampSaisie`, `ChampZoneTexte`) et barre d'actions fixe en bas (bouton « Annuler »).
- Période et édition multilingue (intitulé du poste, entreprise, description des réalisations).

### E. Gestion du parcours académique (`/admin/parcours`)
- Affichage sous forme de tableau classique épuré via `TableauAdmin` (en-tête clair, tri par diplôme, établissement, période).
- Création et modification via menu latéral flottant `TiroirAdmin` avec formulaire 100% vertical et composants animés (`ChampSaisie`, `ChampZoneTexte`) et barre d'actions fixe en bas (bouton « Annuler »).
- Période et édition multilingue (diplôme, établissement d'enseignement, description du parcours et spécialités).

### F. Sécurité & Système de connexion globale (`account.maelg.fr`)
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
