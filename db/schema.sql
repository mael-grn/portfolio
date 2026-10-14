-- Schéma du portfolio (Neon / PostgreSQL). Idempotent : peut être rejoué sans risque.
-- Les images sont stockées dans un Blob PRIVÉ : on ne garde en base que le chemin (pathname) du blob,
-- servi ensuite par la route /medias/[...chemin].
-- Appliquer avec : pnpm db:migrate

CREATE TABLE IF NOT EXISTS competence (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         text        NOT NULL CHECK (char_length(nom) BETWEEN 1 AND 80),
    categorie   text        NOT NULL CHECK (categorie IN ('programmation', 'web', 'bdd', 'deploiement', 'equipe')),
    logo_chemin text        CHECK (logo_chemin IS NULL OR char_length(logo_chemin) <= 300),
    maitrise    smallint    NOT NULL DEFAULT 3 CHECK (maitrise BETWEEN 0 AND 5),
    ordre       integer     NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competence_categorie_ordre_idx ON competence (categorie, ordre);

CREATE TABLE IF NOT EXISTS projet (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date_debut  date        NOT NULL,
    date_fin    date,
    taille      smallint    NOT NULL DEFAULT 1 CHECK (taille BETWEEN 1 AND 4),
    couleur     text        NOT NULL DEFAULT '#2A5269' CHECK (couleur ~ '^#[0-9a-fA-F]{6}$'),
    ordre       integer     NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

CREATE INDEX IF NOT EXISTS projet_ordre_idx ON projet (ordre, date_debut DESC);

CREATE TABLE IF NOT EXISTS projet_traduction (
    projet_id   uuid NOT NULL REFERENCES projet (id) ON DELETE CASCADE,
    lang        text NOT NULL CHECK (lang ~ '^[a-z]{2}$'),
    nom         text NOT NULL CHECK (char_length(nom) BETWEEN 1 AND 120),
    description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
    PRIMARY KEY (projet_id, lang)
);

CREATE TABLE IF NOT EXISTS projet_competence (
    projet_id      uuid NOT NULL REFERENCES projet (id) ON DELETE CASCADE,
    competence_id  uuid NOT NULL REFERENCES competence (id) ON DELETE CASCADE,
    PRIMARY KEY (projet_id, competence_id)
);

CREATE INDEX IF NOT EXISTS projet_competence_competence_idx ON projet_competence (competence_id);

CREATE TABLE IF NOT EXISTS projet_image (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    projet_id   uuid    NOT NULL REFERENCES projet (id) ON DELETE CASCADE,
    chemin      text    NOT NULL CHECK (char_length(chemin) <= 300),
    ordre       integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS projet_image_projet_idx ON projet_image (projet_id, ordre);

CREATE TABLE IF NOT EXISTS experience (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date_debut  date        NOT NULL,
    date_fin    date,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

CREATE INDEX IF NOT EXISTS experience_date_debut_idx ON experience (date_debut);

CREATE TABLE IF NOT EXISTS experience_traduction (
    experience_id uuid NOT NULL REFERENCES experience (id) ON DELETE CASCADE,
    lang          text NOT NULL CHECK (lang ~ '^[a-z]{2}$'),
    nom           text NOT NULL CHECK (char_length(nom) BETWEEN 1 AND 160),
    lieu          text NOT NULL DEFAULT '' CHECK (char_length(lieu) <= 160),
    description   text NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
    PRIMARY KEY (experience_id, lang)
);

CREATE TABLE IF NOT EXISTS authorized (
    id          text PRIMARY KEY,
    nom         text,
    created_at  timestamptz NOT NULL DEFAULT now()
);
