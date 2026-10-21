import "server-only";
import { sql } from "@/app/lib/db";
import { LOCALES, Locale } from "@/app/lib/langues";
import { urlMedia } from "@/app/lib/media";
import { ProjetAdmin, ProjetSaisie, TailleProjet, TraductionProjet } from "@/app/modeles/Projet";

interface LigneProjetAdmin {
    id: string;
    date_debut: string;
    date_fin: string | null;
    taille: TailleProjet;
    couleur: string;
    ordre: number;
}

/** Accès complet aux projets, toutes langues confondues (réservé à l'administration). */
export class ProjetService {
    static async listerAdmin(): Promise<ProjetAdmin[]> {
        const [projets, traductions, liens, images] = (await sql.transaction([
            sql`SELECT id, date_debut::text AS date_debut, date_fin::text AS date_fin, taille, couleur, ordre
                FROM projet ORDER BY ordre, date_debut DESC`,
            sql`SELECT projet_id, lang, nom, description FROM projet_traduction`,
            sql`SELECT projet_id, competence_id FROM projet_competence`,
            sql`SELECT projet_id, chemin FROM projet_image ORDER BY ordre`,
        ])) as [
            LigneProjetAdmin[],
            { projet_id: string; lang: Locale; nom: string; description: string }[],
            { projet_id: string; competence_id: string }[],
            { projet_id: string; chemin: string }[],
        ];

        return projets.map((p) => {
            const traductionsProjet = Object.fromEntries(
                LOCALES.map((lang) => {
                    const t = traductions.find((x) => x.projet_id === p.id && x.lang === lang);
                    return [lang, { nom: t?.nom ?? "", description: t?.description ?? "" }];
                }),
            ) as Record<Locale, TraductionProjet>;
            return {
                id: p.id,
                dateDebut: p.date_debut,
                dateFin: p.date_fin,
                taille: p.taille,
                couleur: p.couleur,
                ordre: p.ordre,
                competenceIds: liens.filter((l) => l.projet_id === p.id).map((l) => l.competence_id),
                images: images.filter((i) => i.projet_id === p.id).map((i) => ({ chemin: i.chemin, url: urlMedia(i.chemin) })),
                traductions: traductionsProjet,
            };
        });
    }

    static async imagesDe(id: string): Promise<string[] | null> {
        const [projet, images] = (await sql.transaction([
            sql`SELECT 1 FROM projet WHERE id = ${id}`,
            sql`SELECT chemin FROM projet_image WHERE projet_id = ${id}`,
        ])) as [unknown[], { chemin: string }[]];
        return projet.length > 0 ? images.map((i) => i.chemin) : null;
    }

    /** Écrit le projet (création ou mise à jour) de façon atomique : une seule transaction. */
    static async enregistrer(id: string, saisie: ProjetSaisie, nouvellesImages: string[], creation: boolean): Promise<void> {
        const langues = LOCALES.filter((lang) => saisie.traductions[lang]?.nom?.trim());
        const images = [...saisie.imagesConservees, ...nouvellesImages];

        const requetes = [
            creation
                ? sql`INSERT INTO projet (id, date_debut, date_fin, taille, couleur, ordre)
                      VALUES (${id}, ${saisie.dateDebut}, ${saisie.dateFin}, ${saisie.taille}, ${saisie.couleur}, ${saisie.ordre})`
                : sql`UPDATE projet
                      SET date_debut = ${saisie.dateDebut}, date_fin = ${saisie.dateFin}, taille = ${saisie.taille},
                          couleur = ${saisie.couleur}, ordre = ${saisie.ordre}, updated_at = now()
                      WHERE id = ${id}`,
            ...langues.map((lang) => {
                const t = saisie.traductions[lang]!;
                return sql`INSERT INTO projet_traduction (projet_id, lang, nom, description)
                           VALUES (${id}, ${lang}, ${t.nom}, ${t.description})
                           ON CONFLICT (projet_id, lang) DO UPDATE SET nom = EXCLUDED.nom, description = EXCLUDED.description`;
            }),
            sql`DELETE FROM projet_traduction WHERE projet_id = ${id} AND NOT (lang = ANY(${langues}::text[]))`,
            sql`DELETE FROM projet_competence WHERE projet_id = ${id}`,
            sql`INSERT INTO projet_competence (projet_id, competence_id)
                SELECT ${id}, unnest(${saisie.competenceIds}::uuid[]) ON CONFLICT DO NOTHING`,
            sql`DELETE FROM projet_image WHERE projet_id = ${id} AND NOT (chemin = ANY(${saisie.imagesConservees}::text[]))`,
            sql`INSERT INTO projet_image (projet_id, chemin, ordre)
                SELECT ${id}, unnest(${nouvellesImages}::text[]), 0`,
            sql`UPDATE projet_image SET ordre = u.ordre - 1
                FROM unnest(${images}::text[]) WITH ORDINALITY AS u(chemin, ordre)
                WHERE projet_image.projet_id = ${id} AND projet_image.chemin = u.chemin`,
        ];
        await sql.transaction(requetes);
    }

    /** Supprime le projet (cascade) et retourne ses images (à supprimer du Blob). */
    static async supprimer(id: string): Promise<string[]> {
        const [images] = (await sql.transaction([
            sql`SELECT chemin FROM projet_image WHERE projet_id = ${id}`,
            sql`DELETE FROM projet WHERE id = ${id}`,
        ])) as [{ chemin: string }[], unknown];
        return images.map((i) => i.chemin);
    }
}
