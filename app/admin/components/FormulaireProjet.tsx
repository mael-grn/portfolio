"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { enregistrerProjet, supprimerProjet } from "@/app/admin/actions/projets";
import BoutonSupprimer from "@/app/admin/components/BoutonSupprimer";
import { Bouton, Champ, MessageResultat, classeChamp } from "@/app/admin/components/ui";
import { LOCALES, LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import { estSvg } from "@/app/lib/media";
import type { ImageProjetAdmin, ProjetAdmin } from "@/app/modeles/Projet";

export interface OptionCompetence {
    id: string;
    nom: string;
}

const TAILLES = [
    { valeur: 1, libelle: "1 : petit carré" },
    { valeur: 2, libelle: "2 : rectangle vertical (1re image)" },
    { valeur: 3, libelle: "3 : rectangle horizontal" },
    { valeur: 4, libelle: "4 : grand (toutes les images)" },
];

export default function FormulaireProjet({
    projet, competences,
}: { projet?: ProjetAdmin; competences: OptionCompetence[] }) {
    const [resultat, action, enCours] = useActionState(enregistrerProjet, null);
    const erreurs = resultat && !resultat.ok ? (resultat.erreurs ?? {}) : {};

    // Images déjà enregistrées, réordonnables et supprimables ; resynchronisées quand les données serveur changent.
    const [imagesProp, setImagesProp] = useState<ImageProjetAdmin[] | undefined>(projet?.images);
    const [images, setImages] = useState<ImageProjetAdmin[]>(projet?.images ?? []);
    if (projet && projet.images !== imagesProp) {
        setImagesProp(projet.images);
        setImages(projet.images);
    }

    const deplacer = (index: number, sens: -1 | 1) =>
        setImages((liste) => {
            const cible = index + sens;
            if (cible < 0 || cible >= liste.length) return liste;
            const copie = [...liste];
            [copie[index], copie[cible]] = [copie[cible], copie[index]];
            return copie;
        });

    return (
        <div className="flex flex-col gap-4">
            <form action={action} className="flex flex-col gap-4">
                {projet && <input type="hidden" name="id" value={projet.id} />}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Champ label="Date de début" erreur={erreurs.dateDebut}>
                        <input name="dateDebut" type="date" required defaultValue={projet?.dateDebut} className={classeChamp} />
                    </Champ>
                    <Champ label="Date de fin (vide = en cours)" erreur={erreurs.dateFin}>
                        <input name="dateFin" type="date" defaultValue={projet?.dateFin ?? ""} className={classeChamp} />
                    </Champ>
                    <Champ label="Ordre d'affichage" erreur={erreurs.ordre}>
                        <input name="ordre" type="number" min={0} max={9999} defaultValue={projet?.ordre ?? 0} className={classeChamp} />
                    </Champ>
                    <Champ label="Taille de la carte" erreur={erreurs.taille}>
                        <select name="taille" defaultValue={projet?.taille ?? 1} className={classeChamp}>
                            {TAILLES.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
                        </select>
                    </Champ>
                    <Champ label="Couleur de la carte" erreur={erreurs.couleur}>
                        <input name="couleur" type="color" defaultValue={projet?.couleur ?? "#2a5269"} className={`${classeChamp} h-10 p-1`} />
                    </Champ>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {LOCALES.map((lang) => (
                        <fieldset key={lang} className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-3">
                            <legend className="px-1 text-sm font-semibold uppercase">
                                {lang}{lang === LOCALE_PAR_DEFAUT ? " (obligatoire)" : " (optionnel, repli sur " + LOCALE_PAR_DEFAUT.toUpperCase() + ")"}
                            </legend>
                            <Champ label="Nom" erreur={erreurs[`traductions.${lang}.nom`]}>
                                <input
                                    name={`traductions.${lang}.nom`}
                                    maxLength={120}
                                    defaultValue={projet?.traductions[lang].nom}
                                    className={classeChamp}
                                />
                            </Champ>
                            <Champ label="Description">
                                <textarea
                                    name={`traductions.${lang}.description`}
                                    rows={4}
                                    maxLength={5000}
                                    defaultValue={projet?.traductions[lang].description}
                                    className={classeChamp}
                                />
                            </Champ>
                        </fieldset>
                    ))}
                </div>

                <fieldset className="flex flex-col gap-2 rounded-lg border border-foreground/10 p-3">
                    <legend className="px-1 text-sm font-semibold">Compétences utilisées</legend>
                    {competences.length === 0 && <p className="text-sm text-foreground/60">Aucune compétence : en créer d&apos;abord.</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {competences.map((c) => (
                            <label key={c.id} className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="competenceIds"
                                    value={c.id}
                                    defaultChecked={projet?.competenceIds.includes(c.id)}
                                />
                                {c.nom}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <fieldset className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-3">
                    <legend className="px-1 text-sm font-semibold">Images</legend>
                    {images.length > 0 && (
                        <ul className="flex flex-wrap gap-3">
                            {images.map((image, index) => (
                                <li key={image.chemin} className="flex w-40 flex-col gap-2 rounded-lg bg-white p-2">
                                    <input type="hidden" name="imagesConservees" value={image.chemin} />
                                    <Image
                                        src={image.url}
                                        alt={`Image ${index + 1} du projet`}
                                        width={160}
                                        height={100}
                                        unoptimized={estSvg(image.chemin)}
                                        className="h-24 w-full rounded object-contain"
                                    />
                                    <div className="flex gap-1">
                                        <Bouton type="button" variante="secondaire" aria-label="Déplacer vers le début" onClick={() => deplacer(index, -1)} disabled={index === 0}>←</Bouton>
                                        <Bouton type="button" variante="secondaire" aria-label="Déplacer vers la fin" onClick={() => deplacer(index, 1)} disabled={index === images.length - 1}>→</Bouton>
                                        <Bouton type="button" variante="danger" aria-label="Retirer l'image" onClick={() => setImages((l) => l.filter((i) => i.chemin !== image.chemin))}>✕</Bouton>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Champ label="Ajouter des images (PNG, JPEG, WebP, GIF ou SVG, 4 Mo max chacune)">
                        <input
                            name="nouvellesImages"
                            type="file"
                            multiple
                            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                            className={classeChamp}
                        />
                    </Champ>
                </fieldset>

                <div className="flex flex-wrap items-center gap-3">
                    <Bouton type="submit" disabled={enCours}>
                        {enCours ? "Enregistrement…" : projet ? "Enregistrer" : "Ajouter le projet"}
                    </Bouton>
                    <MessageResultat resultat={resultat} />
                </div>
            </form>

            {projet && (
                <div className="border-t border-foreground/10 pt-4">
                    <BoutonSupprimer id={projet.id} action={supprimerProjet} libelle={projet.traductions[LOCALE_PAR_DEFAUT].nom} />
                </div>
            )}
        </div>
    );
}
