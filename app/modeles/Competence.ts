import { z } from "zod";
import { IdSchema, OrdreSchema } from "@/app/modeles/Traduction";

export const CATEGORIES_COMPETENCE = ["programmation", "web", "bdd", "deploiement", "equipe"] as const;
export type CategorieCompetence = (typeof CATEGORIES_COMPETENCE)[number];

/** Compétence telle qu'affichée sur le site. */
export interface Competence {
    id: string;
    nom: string;
    categorie: CategorieCompetence;
    logoUrl: string | null;
    maitrise: number;
    nombreProjets: number;
}

/** Compétence telle qu'éditée dans /admin. */
export interface CompetenceAdmin extends Competence {
    logoChemin: string | null;
    ordre: number;
}

export const CompetenceSaisieSchema = z.object({
    id: IdSchema.optional(),
    nom: z.string().trim().min(1, "Le nom est obligatoire.").max(80),
    categorie: z.enum(CATEGORIES_COMPETENCE, { error: "Catégorie invalide." }),
    maitrise: z.coerce.number({ error: "Nombre attendu." }).int("Nombre entier attendu.").min(0, "Entre 0 et 5.").max(5, "Entre 0 et 5."),
    ordre: OrdreSchema,
});
export type CompetenceSaisie = z.infer<typeof CompetenceSaisieSchema>;
