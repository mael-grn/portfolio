import { z } from "zod";
import {
    DateIsoOptionnelleSchema,
    DateIsoSchema,
    IdSchema,
    Traductions,
    schemaTraductions,
} from "@/app/modeles/Traduction";

/** Parcours académique tel qu'affiché sur le site (déjà traduit). */
export interface Parcours {
    id: string;
    nom: string;
    lieu: string;
    description: string;
    dateDebut: string;
    dateFin: string | null;
}

export interface TraductionParcours {
    nom: string;
    lieu: string;
    description: string;
}

/** Parcours tel qu'édité dans /admin (toutes les langues). */
export interface ParcoursAdmin {
    id: string;
    dateDebut: string;
    dateFin: string | null;
    traductions: Traductions<TraductionParcours>;
}

const TraductionParcoursSchema = z.object({
    nom: z.string().trim().max(160),
    lieu: z.string().trim().max(160),
    description: z.string().trim().max(5000),
});

export const ParcoursSaisieSchema = z
    .object({
        id: IdSchema.optional(),
        dateDebut: DateIsoSchema,
        dateFin: DateIsoOptionnelleSchema,
        traductions: schemaTraductions(TraductionParcoursSchema),
    })
    .refine((e) => e.dateFin === null || e.dateFin >= e.dateDebut, {
        message: "La date de fin doit suivre la date de début.",
        path: ["dateFin"],
    });
export type ParcoursSaisie = z.infer<typeof ParcoursSaisieSchema>;
