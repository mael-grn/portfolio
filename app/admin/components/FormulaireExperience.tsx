"use client";

import { useActionState, useEffect } from "react";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { enregistrerExperience, supprimerExperience } from "@/app/admin/actions/experiences";
import BoutonSupprimer from "@/app/admin/components/BoutonSupprimer";
import { MessageResultat } from "@/app/admin/components/ui";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";
import {
    ChampSaisie,
    ChampZoneTexte,
} from "@/app/admin/components/ChampsFormulaire";
import { LOCALES, LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import type { ExperienceAdmin } from "@/app/modeles/Experience";

export default function FormulaireExperience({
    experience,
    onFermer,
}: {
    experience?: ExperienceAdmin;
    onFermer?: () => void;
}) {
    const [resultat, action, enCours] = useActionState(enregistrerExperience, null);
    const erreurs = resultat && !resultat.ok ? (resultat.erreurs ?? {}) : {};

    useEffect(() => {
        if (resultat?.ok && onFermer) {
            const timer = setTimeout(() => {
                onFermer();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [resultat?.ok, onFermer]);

    return (
        <form action={action} className="flex flex-col min-h-full">
            {experience && <input type="hidden" name="id" value={experience.id} />}

            <div className="flex-1 px-6 sm:px-8 py-4 space-y-6">
                {/* Dates ISO de jalon : 100% vertical */}
                <div className="flex flex-col gap-4 p-4 rounded-[12px] border border-hairline/40 bg-foreground/[0.02]">
                    <ChampSaisie
                        label="Date de début"
                        name="dateDebut"
                        type="date"
                        required
                        defaultValue={experience?.dateDebut}
                        erreur={erreurs.dateDebut}
                    />

                    <ChampSaisie
                        label="Date de fin (vide = en cours)"
                        name="dateFin"
                        type="date"
                        defaultValue={experience?.dateFin ?? ""}
                        erreur={erreurs.dateFin}
                    />
                </div>

                {/* Spécifications multilingues de l'expérience : 100% vertical */}
                <div className="flex flex-col gap-5">
                    {LOCALES.map((lang) => (
                        <fieldset key={lang} className="flex flex-col gap-4 rounded-[12px] border border-hairline/60 bg-white/50 p-4">
                            <legend className="px-1 text-sm font-sans font-semibold text-foreground">
                                Langue : {lang.toUpperCase()} {lang === LOCALE_PAR_DEFAUT ? "(obligatoire)" : "(optionnel)"}
                            </legend>

                            <ChampSaisie
                                label="Intitulé du poste"
                                name={`traductions.${lang}.nom`}
                                maxLength={160}
                                defaultValue={experience?.traductions[lang].nom}
                                placeholder={lang === "fr" ? "ex. Ingénieur Logiciel & R&D" : "e.g. Software & R&D Engineer"}
                                erreur={erreurs[`traductions.${lang}.nom`]}
                            />

                            <ChampSaisie
                                label="Entreprise ou organisation"
                                name={`traductions.${lang}.lieu`}
                                maxLength={160}
                                defaultValue={experience?.traductions[lang].lieu}
                                placeholder="ex. Entreprise Tech, Organisation..."
                            />

                            <ChampZoneTexte
                                label="Description des réalisations"
                                name={`traductions.${lang}.description`}
                                rows={4}
                                maxLength={5000}
                                defaultValue={experience?.traductions[lang].description}
                                placeholder="Missions accomplies, architecture développée, technologies mobilisées..."
                            />
                        </fieldset>
                    ))}
                </div>
            </div>

            {/* Barre d'action fixe en bas */}
            <div className="sticky bottom-0 z-20 px-6 py-4 sm:px-8 bg-white/95 backdrop-blur-md border-t border-hairline/20 flex items-center justify-between gap-4">
                <div>
                    {experience ? (
                        <BoutonSupprimer
                            id={experience.id}
                            action={supprimerExperience}
                            libelle={experience.traductions[LOCALE_PAR_DEFAUT].nom}
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
                        icone={experience ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                        texte={experience ? "Modifier" : "Ajouter"}
                    />
                </div>
            </div>
        </form>
    );
}
