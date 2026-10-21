import { z } from "zod";
import { LOCALES, LOCALE_PAR_DEFAUT, Locale } from "@/app/lib/langues";

/** Date ISO `AAAA-MM-JJ`, ou vide pour « en cours » (→ null). */
export const DateIsoSchema = z.iso.date("Date invalide.");
export const DateIsoOptionnelleSchema = z
    .union([z.iso.date("Date invalide."), z.literal("")])
    .transform((valeur) => (valeur === "" ? null : valeur));

export const CouleurSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadécimale attendue (#RRGGBB).");

export const OrdreSchema = z.coerce.number().int().min(0).max(9999);

export const IdSchema = z.uuid("Identifiant invalide.");

/** Les traductions de chaque langue ; la langue par défaut est obligatoire, les autres sont optionnelles. */
export type Traductions<T> = Record<Locale, T>;

export function schemaTraductions<T extends z.ZodType<{ nom: string }>>(schemaLangue: T) {
    return z
        .partialRecord(z.enum(LOCALES), schemaLangue)
        .refine((valeur) => Boolean(valeur[LOCALE_PAR_DEFAUT]?.nom?.trim()), {
            message: `Le nom en ${LOCALE_PAR_DEFAUT.toUpperCase()} est obligatoire.`,
            path: [LOCALE_PAR_DEFAUT, "nom"],
        });
}
