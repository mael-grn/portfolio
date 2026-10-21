"use server";

import { assertAdmin, recupererAdminCourant } from "@/app/lib/admin-auth";
import { ExperienceSaisieSchema } from "@/app/modeles/Experience";
import { IdSchema } from "@/app/modeles/Traduction";
import { ExperienceService } from "@/app/services/ExperienceService";
import { JournalService } from "@/app/services/JournalService";
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
        const admin = await recupererAdminCourant();
        const nomExperience = saisie.traductions.fr?.nom || "Expérience";
        const id = saisie.id ?? crypto.randomUUID();
        if (!creation && !(await ExperienceService.existe(id))) return echec("Expérience introuvable.");
        await ExperienceService.enregistrer(id, saisie, creation);

        await JournalService.enregistrer({
            typeAction: creation ? "creation" : "modification",
            entite: "experience",
            cibleNom: nomExperience,
            auteurId: admin.id,
            auteurNom: admin.nom,
        });
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/experiences");
    revalider("/admin");
    return SUCCES;
}

export async function supprimerExperience(id: string): Promise<ResultatAction> {
    await assertAdmin();
    const analyse = IdSchema.safeParse(id);
    if (!analyse.success) return echec("Identifiant invalide.");

    try {
        const admin = await recupererAdminCourant();
        await ExperienceService.supprimer(analyse.data);

        await JournalService.enregistrer({
            typeAction: "suppression",
            entite: "experience",
            cibleNom: `Expérience ${id.slice(0, 8)}`,
            auteurId: admin.id,
            auteurNom: admin.nom,
        });
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/experiences");
    revalider("/admin");
    return SUCCES;
}
