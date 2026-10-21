"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
    PlusIcon,
    PencilSquareIcon,
    ArrowUpTrayIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";
import { televerserMediaAction } from "@/app/admin/actions/medias";
import { enregistrerProjet, supprimerProjet } from "@/app/admin/actions/projets";
import BoutonSupprimer from "@/app/admin/components/BoutonSupprimer";
import { MessageResultat } from "@/app/admin/components/ui";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";
import GalerieImagesReordonnable from "@/app/admin/components/GalerieImagesReordonnable";
import {
    ChampSaisie,
    ChampZoneTexte,
    ChampSelection,
} from "@/app/admin/components/ChampsFormulaire";
import { LOCALES, LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import type { ProjetAdmin } from "@/app/modeles/Projet";

export interface OptionCompetence {
    id: string;
    nom: string;
}

export interface ImageProjetEtat {
    chemin: string;
    url: string;
    enTeleversement?: boolean;
    idTemp?: string;
}

const TAILLES = [
    { valeur: 1, libelle: "1 : Petit carré (1x1)" },
    { valeur: 2, libelle: "2 : Rectangle vertical (1re image)" },
    { valeur: 3, libelle: "3 : Rectangle horizontal (2 cols)" },
    { valeur: 4, libelle: "4 : Grand monolithe bento (toutes les images)" },
];

export default function FormulaireProjet({
    projet,
    competences,
    onFermer,
}: {
    projet?: ProjetAdmin;
    competences: OptionCompetence[];
    onFermer?: () => void;
}) {
    const [resultat, action, enCours] = useActionState(enregistrerProjet, null);
    const erreurs = resultat && !resultat.ok ? (resultat.erreurs ?? {}) : {};

    const [prevProjetImages, setPrevProjetImages] = useState(projet?.images);
    const [images, setImages] = useState<ImageProjetEtat[]>(projet?.images ?? []);
    const [televersementEnCours, setTeleversementEnCours] = useState(false);
    const [estEnSurvol, setEstEnSurvol] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (projet?.images !== prevProjetImages) {
        setPrevProjetImages(projet?.images);
        setImages(projet?.images ?? []);
    }

    useEffect(() => {
        if (resultat?.ok && onFermer) {
            const timer = setTimeout(() => {
                onFermer();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [resultat?.ok, onFermer]);

    const supprimerImage = (img: ImageProjetEtat) => {
        setImages((liste) =>
            liste.filter((i) => (img.idTemp ? i.idTemp !== img.idTemp : i.chemin !== img.chemin))
        );
    };

    const cheminsInitiaux = (projet?.images ?? []).map((i) => i.chemin);
    const cheminsActuels = images.filter((i) => !i.enTeleversement && i.chemin).map((i) => i.chemin);
    const aDesModificationsImages =
        cheminsInitiaux.length !== cheminsActuels.length ||
        cheminsInitiaux.some((c, idx) => c !== cheminsActuels[idx]);

    async function ajouterImagesDirect(fichiers: FileList | null) {
        if (!fichiers || fichiers.length === 0) return;
        setTeleversementEnCours(true);

        const listeFichiers = Array.from(fichiers);
        for (const f of listeFichiers) {
            const idTemp = crypto.randomUUID();
            const urlTemp = URL.createObjectURL(f);
            setImages((prev) => [...prev, { chemin: "", url: urlTemp, enTeleversement: true, idTemp }]);

            try {
                const fd = new FormData();
                fd.append("fichier", f);
                fd.append("dossier", "projets");
                const res = await televerserMediaAction(fd);
                if (res.succes && res.chemin) {
                    setImages((prev) =>
                        prev.map((img) =>
                            img.idTemp === idTemp
                                ? { chemin: res.chemin!, url: res.url ?? urlTemp, enTeleversement: false }
                                : img
                        )
                    );
                } else {
                    setImages((prev) => prev.filter((img) => img.idTemp !== idTemp));
                }
            } catch {
                setImages((prev) => prev.filter((img) => img.idTemp !== idTemp));
            }
        }
        setTeleversementEnCours(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <form action={action} className="flex flex-col min-h-full">
            {projet && <input type="hidden" name="id" value={projet.id} />}

            <div className="flex-1 px-6 sm:px-8 py-4 space-y-6">
                {/* Paramètres structurels du projet : 100% vertical */}
                <div className="flex flex-col gap-4 p-4 rounded-[12px] border border-hairline/40 bg-foreground/[0.02]">
                    <ChampSaisie
                        label="Date de début"
                        name="dateDebut"
                        type="date"
                        required
                        defaultValue={projet?.dateDebut}
                        erreur={erreurs.dateDebut}
                    />

                    <ChampSaisie
                        label="Date de fin (vide = en cours)"
                        name="dateFin"
                        type="date"
                        defaultValue={projet?.dateFin ?? ""}
                        erreur={erreurs.dateFin}
                    />

                    <ChampSaisie
                        label="Ordre d'affichage"
                        description="Position d'affichage dans la liste des projets (0 en premier)"
                        name="ordre"
                        type="number"
                        min={0}
                        max={9999}
                        defaultValue={projet?.ordre ?? 0}
                        erreur={erreurs.ordre}
                    />

                    <ChampSelection
                        label="Gabarit de carte Bento"
                        name="taille"
                        options={TAILLES}
                        valeurParDefaut={projet?.taille ?? 1}
                        erreur={erreurs.taille}
                    />

                    {/* Teinte d'ingénierie conservée de manière transparente en champ caché */}
                    <input type="hidden" name="couleur" value={projet?.couleur ?? "#20272e"} />
                </div>

                {/* Spécifications multilingues : 100% vertical */}
                <div className="flex flex-col gap-5">
                    {LOCALES.map((lang) => (
                        <fieldset key={lang} className="flex flex-col gap-4 rounded-[12px] border border-hairline/60 bg-white/50 p-4">
                            <legend className="px-1 text-sm font-sans font-semibold text-foreground">
                                Langue : {lang.toUpperCase()} {lang === LOCALE_PAR_DEFAUT ? "(obligatoire)" : "(optionnel)"}
                            </legend>

                            <ChampSaisie
                                label="Intitulé du projet"
                                name={`traductions.${lang}.nom`}
                                maxLength={120}
                                defaultValue={projet?.traductions[lang].nom}
                                placeholder={lang === "fr" ? "ex. Plateforme de Télémétrie" : "e.g. Telemetry Platform"}
                                erreur={erreurs[`traductions.${lang}.nom`]}
                            />

                            <ChampZoneTexte
                                label="Description du projet"
                                name={`traductions.${lang}.description`}
                                rows={4}
                                maxLength={5000}
                                defaultValue={projet?.traductions[lang].description}
                                placeholder="Détails techniques, architecture et résultats..."
                            />
                        </fieldset>
                    ))}
                </div>

                {/* Sélection des compétences */}
                <fieldset className="flex flex-col gap-3 rounded-[12px] border border-hairline/60 bg-white/50 p-4">
                    <legend className="px-1 text-sm font-sans font-semibold text-foreground">
                        Compétences associées à ce projet
                    </legend>
                    {competences.length === 0 && (
                        <p className="font-sans text-xs text-muted-rock">Aucune compétence enregistrée pour l&apos;instant.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {competences.map((c) => {
                            const estAssociee = projet?.competenceIds.includes(c.id);
                            return (
                                <label
                                    key={c.id}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline/60 bg-white text-xs font-sans font-medium cursor-pointer hover:border-primary select-none transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        name="competenceIds"
                                        value={c.id}
                                        defaultChecked={estAssociee}
                                        className="rounded"
                                    />
                                    <span>{c.nom}</span>
                                </label>
                            );
                        })}
                    </div>
                </fieldset>

                {/* Gestion des captures du projet */}
                <fieldset className="flex flex-col gap-4 rounded-[12px] border border-hairline/60 bg-white/50 p-4">
                    <legend className="px-1 text-sm font-sans font-semibold text-foreground">
                        Captures d&apos;écran et schémas
                    </legend>
                    <GalerieImagesReordonnable
                        images={images}
                        onReordonner={setImages}
                        onSupprimer={supprimerImage}
                        name="imagesConservees"
                    />

                    {/* Zone d'importation directe */}
                    <motion.div
                        whileHover={{
                            borderColor: "rgba(56, 92, 122, 0.45)",
                            backgroundColor: "rgba(56, 92, 122, 0.02)",
                        }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setEstEnSurvol(true);
                        }}
                        onDragLeave={() => setEstEnSurvol(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setEstEnSurvol(false);
                            if (e.dataTransfer.files) ajouterImagesDirect(e.dataTransfer.files);
                        }}
                        className={`relative flex items-center justify-between gap-3 w-full rounded-[12px] bg-white border border-dashed p-3.5 cursor-pointer select-none transition-colors ${
                            estEnSurvol ? "border-primary bg-primary/5" : "border-hairline/70"
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                            onChange={(e) => ajouterImagesDirect(e.target.files)}
                            disabled={televersementEnCours}
                            className="sr-only"
                        />
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#2b455b]/10 text-[#2b455b] flex items-center justify-center shrink-0">
                                <ArrowUpTrayIcon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-sans font-medium text-foreground/80 truncate">
                                    Ajouter des captures d&apos;écran...
                                </span>
                                <span className="text-xs font-sans text-muted-rock">
                                    PNG, JPEG, WebP, GIF ou SVG (4 Mo max)
                                </span>
                            </div>
                        </div>
                        <span className="text-xs font-sans font-medium px-3 py-1.5 rounded-full bg-foreground/5 text-foreground/75 border border-hairline/40 shrink-0">
                            Parcourir
                        </span>
                    </motion.div>

                    {/* Avertissement rouge en cas de modification des images */}
                    <AnimatePresence>
                        {aDesModificationsImages && !televersementEnCours && (
                            <motion.div
                                initial={{ opacity: 0, y: -4, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -4, height: 0 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-red-500/10 border border-red-500/25 text-xs font-sans font-medium text-red-600 mt-1"
                            >
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-red-500" />
                                <span>
                                    Modifications d&apos;images non enregistrées. Cliquez sur le bouton d&apos;action pour valider et supprimer les images retirées du stockage.
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </fieldset>
            </div>

            {/* Barre d'action fixe en bas */}
            <div className="sticky bottom-0 z-20 px-6 py-4 sm:px-8 bg-white/95 backdrop-blur-md border-t border-hairline/20 flex items-center justify-between gap-4">
                <div>
                    {projet ? (
                        <BoutonSupprimer
                            id={projet.id}
                            action={supprimerProjet}
                            libelle={projet.traductions[LOCALE_PAR_DEFAUT].nom}
                            onSupprime={onFermer}
                        />
                    ) : null}
                </div>

                <div className="flex items-center gap-3">
                    <MessageResultat resultat={resultat} />
                    {onFermer && (
                        <BoutonAdmin
                            type="button"
                            variante="secondaire"
                            texte="Annuler"
                            onClick={onFermer}
                        />
                    )}
                    <BoutonAdmin
                        type="submit"
                        chargement={enCours}
                        disabled={enCours || televersementEnCours}
                        icone={projet ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                        texte={projet ? "Modifier" : "Ajouter"}
                    />
                </div>
            </div>
        </form>
    );
}
