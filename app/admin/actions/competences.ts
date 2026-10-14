"use server";

import { assertAdmin } from "@/app/lib/admin-auth";
import { supprimerImages, televerserImage } from "@/app/lib/blob";
import { CompetenceSaisieSchema } from "@/app/modeles/Competence";
import { IdSchema } from "@/app/modeles/Traduction";
import { CompetenceService } from "@/app/services/CompetenceService";
import {
    ResultatAction, SUCCES, echec, erreurInattendue, erreursZod, fichier, revalider, texte,
} from "@/app/admin/actions/utils";

export async function enregistrerCompetence(_precedent: ResultatAction | null, formData: FormData): Promise<ResultatAction> {
    await assertAdmin();

    const analyse = CompetenceSaisieSchema.safeParse({
        id: texte(formData, "id") || undefined,
        nom: texte(formData, "nom"),
        categorie: texte(formData, "categorie"),
        maitrise: texte(formData, "maitrise"),
        ordre: texte(formData, "ordre") || "0",
    });
    if (!analyse.success) return erreursZod(analyse.error);
    const saisie = analyse.data;

    let nouveauLogo: string | null = null;
    try {
        const existant = saisie.id ? await CompetenceService.recupererLogo(saisie.id) : null;
        if (saisie.id && !existant) return echec("Compétence introuvable.");

        const logo = fichier(formData, "logo");
        if (logo) nouveauLogo = await televerserImage(logo, "competences");
        const supprimerLogo = texte(formData, "supprimerLogo") === "on";
        const logoFinal = nouveauLogo ?? (supprimerLogo ? null : (existant?.logoChemin ?? null));

        if (saisie.id) await CompetenceService.modifier(saisie.id, saisie, logoFinal);
        else await CompetenceService.creer(saisie, logoFinal);

        if (existant?.logoChemin && existant.logoChemin !== logoFinal) await supprimerImages([existant.logoChemin]);
    } catch (erreur) {
        if (nouveauLogo) await supprimerImages([nouveauLogo]);
        return erreurInattendue(erreur);
    }

    revalider("/admin/competences");
    return SUCCES;
}

export async function supprimerCompetence(id: string): Promise<ResultatAction> {
    await assertAdmin();
    const analyse = IdSchema.safeParse(id);
    if (!analyse.success) return echec("Identifiant invalide.");

    try {
        const logo = await CompetenceService.supprimer(analyse.data);
        if (logo) await supprimerImages([logo]);
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/competences");
    return SUCCES;
}
