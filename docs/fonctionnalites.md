# Fonctionnalités

Page unique `/{lang}`, composée de sections (textes issus de `app/dictionnaires/*.json`).

| Section | Id | Contenu |
|---|---|---|
| Intro | `#intro` | Titre d'accroche et description (`ui.hero`), plein écran |
| Moi | `#content` | Photo de profil, titre et description (`ui.moi`), bulles animées interactives |
| Développement | | Texte `dev` et compétences par catégorie : web, programmation, bdd, déploiement |
| Projets | | Grille « bento » de cartes `ProjectComp` (`projets.liste`) |
| Parcours | `#code` | Timeline chronologique (`parcours.liste`) |

## Animations (framer-motion)
- Apparitions échelonnées au scroll via `Anm` (easing `[0.16, 1, 0.3, 1]`).
- Fond dynamique piloté par le scroll (`DynamicBackground`).
- Compétences en défilement automatique continu.
- Timeline : ligne qui se remplit selon le scroll (`useScroll` + `useSpring`).

## Données
- Compétence : `nom`, `chemin_logo` (dans `public/illustrations/`), `maitrise` (étoiles), `nombre_projets`.
- Projet : `nom`, `description`, `dateDebut`, `dateFin`, `competences`, `images`.
- Parcours : `nom`, `lieu`, `description`, `dateDebut`, `dateFin`.

## À venir / incomplet
- Navigation (`NavBar` vide).
- Vrais projets et parcours (contenus placeholder actuellement, le même projet est répété dans la grille).
