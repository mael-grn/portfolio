"use client";

import { useMemo, useState } from "react";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import type { ExperienceAdmin } from "@/app/modeles/Experience";
import { LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import FormulaireExperience from "@/app/admin/components/FormulaireExperience";
import TiroirAdmin from "@/app/admin/components/TiroirAdmin";
import TableauAdmin, { ColonneTableau } from "@/app/admin/components/TableauAdmin";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";

interface TableauExperiencesProps {
    experiences: ExperienceAdmin[];
}

type ColonneTri = "intitule" | "lieu" | "periode";
type SensTri = "asc" | "desc";

export default function TableauExperiences({ experiences }: TableauExperiencesProps) {
    const [triCol, setTriCol] = useState<ColonneTri>("periode");
    const [triSens, setTriSens] = useState<SensTri>("desc");

    // Gestion des popups de création et de modification
    const [creationOuverte, setCreationOuverte] = useState(false);
    const [experienceEnEdition, setExperienceEnEdition] = useState<ExperienceAdmin | null>(null);

    function toggleTri(col: ColonneTri) {
        if (triCol === col) {
            setTriSens((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setTriCol(col);
            setTriSens(col === "periode" ? "desc" : "asc");
        }
    }

    const experiencesTriees = useMemo(() => {
        return [...experiences].sort((a, b) => {
            let res = 0;
            switch (triCol) {
                case "intitule":
                    res = (a.traductions[LOCALE_PAR_DEFAUT]?.nom || "").localeCompare(
                        b.traductions[LOCALE_PAR_DEFAUT]?.nom || ""
                    );
                    break;
                case "lieu":
                    res = (a.traductions[LOCALE_PAR_DEFAUT]?.lieu || "").localeCompare(
                        b.traductions[LOCALE_PAR_DEFAUT]?.lieu || ""
                    );
                    break;
                case "periode":
                default:
                    res = new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
                    break;
            }
            return triSens === "asc" ? res : -res;
        });
    }, [experiences, triCol, triSens]);

    function renderIndicateurTri(col: ColonneTri) {
        if (triCol !== col) {
            return <ChevronUpDownIcon className="w-3.5 h-3.5 text-current opacity-40 shrink-0" />;
        }
        return triSens === "asc" ? (
            <ChevronUpIcon className="w-3.5 h-3.5 text-current shrink-0" />
        ) : (
            <ChevronDownIcon className="w-3.5 h-3.5 text-current shrink-0" />
        );
    }

    const colonnes: ColonneTableau<ExperienceAdmin>[] = [
        {
            cle: "intitule",
            largeur: "1.6fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("intitule")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-left font-semibold"
                >
                    <span>Poste</span>
                    {renderIndicateurTri("intitule")}
                </button>
            ),
            cellule: (e) => (
                <span className="font-semibold text-foreground tracking-tight truncate">
                    {e.traductions[LOCALE_PAR_DEFAUT]?.nom || "Sans titre"}
                </span>
            ),
        },
        {
            cle: "lieu",
            largeur: "1.3fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("lieu")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-left font-semibold"
                >
                    <span>Entreprise</span>
                    {renderIndicateurTri("lieu")}
                </button>
            ),
            cellule: (e) => (
                <span className="text-xs text-foreground/75 truncate">
                    {e.traductions[LOCALE_PAR_DEFAUT]?.lieu || "Non renseigné"}
                </span>
            ),
        },
        {
            cle: "periode",
            largeur: "1.1fr",
            alignement: "droite",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("periode")}
                    className="flex items-center justify-end gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-right font-semibold w-full"
                >
                    <span>Période</span>
                    {renderIndicateurTri("periode")}
                </button>
            ),
            cellule: (e) => (
                <span className="text-xs font-mono text-foreground/75 truncate">
                    {e.dateDebut} → {e.dateFin ?? "en cours"}
                </span>
            ),
        },
    ];

    return (
        <section className="flex flex-col gap-6 select-none">
            {/* En-tête avec titre et bouton d'ajout alignés */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Expériences
                </h1>

                <BoutonAdmin
                    rond
                    icone={<PlusIcon className="w-5 h-5" />}
                    titre="Nouvelle expérience"
                    onClick={() => setCreationOuverte(true)}
                />
            </div>

            {/* Tableau classique aux couleurs claires */}
            <TableauAdmin
                colonnes={colonnes}
                donnees={experiencesTriees}
                cleLigne={(e) => e.id}
                onClicLigne={(e) => setExperienceEnEdition(e)}
                messageVide="Aucune expérience enregistrée pour le moment."
                largeurMin="min-w-[760px]"
            />

            {/* Menu latéral de création */}
            <TiroirAdmin
                ouvert={creationOuverte}
                onFermer={() => setCreationOuverte(false)}
                titre="Nouvelle expérience"
            >
                <FormulaireExperience onFermer={() => setCreationOuverte(false)} />
            </TiroirAdmin>

            {/* Menu latéral de modification */}
            <TiroirAdmin
                ouvert={experienceEnEdition !== null}
                onFermer={() => setExperienceEnEdition(null)}
                titre={experienceEnEdition ? `Modifier ${experienceEnEdition.traductions[LOCALE_PAR_DEFAUT]?.nom || "l'expérience"}` : "Modifier l'expérience"}
            >
                {experienceEnEdition && (
                    <FormulaireExperience
                        key={experienceEnEdition.id}
                        experience={experienceEnEdition}
                        onFermer={() => setExperienceEnEdition(null)}
                    />
                )}
            </TiroirAdmin>
        </section>
    );
}
