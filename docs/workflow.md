# Workflow de développement

## 1. Commandes courantes

Le projet utilise **pnpm** comme gestionnaire de paquets de référence :

```bash
# Lancer le serveur de développement local
pnpm dev

# Compiler pour la production (TypeScript + Turbopack)
pnpm build

# Valider le code avec ESLint
pnpm lint

# Appliquer le schéma relationnel sur la base Neon
pnpm db:migrate

# Initialiser la base et téléverser les données de départ dans le Blob
pnpm db:seed

# Gérer les utilisateurs autorisés à administrer (table authorized)
pnpm db:authorize list
pnpm db:authorize add <id> [nom]
pnpm db:authorize remove <id>
```

Les commandes `pnpm lint` et `pnpm build` ne sont pas à lancer à chaque micro-modification : elles doivent être exécutées après de grosses modifications (refactorings d'envergure, nouveaux composants complexes, modification de schéma ou de logique métier), ou après une série de nombreuses petites modifications successives sans vérification (et obligatoirement avant toute release sur `main`).

## 2. Gestion des branches Git

- **Branche de travail direct : `develop`** :
  - Tout le développement s'effectue directement sur `develop`.
  - Pas de branches de fonctionnalités annexes, **pas de Pull Request**.
  - Pousser directement sur `develop` : `git push origin develop`.
- **Branche de production : `main`** :
  - Reçoit uniquement les versions stables (releases) validées par Maël.
  - Ne jamais committer ni pousser directement sur `main` en dehors du processus de release.

## 3. Processus de Release sur `main`

Effectué **uniquement** sur demande explicite de Maël :

1. S'assurer que `develop` est propre (`git status`), que la documentation dans `docs/` est à jour, et que `pnpm lint` et `pnpm build` réussissent.
2. Basculer sur `main` et récupérer la dernière version :
   ```bash
   git checkout main && git pull origin main
   ```
3. Fusionner `develop` dans `main` (sans PR) :
   ```bash
   git merge develop
   ```
4. Pousser `main` vers le dépôt distant :
   ```bash
   git push origin main
   ```
5. Revenir immédiatement sur `develop` pour poursuivre les travaux :
   ```bash
   git checkout develop
   ```

## 4. Règles de qualité et de style

- **Pas de CSS pur** : styliser uniquement via Tailwind CSS v4.
- **Pas d'animations en CSS ou Tailwind** : toutes les animations utilisent `framer-motion`.
- **Typage strict** : TypeScript en mode strict, schémas de validation Zod, zéro `any`.
- **Documentation continue** : toute modification du code est documentée dans `docs/` dans le même commit.
- Pour plus de détails, se référer au guide complet dans `GEMINI.md`.
