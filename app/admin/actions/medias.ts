"use server";

import { assertAdmin } from "@/app/lib/admin-auth";
import { televerserImage, ImageInvalideError } from "@/app/lib/blob";
import { DossierMedia, urlMedia } from "@/app/lib/media";

export interface ResultatTeleversementMedia {
    succes: boolean;
    chemin?: string;
    url?: string;
    nomFichier?: string;
    erreur?: string;
}

/** Téléverse un média vers le Blob privé immédiatement après sélection côté client. */
export async function televerserMediaAction(formData: FormData): Promise<ResultatTeleversementMedia> {
    await assertAdmin();

    const fichier = formData.get("fichier");
    if (!(fichier instanceof File) || fichier.size === 0) {
        return { succes: false, erreur: "Aucun fichier valide fourni." };
    }

    const dossierBrut = formData.get("dossier");
    const dossier: DossierMedia = dossierBrut === "projets" ? "projets" : "competences";

    try {
        const chemin = await televerserImage(fichier, dossier);
        return {
            succes: true,
            chemin,
            url: urlMedia(chemin),
            nomFichier: fichier.name,
        };
    } catch (err: unknown) {
        if (err instanceof ImageInvalideError) {
            return { succes: false, erreur: err.message };
        }
        console.error("Erreur de téléversement média :", err);
        return { succes: false, erreur: "Échec du téléversement vers le stockage." };
    }
}
