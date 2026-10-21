"use server";

import { assertAdmin, recupererAdminCourant } from "@/app/lib/admin-auth";
import { ParcoursSaisieSchema } from "@/app/modeles/Parcours";
import { IdSchema } from "@/app/modeles/Traduction";
import { ParcoursService } from "@/app/services/ParcoursService";
import { JournalService } from "@/app/services/JournalService";
import {
    ResultatAction, SUCCES, echec, erreurInattendue, erreursZod, revalider, texte, traductionsDepuisFormulaire,
} from "@/app/admin/actions/utils";

export async function enregistrerParcours(_precedent: ResultatAction | null, formData: FormData): Promise<ResultatAction> {
    await assertAdmin();

    const analyse = ParcoursSaisieSchema.safeParse({
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
        const nomParcours = saisie.traductions.fr?.nom || "Diplôme / Parcours";
        const id = saisie.id ?? crypto.randomUUID();
        if (!creation && !(await ParcoursService.existe(id))) return echec("Élément de parcours introuvable.");
        await ParcoursService.enregistrer(id, saisie, creation);

        await JournalService.enregistrer({
            typeAction: creation ? "creation" : "modification",
            entite: "parcours",
            cibleNom: nomParcours,
            auteurId: admin.id,
            auteurNom: admin.nom,
        });
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/parcours");
    revalider("/admin");
    return SUCCES;
}

export async function supprimerParcours(id: string): Promise<ResultatAction> {
    await assertAdmin();
    const analyse = IdSchema.safeParse(id);
    if (!analyse.success) return echec("Identifiant invalide.");

    try {
        const admin = await recupererAdminCourant();
        await ParcoursService.supprimer(analyse.data);

        await JournalService.enregistrer({
            typeAction: "suppression",
            entite: "parcours",
            cibleNom: `Parcours ${id.slice(0, 8)}`,
            auteurId: admin.id,
            auteurNom: admin.nom,
        });
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/parcours");
    revalider("/admin");
    return SUCCES;
}
