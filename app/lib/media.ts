// Les images sont dans un Blob PRIVÉ : la base ne stocke que le chemin (pathname),
// servi publiquement et mis en cache par la route /medias/[...chemin].

export const DOSSIERS_MEDIA = ["competences", "projets"] as const;
export type DossierMedia = (typeof DOSSIERS_MEDIA)[number];

/** Chemin valide : `dossier/nom-fichier.ext`, caractères sûrs uniquement, aucune remontée de répertoire. */
export const CHEMIN_MEDIA_REGEX = /^(competences|projets)\/[a-zA-Z0-9][a-zA-Z0-9._-]{0,150}\.(png|jpe?g|webp|gif|svg)$/;

export function estCheminMedia(valeur: string): boolean {
    return CHEMIN_MEDIA_REGEX.test(valeur);
}

export function urlMedia(chemin: string): string {
    return `/medias/${chemin}`;
}

export function estSvg(chemin: string): boolean {
    return chemin.toLowerCase().endsWith(".svg");
}
