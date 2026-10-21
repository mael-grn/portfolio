"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import type { CompetenceAdmin, CategorieCompetence } from "@/app/modeles/Competence";
import FormulaireCompetence from "@/app/admin/components/FormulaireCompetence";
import TiroirAdmin from "@/app/admin/components/TiroirAdmin";
import TableauAdmin, { ColonneTableau } from "@/app/admin/components/TableauAdmin";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";

interface TableauCompetencesProps {
    competences: CompetenceAdmin[];
    categories: { valeur: CategorieCompetence; libelle: string }[];
}

type ColonneTri = "nom" | "categorie" | "maitrise" | "ordre" | "projets";
type SensTri = "asc" | "desc";

export default function TableauCompetences({ competences, categories }: TableauCompetencesProps) {
    const [filtreCategorie, setFiltreCategorie] = useState<string>("tous");
    const [triCol, setTriCol] = useState<ColonneTri>("ordre");
    const [triSens, setTriSens] = useState<SensTri>("asc");

    // Gestion des popups de création et de modification
    const [creationOuverte, setCreationOuverte] = useState(false);
    const [competenceEnEdition, setCompetenceEnEdition] = useState<CompetenceAdmin | null>(null);

    const categoriesMap = useMemo(() => {
        return Object.fromEntries(categories.map((c) => [c.valeur, c.libelle]));
    }, [categories]);

    function toggleTri(col: ColonneTri) {
        if (triCol === col) {
            setTriSens((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setTriCol(col);
            setTriSens(col === "nom" || col === "categorie" ? "asc" : "desc");
        }
    }

    const competencesFiltreesEtTriees = useMemo(() => {
        const filtrees = competences.filter((c) => {
            if (filtreCategorie !== "tous" && c.categorie !== filtreCategorie) return false;
            return true;
        });

        return filtrees.sort((a, b) => {
            let res = 0;
            switch (triCol) {
                case "nom":
                    res = a.nom.localeCompare(b.nom);
                    break;
                case "categorie":
                    res = a.categorie.localeCompare(b.categorie);
                    break;
                case "maitrise":
                    res = a.maitrise - b.maitrise;
                    break;
                case "ordre":
                    res = a.ordre - b.ordre;
                    break;
                case "projets":
                default:
                    res = a.nombreProjets - b.nombreProjets;
                    break;
            }
            return triSens === "asc" ? res : -res;
        });
    }, [competences, filtreCategorie, triCol, triSens]);

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

    const colonnes: ColonneTableau<CompetenceAdmin>[] = [
        {
            cle: "nom",
            largeur: "1.5fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("nom")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none text-left font-semibold"
                >
                    <span>Compétence</span>
                    {renderIndicateurTri("nom")}
                </button>
            ),
            cellule: (c) => (
                <div className="flex items-center gap-3 font-semibold text-foreground tracking-tight truncate">
                    {c.logoUrl && (
                        <div className="relative w-6 h-6 shrink-0 rounded-md overflow-hidden bg-foreground/5 p-0.5">
                            <Image
                                src={c.logoUrl}
                                alt=""
                                width={24}
                                height={24}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    )}
                    <span className="truncate">{c.nom}</span>
                </div>
            ),
        },
        {
            cle: "categorie",
            largeur: "1.2fr",
            entete: (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                        type="button"
                        onClick={() => toggleTri("categorie")}
                        className="flex items-center gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none font-semibold"
                    >
                        <span>Catégorie</span>
                        {renderIndicateurTri("categorie")}
                    </button>
                    <select
                        value={filtreCategorie}
                        onChange={(e) => setFiltreCategorie(e.target.value)}
                        aria-label="Filtrer par catégorie"
                        className="bg-white text-[11px] rounded-md px-2 py-0.5 text-foreground/80 border border-hairline/60 cursor-pointer focus:outline-none shadow-2xs"
                    >
                        <option value="tous">Toutes</option>
                        {categories.map((cat) => (
                            <option key={cat.valeur} value={cat.valeur}>
                                {cat.libelle}
                            </option>
                        ))}
                    </select>
                </div>
            ),
            cellule: (c) => (
                <span className="text-xs font-medium text-foreground/75 truncate">
                    {categoriesMap[c.categorie] ?? c.categorie}
                </span>
            ),
        },
        {
            cle: "maitrise",
            largeur: "110px",
            alignement: "centre",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("maitrise")}
                    className="flex items-center justify-center gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none whitespace-nowrap font-semibold w-full"
                >
                    <span>Maîtrise</span>
                    {renderIndicateurTri("maitrise")}
                </button>
            ),
            cellule: (c) => (
                <span className="text-xs font-mono font-semibold text-primary">
                    {c.maitrise} / 5
                </span>
            ),
        },
        {
            cle: "ordre",
            largeur: "90px",
            alignement: "centre",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("ordre")}
                    className="flex items-center justify-center gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none whitespace-nowrap font-semibold w-full"
                >
                    <span>Ordre</span>
                    {renderIndicateurTri("ordre")}
                </button>
            ),
            cellule: (c) => (
                <span className="text-xs font-mono text-foreground/60">
                    #{c.ordre}
                </span>
            ),
        },
        {
            cle: "projets",
            largeur: "120px",
            alignement: "droite",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("projets")}
                    className="flex items-center justify-end gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none whitespace-nowrap font-semibold w-full"
                >
                    <span>Projets</span>
                    {renderIndicateurTri("projets")}
                </button>
            ),
            cellule: (c) => (
                <span className="text-xs font-mono text-foreground/75">
                    {c.nombreProjets} projet{c.nombreProjets > 1 ? "s" : ""}
                </span>
            ),
        },
    ];

    return (
        <section className="flex flex-col gap-6 select-none">
            {/* En-tête avec titre et bouton d'ajout alignés */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Compétences
                </h1>

                <div className="flex items-center gap-3">
                    {filtreCategorie !== "tous" && (
                        <motion.button
                            whileHover={{ opacity: 0.85 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFiltreCategorie("tous")}
                            className="rounded-full bg-foreground/10 hover:bg-foreground/15 text-foreground px-3.5 py-1 text-xs font-sans font-medium cursor-pointer focus:outline-none transition-colors"
                        >
                            Réinitialiser le filtre ({competencesFiltreesEtTriees.length}/{competences.length})
                        </motion.button>
                    )}

                    <BoutonAdmin
                        rond
                        icone={<PlusIcon className="w-5 h-5" />}
                        titre="Nouvelle compétence"
                        onClick={() => setCreationOuverte(true)}
                    />
                </div>
            </div>

            {/* Tableau classique aux couleurs claires */}
            <TableauAdmin
                colonnes={colonnes}
                donnees={competencesFiltreesEtTriees}
                cleLigne={(c) => c.id}
                onClicLigne={(c) => setCompetenceEnEdition(c)}
                messageVide="Aucune compétence ne correspond au filtre sélectionné."
                largeurMin="min-w-[820px]"
            />

            {/* Menu latéral de création */}
            <TiroirAdmin
                ouvert={creationOuverte}
                onFermer={() => setCreationOuverte(false)}
                titre="Nouvelle compétence"
            >
                <FormulaireCompetence
                    categories={categories}
                    onFermer={() => setCreationOuverte(false)}
                />
            </TiroirAdmin>

            {/* Menu latéral de modification */}
            <TiroirAdmin
                ouvert={competenceEnEdition !== null}
                onFermer={() => setCompetenceEnEdition(null)}
                titre={competenceEnEdition ? `Modifier ${competenceEnEdition.nom}` : "Modifier la compétence"}
            >
                {competenceEnEdition && (
                    <FormulaireCompetence
                        key={competenceEnEdition.id}
                        competence={competenceEnEdition}
                        categories={categories}
                        onFermer={() => setCompetenceEnEdition(null)}
                    />
                )}
            </TiroirAdmin>
        </section>
    );
}
