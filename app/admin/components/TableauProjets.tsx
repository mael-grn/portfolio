"use client";

import { useMemo, useState } from "react";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import type { ProjetAdmin } from "@/app/modeles/Projet";
import { LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import FormulaireProjet from "@/app/admin/components/FormulaireProjet";
import TiroirAdmin from "@/app/admin/components/TiroirAdmin";
import TableauAdmin, { ColonneTableau } from "@/app/admin/components/TableauAdmin";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";

interface TableauProjetsProps {
    projets: ProjetAdmin[];
    competencesOptions: { id: string; nom: string }[];
}

type ColonneTri = "titre" | "periode" | "taille" | "images" | "ordre";
type SensTri = "asc" | "desc";

export default function TableauProjets({ projets, competencesOptions }: TableauProjetsProps) {
    const [triCol, setTriCol] = useState<ColonneTri>("ordre");
    const [triSens, setTriSens] = useState<SensTri>("asc");

    // Gestion des popups de création et de modification
    const [creationOuverte, setCreationOuverte] = useState(false);
    const [projetEnEdition, setProjetEnEdition] = useState<ProjetAdmin | null>(null);

    function toggleTri(col: ColonneTri) {
        if (triCol === col) {
            setTriSens((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setTriCol(col);
            setTriSens(col === "titre" ? "asc" : "desc");
        }
    }

    const projetsTries = useMemo(() => {
        return [...projets].sort((a, b) => {
            let res = 0;
            switch (triCol) {
                case "titre":
                    res = (a.traductions[LOCALE_PAR_DEFAUT]?.nom || "").localeCompare(
                        b.traductions[LOCALE_PAR_DEFAUT]?.nom || ""
                    );
                    break;
                case "periode":
                    res = new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
                    break;
                case "taille":
                    res = a.taille - b.taille;
                    break;
                case "images":
                    res = a.images.length - b.images.length;
                    break;
                case "ordre":
                default:
                    res = a.ordre - b.ordre;
                    break;
            }
            return triSens === "asc" ? res : -res;
        });
    }, [projets, triCol, triSens]);

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

    const colonnes: ColonneTableau<ProjetAdmin>[] = [
        {
            cle: "titre",
            largeur: "1.5fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("titre")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-left font-semibold"
                >
                    <span>Projet</span>
                    {renderIndicateurTri("titre")}
                </button>
            ),
            cellule: (p) => (
                <div className="flex items-center gap-2.5 font-semibold text-foreground tracking-tight truncate">
                    <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: p.couleur || "#20272e" }}
                    />
                    <span className="truncate">{p.traductions[LOCALE_PAR_DEFAUT]?.nom || "Sans titre"}</span>
                </div>
            ),
        },
        {
            cle: "periode",
            largeur: "1.3fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("periode")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-left font-semibold"
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
        {
            cle: "taille",
            largeur: "100px",
            alignement: "centre",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("taille")}
                    className="flex items-center justify-center gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none whitespace-nowrap font-semibold w-full"
                >
                    <span>Gabarit</span>
                    {renderIndicateurTri("taille")}
                </button>
            ),
            cellule: (p) => (
                <span className="text-xs font-mono text-primary font-semibold">
                    Taille {p.taille}
                </span>
            ),
        },
        {
            cle: "images",
            largeur: "100px",
            alignement: "centre",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("images")}
                    className="flex items-center justify-center gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none whitespace-nowrap font-semibold w-full"
                >
                    <span>Images</span>
                    {renderIndicateurTri("images")}
                </button>
            ),
            cellule: (p) => (
                <span className="text-xs font-mono text-foreground/75">
                    {p.images.length} photo{p.images.length > 1 ? "s" : ""}
                </span>
            ),
        },
        {
            cle: "ordre",
            largeur: "90px",
            alignement: "droite",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("ordre")}
                    className="flex items-center justify-end gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none whitespace-nowrap font-semibold w-full"
                >
                    <span>Ordre</span>
                    {renderIndicateurTri("ordre")}
                </button>
            ),
            cellule: (p) => (
                <span className="text-xs font-mono text-foreground/60">
                    #{p.ordre}
                </span>
            ),
        },
    ];

    return (
        <section className="flex flex-col gap-6 select-none">
            {/* En-tête avec titre et bouton d'ajout alignés */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Projets
                </h1>

                <BoutonAdmin
                    rond
                    icone={<PlusIcon className="w-5 h-5" />}
                    titre="Nouveau projet"
                    onClick={() => setCreationOuverte(true)}
                />
            </div>

            {/* Tableau classique aux couleurs claires */}
            <TableauAdmin
                colonnes={colonnes}
                donnees={projetsTries}
                cleLigne={(p) => p.id}
                onClicLigne={(p) => setProjetEnEdition(p)}
                messageVide="Aucun projet enregistré pour le moment."
                largeurMin="min-w-[820px]"
            />

            {/* Menu latéral de création */}
            <TiroirAdmin
                ouvert={creationOuverte}
                onFermer={() => setCreationOuverte(false)}
                titre="Nouveau projet"
            >
                <FormulaireProjet
                    competences={competencesOptions}
                    onFermer={() => setCreationOuverte(false)}
                />
            </TiroirAdmin>

            {/* Menu latéral de modification */}
            <TiroirAdmin
                ouvert={projetEnEdition !== null}
                onFermer={() => setProjetEnEdition(null)}
                titre={projetEnEdition ? `Modifier ${projetEnEdition.traductions[LOCALE_PAR_DEFAUT]?.nom || "le projet"}` : "Modifier le projet"}
            >
                {projetEnEdition && (
                    <FormulaireProjet
                        key={projetEnEdition.id}
                        projet={projetEnEdition}
                        competences={competencesOptions}
                        onFermer={() => setProjetEnEdition(null)}
                    />
                )}
            </TiroirAdmin>
        </section>
    );
}
