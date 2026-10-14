import { z } from "zod";
import {
    CouleurSchema,
    DateIsoOptionnelleSchema,
    DateIsoSchema,
    IdSchema,
    OrdreSchema,
    Traductions,
    schemaTraductions,
} from "@/app/modeles/Traduction";

export const TAILLES_PROJET = [1, 2, 3, 4] as const;

/*
Tailles de carte :
1: petit carré
2: moyen rectangle vertical (avec première image)
3: grand rectangle horizontal
4: grand rectangle (toutes les images)
 */
export type TailleProjet = (typeof TAILLES_PROJET)[number];

/** Projet tel qu'affiché sur le site (déjà traduit). */
export interface Projet {
    id: string;
    nom: string;
    description: string;
    dateDebut: string;
    dateFin: string | null;
    taille: TailleProjet;
    couleur: string;
    competences: string[];
    images: string[];
}

export interface TraductionProjet {
    nom: string;
    description: string;
}

export interface ImageProjetAdmin {
    chemin: string;
    url: string;
}

/** Projet tel qu'édité dans /admin (toutes les langues). */
export interface ProjetAdmin {
    id: string;
    dateDebut: string;
    dateFin: string | null;
    taille: TailleProjet;
    couleur: string;
    ordre: number;
    competenceIds: string[];
    images: ImageProjetAdmin[];
    traductions: Traductions<TraductionProjet>;
}

const TraductionProjetSchema = z.object({
    nom: z.string().trim().max(120),
    description: z.string().trim().max(5000),
});

export const ProjetSaisieSchema = z
    .object({
        id: IdSchema.optional(),
        dateDebut: DateIsoSchema,
        dateFin: DateIsoOptionnelleSchema,
        taille: z.coerce.number().pipe(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])),
        couleur: CouleurSchema,
        ordre: OrdreSchema,
        competenceIds: z.array(IdSchema).max(100),
        /** Chemins des images existantes à conserver, dans l'ordre d'affichage. */
        imagesConservees: z.array(z.string().max(300)).max(20),
        traductions: schemaTraductions(TraductionProjetSchema),
    })
    .refine((p) => p.dateFin === null || p.dateFin >= p.dateDebut, {
        message: "La date de fin doit suivre la date de début.",
        path: ["dateFin"],
    });
export type ProjetSaisie = z.infer<typeof ProjetSaisieSchema>;
