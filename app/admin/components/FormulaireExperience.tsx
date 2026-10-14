"use client";

import { useActionState } from "react";
import { enregistrerExperience, supprimerExperience } from "@/app/admin/actions/experiences";
import BoutonSupprimer from "@/app/admin/components/BoutonSupprimer";
import { Bouton, Champ, MessageResultat, classeChamp } from "@/app/admin/components/ui";
import { LOCALES, LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import type { ExperienceAdmin } from "@/app/modeles/Experience";

export default function FormulaireExperience({ experience }: { experience?: ExperienceAdmin }) {
    const [resultat, action, enCours] = useActionState(enregistrerExperience, null);
    const erreurs = resultat && !resultat.ok ? (resultat.erreurs ?? {}) : {};

    return (
        <div className="flex flex-col gap-4">
            <form action={action} className="flex flex-col gap-4">
                {experience && <input type="hidden" name="id" value={experience.id} />}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Champ label="Date de début" erreur={erreurs.dateDebut}>
                        <input name="dateDebut" type="date" required defaultValue={experience?.dateDebut} className={classeChamp} />
                    </Champ>
                    <Champ label="Date de fin (vide = en cours)" erreur={erreurs.dateFin}>
                        <input name="dateFin" type="date" defaultValue={experience?.dateFin ?? ""} className={classeChamp} />
                    </Champ>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {LOCALES.map((lang) => (
                        <fieldset key={lang} className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-3">
                            <legend className="px-1 text-sm font-semibold uppercase">
                                {lang}{lang === LOCALE_PAR_DEFAUT ? " (obligatoire)" : " (optionnel, repli sur " + LOCALE_PAR_DEFAUT.toUpperCase() + ")"}
                            </legend>
                            <Champ label="Intitulé" erreur={erreurs[`traductions.${lang}.nom`]}>
                                <input
                                    name={`traductions.${lang}.nom`}
                                    maxLength={160}
                                    defaultValue={experience?.traductions[lang].nom}
                                    className={classeChamp}
                                />
                            </Champ>
                            <Champ label="Lieu / établissement">
                                <input
                                    name={`traductions.${lang}.lieu`}
                                    maxLength={160}
                                    defaultValue={experience?.traductions[lang].lieu}
                                    className={classeChamp}
                                />
                            </Champ>
                            <Champ label="Description">
                                <textarea
                                    name={`traductions.${lang}.description`}
                                    rows={4}
                                    maxLength={5000}
                                    defaultValue={experience?.traductions[lang].description}
                                    className={classeChamp}
                                />
                            </Champ>
                        </fieldset>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Bouton type="submit" disabled={enCours}>
                        {enCours ? "Enregistrement…" : experience ? "Enregistrer" : "Ajouter l'expérience"}
                    </Bouton>
                    <MessageResultat resultat={resultat} />
                </div>
            </form>

            {experience && (
                <div className="border-t border-foreground/10 pt-4">
                    <BoutonSupprimer
                        id={experience.id}
                        action={supprimerExperience}
                        libelle={experience.traductions[LOCALE_PAR_DEFAUT].nom}
                    />
                </div>
            )}
        </div>
    );
}
