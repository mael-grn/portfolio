"use client";

import { useActionState, useEffect } from "react";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { enregistrerParcours, supprimerParcours } from "@/app/admin/actions/parcours";
import BoutonSupprimer from "@/app/admin/components/BoutonSupprimer";
import { MessageResultat } from "@/app/admin/components/ui";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";
import {
    ChampSaisie,
    ChampZoneTexte,
} from "@/app/admin/components/ChampsFormulaire";
import { LOCALES, LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import type { ParcoursAdmin } from "@/app/modeles/Parcours";

export default function FormulaireParcours({
    parcours,
    onFermer,
}: {
    parcours?: ParcoursAdmin;
    onFermer?: () => void;
}) {
    const [resultat, action, enCours] = useActionState(enregistrerParcours, null);
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
            {parcours && <input type="hidden" name="id" value={parcours.id} />}

            <div className="flex-1 px-6 sm:px-8 py-4 space-y-6">
                {/* Dates de parcours : 100% vertical */}
                <div className="flex flex-col gap-4 p-4 rounded-[12px] border border-hairline/40 bg-foreground/[0.02]">
                    <ChampSaisie
                        label="Date de début"
                        name="dateDebut"
                        type="date"
                        required
                        defaultValue={parcours?.dateDebut}
                        erreur={erreurs.dateDebut}
                    />

                    <ChampSaisie
                        label="Date de fin (vide = en cours)"
                        name="dateFin"
                        type="date"
                        defaultValue={parcours?.dateFin ?? ""}
                        erreur={erreurs.dateFin}
                    />
                </div>

                {/* Spécifications multilingues du parcours : 100% vertical */}
                <div className="flex flex-col gap-5">
                    {LOCALES.map((lang) => (
                        <fieldset key={lang} className="flex flex-col gap-4 rounded-[12px] border border-hairline/60 bg-white/50 p-4">
                            <legend className="px-1 text-sm font-sans font-semibold text-foreground">
                                Langue : {lang.toUpperCase()} {lang === LOCALE_PAR_DEFAUT ? "(obligatoire)" : "(optionnel)"}
                            </legend>

                            <ChampSaisie
                                label="Diplôme"
                                name={`traductions.${lang}.nom`}
                                maxLength={160}
                                defaultValue={parcours?.traductions[lang].nom}
                                placeholder={lang === "fr" ? "ex. Master Informatique & Systèmes" : "e.g. Master's in Computer Science"}
                                erreur={erreurs[`traductions.${lang}.nom`]}
                            />

                            <ChampSaisie
                                label="Établissement"
                                name={`traductions.${lang}.lieu`}
                                maxLength={160}
                                defaultValue={parcours?.traductions[lang].lieu}
                                placeholder="ex. Université, École d'ingénieurs..."
                            />

                            <ChampZoneTexte
                                label="Description du parcours"
                                name={`traductions.${lang}.description`}
                                rows={4}
                                maxLength={5000}
                                defaultValue={parcours?.traductions[lang].description}
                                placeholder="Spécialités, mentions, projets académiques..."
                            />
                        </fieldset>
                    ))}
                </div>
            </div>

            {/* Barre d'action fixe en bas */}
            <div className="sticky bottom-0 z-20 px-6 py-4 sm:px-8 bg-white/95 backdrop-blur-md border-t border-hairline/20 flex items-center justify-between gap-4">
                <div>
                    {parcours ? (
                        <BoutonSupprimer
                            id={parcours.id}
                            action={supprimerParcours}
                            libelle={parcours.traductions[LOCALE_PAR_DEFAUT].nom}
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
                        icone={parcours ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                        texte={parcours ? "Modifier" : "Ajouter"}
                    />
                </div>
            </div>
        </form>
    );
}
