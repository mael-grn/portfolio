"use server";

import { assertAdmin } from "@/app/lib/admin-auth";
import { ExperienceSaisieSchema } from "@/app/modeles/Experience";
import { IdSchema } from "@/app/modeles/Traduction";
import { ExperienceService } from "@/app/services/ExperienceService";
import {
    ResultatAction, SUCCES, echec, erreurInattendue, erreursZod, revalider, texte, traductionsDepuisFormulaire,
} from "@/app/admin/actions/utils";

export async function enregistrerExperience(_precedent: ResultatAction | null, formData: FormData): Promise<ResultatAction> {
    await assertAdmin();

    const analyse = ExperienceSaisieSchema.safeParse({
        id: texte(formData, "id") || undefined,
        dateDebut: texte(formData, "dateDebut"),
        dateFin: texte(formData, "dateFin"),
        traductions: traductionsDepuisFormulaire(formData, ["nom", "lieu", "description"]),
    });
    if (!analyse.success) return erreursZod(analyse.error);
    const saisie = analyse.data;
    const creation = !saisie.id;

    try {
        const id = saisie.id ?? crypto.randomUUID();
        if (!creation && !(await ExperienceService.existe(id))) return echec("Expérience introuvable.");
        await ExperienceService.enregistrer(id, saisie, creation);
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/experiences");
    return SUCCES;
}

export async function supprimerExperience(id: string): Promise<ResultatAction> {
    await assertAdmin();
    const analyse = IdSchema.safeParse(id);
    if (!analyse.success) return echec("Identifiant invalide.");

    try {
        await ExperienceService.supprimer(analyse.data);
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/experiences");
    return SUCCES;
}
