"use client";

import { useActionState, useEffect, useState } from "react";
import { PlusIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { enregistrerCompetence, supprimerCompetence } from "@/app/admin/actions/competences";
import BoutonSupprimer from "@/app/admin/components/BoutonSupprimer";
import { MessageResultat } from "@/app/admin/components/ui";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";
import {
    ChampSaisie,
    ChampSelection,
    ChampImage,
} from "@/app/admin/components/ChampsFormulaire";
import type { CompetenceAdmin } from "@/app/modeles/Competence";

export interface OptionCategorie {
    valeur: string;
    libelle: string;
}

export default function FormulaireCompetence({
    competence,
    categories,
    onFermer,
}: {
    competence?: CompetenceAdmin;
    categories: OptionCategorie[];
    onFermer?: () => void;
}) {
    const [resultat, action, enCours] = useActionState(enregistrerCompetence, null);
    const [televersementEnCours, setTeleversementEnCours] = useState(false);
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
            {competence && <input type="hidden" name="id" value={competence.id} />}

            <div className="flex-1 px-6 sm:px-8 py-4 space-y-6">
                {/* Disposition 100% verticale sans aucun élément côte à côte */}
                <div className="flex flex-col gap-5">
                    <ChampSaisie
                        label="Nom de la compétence"
                        name="nom"
                        required
                        maxLength={80}
                        defaultValue={competence?.nom}
                        placeholder="ex. TypeScript, PostgreSQL..."
                        erreur={erreurs.nom}
                    />

                    <ChampSelection
                        label="Catégorie"
                        name="categorie"
                        options={categories}
                        valeurParDefaut={competence?.categorie ?? categories[0]?.valeur}
                        erreur={erreurs.categorie}
                    />

                    <ChampSaisie
                        label="Niveau de maîtrise (0 à 5)"
                        name="maitrise"
                        type="number"
                        min={0}
                        max={5}
                        required
                        defaultValue={competence?.maitrise ?? 3}
                        erreur={erreurs.maitrise}
                    />

                    <ChampSaisie
                        label="Ordre d'affichage"
                        name="ordre"
                        type="number"
                        min={0}
                        max={9999}
                        defaultValue={competence?.ordre ?? 0}
                        erreur={erreurs.ordre}
                    />

                    <ChampImage
                        label="Logo (PNG, JPEG, WebP, GIF ou SVG, 4 Mo max)"
                        name="logoChemin"
                        dossier="competences"
                        referenceInitiale={competence?.logoChemin}
                        urlInitiale={competence?.logoUrl}
                        onTeleversementChange={setTeleversementEnCours}
                        erreur={erreurs.logo}
                    />
                </div>

                {competence && competence.nombreProjets > 0 && (
                    <div className="p-3.5 rounded-[10px] border border-hairline/40 bg-foreground/[0.02] text-xs font-sans text-muted-rock">
                        Cette compétence est associée à {competence.nombreProjets} projet{competence.nombreProjets > 1 ? "s" : ""}. La supprimer la détachera de ces projets.
                    </div>
                )}
            </div>

            {/* Barre d'action fixe en bas */}
            <div className="sticky bottom-0 z-20 px-6 py-4 sm:px-8 bg-white/95 backdrop-blur-md border-t border-hairline/20 flex items-center justify-between gap-4">
                <div>
                    {competence ? (
                        <BoutonSupprimer
                            id={competence.id}
                            action={supprimerCompetence}
                            libelle={competence.nom}
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
                        icone={competence ? <PencilSquareIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                        texte={competence ? "Modifier" : "Ajouter"}
                    />
                </div>
            </div>
        </form>
    );
}
