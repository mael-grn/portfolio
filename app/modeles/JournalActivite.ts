import { z } from "zod";

export const TypeActionSchema = z.enum(["creation", "modification", "suppression"]);
export type TypeAction = z.infer<typeof TypeActionSchema>;

export const EntiteModifieeSchema = z.enum(["competence", "projet", "experience", "parcours"]);
export type EntiteModifiee = z.infer<typeof EntiteModifieeSchema>;

export interface EntreeJournal {
    id: string;
    typeAction: TypeAction;
    entite: EntiteModifiee;
    cibleNom: string;
    auteurId: string;
    auteurNom: string;
    createdAt: string;
}
