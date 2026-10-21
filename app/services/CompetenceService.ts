import "server-only";
import { sql } from "@/app/lib/db";
import { urlMedia } from "@/app/lib/media";
import { CategorieCompetence, CompetenceAdmin, CompetenceSaisie } from "@/app/modeles/Competence";

interface LigneCompetenceAdmin {
    id: string;
    nom: string;
    categorie: CategorieCompetence;
    logo_chemin: string | null;
    maitrise: number;
    ordre: number;
    nombre_projets: number;
}

/** Accès en écriture/lecture complète des compétences (réservé à l'administration). */
export class CompetenceService {
    static async listerAdmin(): Promise<CompetenceAdmin[]> {
        const lignes = (await sql`
            SELECT c.id, c.nom, c.categorie, c.logo_chemin, c.maitrise, c.ordre,
                   (SELECT count(*)::int FROM projet_competence pc WHERE pc.competence_id = c.id) AS nombre_projets
            FROM competence c
            ORDER BY c.categorie, c.ordre, c.nom`) as LigneCompetenceAdmin[];
        return lignes.map((c) => ({
            id: c.id,
            nom: c.nom,
            categorie: c.categorie,
            logoChemin: c.logo_chemin,
            logoUrl: c.logo_chemin ? urlMedia(c.logo_chemin) : null,
            maitrise: c.maitrise,
            ordre: c.ordre,
            nombreProjets: c.nombre_projets,
        }));
    }

    static async recupererLogo(id: string): Promise<{ logoChemin: string | null } | null> {
        const lignes = (await sql`SELECT logo_chemin FROM competence WHERE id = ${id}`) as { logo_chemin: string | null }[];
        return lignes[0] ? { logoChemin: lignes[0].logo_chemin } : null;
    }

    static async creer(saisie: CompetenceSaisie, logoChemin: string | null): Promise<void> {
        await sql`
            INSERT INTO competence (nom, categorie, logo_chemin, maitrise, ordre)
            VALUES (${saisie.nom}, ${saisie.categorie}, ${logoChemin}, ${saisie.maitrise}, ${saisie.ordre})`;
    }

    static async modifier(id: string, saisie: CompetenceSaisie, logoChemin: string | null): Promise<void> {
        await sql`
            UPDATE competence
            SET nom = ${saisie.nom}, categorie = ${saisie.categorie}, logo_chemin = ${logoChemin},
                maitrise = ${saisie.maitrise}, ordre = ${saisie.ordre}, updated_at = now()
            WHERE id = ${id}`;
    }

    /** Supprime la compétence et retourne le chemin de son logo (à supprimer du Blob). */
    static async supprimer(id: string): Promise<string | null> {
        const lignes = (await sql`DELETE FROM competence WHERE id = ${id} RETURNING logo_chemin`) as {
            logo_chemin: string | null;
        }[];
        return lignes[0]?.logo_chemin ?? null;
    }
}
