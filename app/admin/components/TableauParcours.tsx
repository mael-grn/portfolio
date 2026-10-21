"use client";

import { useMemo, useState } from "react";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import type { ParcoursAdmin } from "@/app/modeles/Parcours";
import { LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import FormulaireParcours from "@/app/admin/components/FormulaireParcours";
import TiroirAdmin from "@/app/admin/components/TiroirAdmin";
import TableauAdmin, { ColonneTableau } from "@/app/admin/components/TableauAdmin";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";

interface TableauParcoursProps {
    parcours: ParcoursAdmin[];
}

type ColonneTri = "diplome" | "etablissement" | "periode";
type SensTri = "asc" | "desc";

export default function TableauParcours({ parcours }: TableauParcoursProps) {
    const [triCol, setTriCol] = useState<ColonneTri>("periode");
    const [triSens, setTriSens] = useState<SensTri>("desc");

    // Gestion des tiroirs de création et de modification
    const [creationOuverte, setCreationOuverte] = useState(false);
    const [parcoursEnEdition, setParcoursEnEdition] = useState<ParcoursAdmin | null>(null);

    function toggleTri(col: ColonneTri) {
        if (triCol === col) {
            setTriSens((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setTriCol(col);
            setTriSens(col === "periode" ? "desc" : "asc");
        }
    }

    const parcoursTries = useMemo(() => {
        return [...parcours].sort((a, b) => {
            let res = 0;
            switch (triCol) {
                case "diplome":
                    res = (a.traductions[LOCALE_PAR_DEFAUT]?.nom || "").localeCompare(
                        b.traductions[LOCALE_PAR_DEFAUT]?.nom || ""
                    );
                    break;
                case "etablissement":
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
    }, [parcours, triCol, triSens]);

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

    const colonnes: ColonneTableau<ParcoursAdmin>[] = [
        {
            cle: "diplome",
            largeur: "1.6fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("diplome")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-left font-semibold"
                >
                    <span>Diplôme</span>
                    {renderIndicateurTri("diplome")}
                </button>
            ),
            cellule: (p) => (
                <span className="font-semibold text-foreground tracking-tight truncate">
                    {p.traductions[LOCALE_PAR_DEFAUT]?.nom || "Sans titre"}
                </span>
            ),
        },
        {
            cle: "etablissement",
            largeur: "1.3fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("etablissement")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-left font-semibold"
                >
                    <span>Établissement</span>
                    {renderIndicateurTri("etablissement")}
                </button>
            ),
            cellule: (p) => (
                <span className="text-xs text-foreground/75 truncate">
                    {p.traductions[LOCALE_PAR_DEFAUT]?.lieu || "Non renseigné"}
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
            cellule: (p) => (
                <span className="text-xs font-mono text-foreground/75 truncate">
                    {p.dateDebut} → {p.dateFin ?? "en cours"}
                </span>
            ),
        },
    ];

    return (
        <section className="flex flex-col gap-6 select-none">
            {/* En-tête avec titre et bouton d'ajout alignés */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Parcours
                </h1>

                <BoutonAdmin
                    rond
                    icone={<PlusIcon className="w-5 h-5" />}
                    titre="Nouveau parcours"
                    onClick={() => setCreationOuverte(true)}
                />
            </div>

            {/* Tableau classique aux couleurs claires */}
            <TableauAdmin
                colonnes={colonnes}
                donnees={parcoursTries}
                cleLigne={(p) => p.id}
                onClicLigne={(p) => setParcoursEnEdition(p)}
                messageVide="Aucun élément de parcours enregistré pour le moment."
                largeurMin="min-w-[760px]"
            />

            {/* Menu latéral de création */}
            <TiroirAdmin
                ouvert={creationOuverte}
                onFermer={() => setCreationOuverte(false)}
                titre="Nouveau parcours"
            >
                <FormulaireParcours onFermer={() => setCreationOuverte(false)} />
            </TiroirAdmin>

            {/* Menu latéral de modification */}
            <TiroirAdmin
                ouvert={parcoursEnEdition !== null}
                onFermer={() => setParcoursEnEdition(null)}
                titre={parcoursEnEdition ? `Modifier ${parcoursEnEdition.traductions[LOCALE_PAR_DEFAUT]?.nom || "le parcours"}` : "Modifier le parcours"}
            >
                {parcoursEnEdition && (
                    <FormulaireParcours
                        key={parcoursEnEdition.id}
                        parcours={parcoursEnEdition}
                        onFermer={() => setParcoursEnEdition(null)}
                    />
                )}
            </TiroirAdmin>
        </section>
    );
}
