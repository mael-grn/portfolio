"use client";

import { useActionState } from "react";
import Image from "next/image";
import { enregistrerCompetence, supprimerCompetence } from "@/app/admin/actions/competences";
import BoutonSupprimer from "@/app/admin/components/BoutonSupprimer";
import { Bouton, Champ, MessageResultat, classeChamp } from "@/app/admin/components/ui";
import { estSvg } from "@/app/lib/media";
import type { CompetenceAdmin } from "@/app/modeles/Competence";

export interface OptionCategorie {
    valeur: string;
    libelle: string;
}

export default function FormulaireCompetence({
    competence, categories,
}: { competence?: CompetenceAdmin; categories: OptionCategorie[] }) {
    const [resultat, action, enCours] = useActionState(enregistrerCompetence, null);
    const erreurs = resultat && !resultat.ok ? (resultat.erreurs ?? {}) : {};

    return (
        <div className="flex flex-col gap-4">
            <form action={action} className="grid gap-4 sm:grid-cols-2">
                {competence && <input type="hidden" name="id" value={competence.id} />}

                <Champ label="Nom" erreur={erreurs.nom}>
                    <input name="nom" required maxLength={80} defaultValue={competence?.nom} className={classeChamp} />
                </Champ>

                <Champ label="Catégorie" erreur={erreurs.categorie}>
                    <select name="categorie" defaultValue={competence?.categorie ?? categories[0]?.valeur} className={classeChamp}>
                        {categories.map((c) => <option key={c.valeur} value={c.valeur}>{c.libelle}</option>)}
                    </select>
                </Champ>

                <Champ label="Maîtrise (0 à 5)" erreur={erreurs.maitrise}>
                    <input name="maitrise" type="number" min={0} max={5} required defaultValue={competence?.maitrise ?? 3} className={classeChamp} />
                </Champ>

                <Champ label="Ordre d'affichage" erreur={erreurs.ordre}>
                    <input name="ordre" type="number" min={0} max={9999} defaultValue={competence?.ordre ?? 0} className={classeChamp} />
                </Champ>

                <div className="flex flex-col gap-2 sm:col-span-2">
                    <Champ label="Logo (PNG, JPEG, WebP, GIF ou SVG, 4 Mo max)">
                        <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className={classeChamp} />
                    </Champ>
                    {competence?.logoUrl && (
                        <div className="flex items-center gap-3 text-sm">
                            <Image
                                src={competence.logoUrl}
                                alt={`Logo actuel de ${competence.nom}`}
                                width={40}
                                height={40}
                                unoptimized={competence.logoChemin ? estSvg(competence.logoChemin) : false}
                                className="h-10 w-10 rounded-sm object-contain"
                            />
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="supprimerLogo" /> Supprimer le logo actuel
                            </label>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                    <Bouton type="submit" disabled={enCours}>
                        {enCours ? "Enregistrement…" : competence ? "Enregistrer" : "Ajouter la compétence"}
                    </Bouton>
                    <MessageResultat resultat={resultat} />
                </div>
            </form>

            {competence && (
                <div className="border-t border-foreground/10 pt-4">
                    {competence.nombreProjets > 0 && (
                        <p className="mb-2 text-xs text-foreground/60">
                            Utilisée dans {competence.nombreProjets} projet(s) : la supprimer la retirera de ces projets.
                        </p>
                    )}
                    <BoutonSupprimer id={competence.id} action={supprimerCompetence} libelle={competence.nom} />
                </div>
            )}
        </div>
    );
}
