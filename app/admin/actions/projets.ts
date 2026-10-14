"use server";

import { assertAdmin } from "@/app/lib/admin-auth";
import { supprimerImages, televerserImage } from "@/app/lib/blob";
import { ProjetSaisieSchema } from "@/app/modeles/Projet";
import { IdSchema } from "@/app/modeles/Traduction";
import { ProjetService } from "@/app/services/ProjetService";
import {
    ResultatAction, SUCCES, echec, erreurInattendue, erreursZod, fichiers, revalider, texte,
    traductionsDepuisFormulaire,
} from "@/app/admin/actions/utils";

export async function enregistrerProjet(_precedent: ResultatAction | null, formData: FormData): Promise<ResultatAction> {
    await assertAdmin();

    const analyse = ProjetSaisieSchema.safeParse({
        id: texte(formData, "id") || undefined,
        dateDebut: texte(formData, "dateDebut"),
        dateFin: texte(formData, "dateFin"),
        taille: texte(formData, "taille"),
        couleur: texte(formData, "couleur"),
        ordre: texte(formData, "ordre") || "0",
        competenceIds: formData.getAll("competenceIds").map(String),
        imagesConservees: formData.getAll("imagesConservees").map(String),
        traductions: traductionsDepuisFormulaire(formData, ["nom", "description"]),
    });
    if (!analyse.success) return erreursZod(analyse.error);
    const saisie = analyse.data;
    const creation = !saisie.id;
    const id = saisie.id ?? crypto.randomUUID();

    const nouvellesImages: string[] = [];
    try {
        const imagesExistantes = creation ? [] : await ProjetService.imagesDe(id);
        if (imagesExistantes === null) return echec("Projet introuvable.");

        // Seules les images appartenant déjà au projet peuvent être conservées (jamais un chemin arbitraire).
        const conservees = saisie.imagesConservees.filter((chemin) => imagesExistantes.includes(chemin));
        const aSupprimer = imagesExistantes.filter((chemin) => !conservees.includes(chemin));

        const televersements = fichiers(formData, "nouvellesImages");
        if (conservees.length + televersements.length > 20) return echec("20 images maximum par projet.");
        for (const image of televersements) nouvellesImages.push(await televerserImage(image, "projets"));

        await ProjetService.enregistrer(id, { ...saisie, imagesConservees: conservees }, nouvellesImages, creation);
        await supprimerImages(aSupprimer);
    } catch (erreur) {
        await supprimerImages(nouvellesImages);
        return erreurInattendue(erreur);
    }

    revalider("/admin/projets");
    return SUCCES;
}

export async function supprimerProjet(id: string): Promise<ResultatAction> {
    await assertAdmin();
    const analyse = IdSchema.safeParse(id);
    if (!analyse.success) return echec("Identifiant invalide.");

    try {
        await supprimerImages(await ProjetService.supprimer(analyse.data));
    } catch (erreur) {
        return erreurInattendue(erreur);
    }

    revalider("/admin/projets");
    return SUCCES;
}
