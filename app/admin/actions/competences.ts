"use server";

import { assertAdmin, recupererAdminCourant } from "@/app/lib/admin-auth";
import { supprimerImages, televerserImage } from "@/app/lib/blob";
import { CompetenceSaisieSchema } from "@/app/modeles/Competence";
import { IdSchema } from "@/app/modeles/Traduction";
import { CompetenceService } from "@/app/services/CompetenceService";
import { JournalService } from "@/app/services/JournalService";
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

        const logoCheminDirect = texte(formData, "logoChemin");
        let logoFinal: string | null = null;
        if (formData.has("logoChemin")) {
            // Le formulaire a soumis un logoChemin explicite (chemin direct ou vide si supprimé)
            logoFinal = logoCheminDirect.trim() !== "" ? logoCheminDirect.trim() : null;
        } else {
            // Fallback fichier brut
            const logo = fichier(formData, "logo");
            if (logo) nouveauLogo = await televerserImage(logo, "competences");
            const supprimerLogo = texte(formData, "supprimerLogo") === "on";
            logoFinal = nouveauLogo ?? (supprimerLogo ? null : (existant?.logoChemin ?? null));
        }

        const admin = await recupererAdminCourant();

        if (saisie.id) {
            await CompetenceService.modifier(saisie.id, saisie, logoFinal);
            await JournalService.enregistrer({
                typeAction: "modification",
                entite: "competence",
                cibleNom: saisie.nom,
                auteurId: admin.id,
                auteurNom: admin.nom,
            });
        } else {
            await CompetenceService.creer(saisie, logoFinal);
            await JournalService.enregistrer({
                typeAction: "creation",
                entite: "competence",
                cibleNom: saisie.nom,
                auteurId: admin.id,
                auteurNom: admin.nom,
            });
        }

        if (existant?.logoChemin && existant.logoChemin !== logoFinal) await supprimerImages([existant.logoChemin]);
    } catch (erreur) {
        if (nouveauLogo) await supprimerImages([nouveauLogo]);
        return erreurInattendue(erreur);
    }

    revalider("/admin/competences");
    revalider("/admin");
    return SUCCES;
}

export async function supprimerCompetence(id: string): Promise<ResultatAction> {
    await assertAdmin();
    const analyse = IdSchema.safeParse(id);
    if (!analyse.success) return echec("Identifiant invalide.");

    try {
        const admin = await recupererAdminCourant();
        const logo = await CompetenceService.supprimer(analyse.data);
        if (logo) await supprimerImages([logo]);

        await JournalService.enregistrer({
            typeAction: "suppression",
            entite: "competence",
            cibleNom: `Compétence ${id.slice(0, 8)}`,
            auteurId: admin.id,
            auteurNom: admin.nom,
        });
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/competences");
    revalider("/admin");
    return SUCCES;
}
