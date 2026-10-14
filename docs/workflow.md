# Workflow de développement

## Commandes
`npm run dev`, `npm run build`, `npm run lint`. Lint et build doivent passer avant de pousser.

## Branches
- Développement directement sur `develop`, sans PR : `git push origin develop`.
- `main` ne reçoit que des releases, faites sur demande explicite.

## Release
1. `develop` propre, `docs/` à jour, lint et build OK.
2. `git checkout main && git pull origin main`
3. `git merge develop`
4. `git push origin main`
5. `git checkout develop`

## Règles de code
Tailwind uniquement (pas de CSS pur), animations framer-motion uniquement, textes dans les dictionnaires fr et en. Détail dans `CLAUDE.md`.
