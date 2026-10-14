import { z } from "zod";
import {
    DateIsoOptionnelleSchema,
    DateIsoSchema,
    IdSchema,
    Traductions,
    schemaTraductions,
} from "@/app/modeles/Traduction";

/** Expérience (parcours) telle qu'affichée sur le site (déjà traduite). */
export interface Experience {
    id: string;
    nom: string;
    lieu: string;
    description: string;
    dateDebut: string;
    dateFin: string | null;
}

export interface TraductionExperience {
    nom: string;
    lieu: string;
    description: string;
}

/** Expérience telle qu'éditée dans /admin (toutes les langues). */
export interface ExperienceAdmin {
    id: string;
    dateDebut: string;
    dateFin: string | null;
    traductions: Traductions<TraductionExperience>;
}

const TraductionExperienceSchema = z.object({
    nom: z.string().trim().max(160),
    lieu: z.string().trim().max(160),
    description: z.string().trim().max(5000),
});

export const ExperienceSaisieSchema = z
    .object({
        id: IdSchema.optional(),
        dateDebut: DateIsoSchema,
        dateFin: DateIsoOptionnelleSchema,
        traductions: schemaTraductions(TraductionExperienceSchema),
    })
    .refine((e) => e.dateFin === null || e.dateFin >= e.dateDebut, {
        message: "La date de fin doit suivre la date de début.",
        path: ["dateFin"],
    });
export type ExperienceSaisie = z.infer<typeof ExperienceSaisieSchema>;
