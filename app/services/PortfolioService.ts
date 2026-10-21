import "server-only";
import { cache } from "react";
import { sql } from "@/app/lib/db";
import { LOCALE_PAR_DEFAUT, Locale } from "@/app/lib/langues";
import { urlMedia } from "@/app/lib/media";
import { CategorieCompetence, Competence } from "@/app/modeles/Competence";
import { Experience } from "@/app/modeles/Experience";
import { Projet, TailleProjet } from "@/app/modeles/Projet";

export interface Portfolio {
    competences: Competence[];
    projets: Projet[];
    experiences: Experience[];
}

interface LigneCompetence {
    id: string;
    nom: string;
    categorie: CategorieCompetence;
    logo_chemin: string | null;
    maitrise: number;
    nombre_projets: number;
}

interface LigneProjet {
    id: string;
    nom: string;
    description: string;
    date_debut: string;
    date_fin: string | null;
    taille: TailleProjet;
    couleur: string;
    competences: string[];
    images: string[];
}

interface LigneExperience {
    id: string;
    nom: string;
    lieu: string;
    description: string;
    date_debut: string;
    date_fin: string | null;
}

/**
 * Lecture publique des données de la landing page.
 * Les 3 requêtes partent dans UNE transaction HTTP (un seul aller-retour vers Neon), sans N+1
 * (compétences et images des projets agrégées en JSON côté SQL). La langue demandée est préférée,
 * avec repli sur la langue par défaut. `cache` de React dédoublonne les appels d'une même requête ;
 * la page étant statique, la base n'est interrogée qu'au build et à chaque revalidation.
 */
export class PortfolioService {
    static recuperer = cache(async (lang: Locale): Promise<Portfolio> => {
        const [competences, projets, experiences] = (await sql.transaction([
            sql`
                SELECT c.id, c.nom, c.categorie, c.logo_chemin, c.maitrise,
                       (SELECT count(*)::int FROM projet_competence pc WHERE pc.competence_id = c.id) AS nombre_projets
                FROM competence c
                ORDER BY c.categorie, c.ordre, c.nom`,
            sql`
                SELECT p.id,
                       COALESCE(t.nom, f.nom) AS nom,
                       COALESCE(t.description, f.description) AS description,
                       p.date_debut::text AS date_debut, p.date_fin::text AS date_fin,
                       p.taille, p.couleur,
                       COALESCE((SELECT json_agg(c.nom ORDER BY c.categorie, c.ordre, c.nom)
                                 FROM projet_competence pc JOIN competence c ON c.id = pc.competence_id
                                 WHERE pc.projet_id = p.id), '[]'::json) AS competences,
                       COALESCE((SELECT json_agg(i.chemin ORDER BY i.ordre)
                                 FROM projet_image i WHERE i.projet_id = p.id), '[]'::json) AS images
                FROM projet p
                JOIN projet_traduction f ON f.projet_id = p.id AND f.lang = ${LOCALE_PAR_DEFAUT}
                LEFT JOIN projet_traduction t ON t.projet_id = p.id AND t.lang = ${lang}
                ORDER BY p.ordre, p.date_debut DESC`,
            sql`
                SELECT e.id,
                       COALESCE(t.nom, f.nom) AS nom,
                       COALESCE(t.lieu, f.lieu) AS lieu,
                       COALESCE(t.description, f.description) AS description,
                       e.date_debut::text AS date_debut, e.date_fin::text AS date_fin
                FROM experience e
                JOIN experience_traduction f ON f.experience_id = e.id AND f.lang = ${LOCALE_PAR_DEFAUT}
                LEFT JOIN experience_traduction t ON t.experience_id = e.id AND t.lang = ${lang}
                ORDER BY e.date_debut`,
        ])) as [LigneCompetence[], LigneProjet[], LigneExperience[]];

        return {
            competences: competences.map((c) => ({
                id: c.id,
                nom: c.nom,
                categorie: c.categorie,
                logoUrl: c.logo_chemin ? urlMedia(c.logo_chemin) : null,
                maitrise: c.maitrise,
                nombreProjets: c.nombre_projets,
            })),
            projets: projets.map((p) => ({
                id: p.id,
                nom: p.nom,
                description: p.description,
                dateDebut: p.date_debut,
                dateFin: p.date_fin,
                taille: p.taille,
                couleur: p.couleur,
                competences: p.competences,
                images: p.images.map(urlMedia),
            })),
            experiences: experiences.map((e) => ({
                id: e.id,
                nom: e.nom,
                lieu: e.lieu,
                description: e.description,
                dateDebut: e.date_debut,
                dateFin: e.date_fin,
            })),
        };
    });
}
