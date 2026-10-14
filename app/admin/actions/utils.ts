import "server-only";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { ImageInvalideError } from "@/app/lib/blob";
import { LOCALES } from "@/app/lib/langues";

export type ResultatAction =
    | { ok: true }
    | { ok: false; message: string; erreurs?: Record<string, string> };

export const SUCCES: ResultatAction = { ok: true };

export function echec(message: string, erreurs?: Record<string, string>): ResultatAction {
    return { ok: false, message, erreurs };
}

export function erreursZod(erreur: ZodError): ResultatAction {
    const erreurs: Record<string, string> = {};
    for (const issue of erreur.issues) {
        const cle = issue.path.join(".");
        erreurs[cle] ??= issue.message;
    }
    return echec("Certains champs sont invalides.", erreurs);
}

/** Message affichable : détaille les erreurs de saisie, reste volontairement générique pour le reste. */
export function erreurInattendue(erreur: unknown): ResultatAction {
    if (erreur instanceof ImageInvalideError) return echec(erreur.message);
    console.error("Erreur d'administration :", erreur);
    return echec("Une erreur est survenue, rien n'a été enregistré.");
}

export function texte(formData: FormData, cle: string): string {
    const valeur = formData.get(cle);
    return typeof valeur === "string" ? valeur : "";
}

/** Fichier téléversé non vide, ou null. */
export function fichier(formData: FormData, cle: string): File | null {
    const valeur = formData.get(cle);
    return valeur instanceof File && valeur.size > 0 ? valeur : null;
}

export function fichiers(formData: FormData, cle: string): File[] {
    return formData.getAll(cle).filter((v): v is File => v instanceof File && v.size > 0);
}

/** Lit les champs `traductions.<lang>.<champ>` du formulaire. */
export function traductionsDepuisFormulaire(formData: FormData, champs: string[]) {
    return Object.fromEntries(
        LOCALES.map((lang) => [
            lang,
            Object.fromEntries(champs.map((champ) => [champ, texte(formData, `traductions.${lang}.${champ}`)])),
        ]),
    );
}

/** Rafraîchit le site public (toutes les langues) et la page d'administration concernée. */
export function revalider(pageAdmin: string) {
    revalidatePath("/[lang]", "page");
    revalidatePath(pageAdmin);
}
