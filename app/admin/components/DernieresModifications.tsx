"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import type { EntreeJournal } from "@/app/modeles/JournalActivite";
import TableauAdmin, { ColonneTableau } from "@/app/admin/components/TableauAdmin";

interface DernieresModificationsProps {
    modifications: EntreeJournal[];
}

type ColonneTri = "action" | "entite" | "cibleNom" | "auteur" | "date";
type SensTri = "asc" | "desc";

const LIBELLES_ENTITE: Record<string, string> = {
    competence: "Compétence",
    projet: "Projet",
    experience: "Expérience",
    parcours: "Parcours",
};

const LIBELLES_ACTION: Record<string, { libelle: string; couleurBadge: string }> = {
    creation: {
        libelle: "Création",
        couleurBadge: "bg-[#43654f]/15 text-[#2d5639] border border-[#43654f]/30",
    },
    modification: {
        libelle: "Modification",
        couleurBadge: "bg-[#3f7694]/15 text-[#25506a] border border-[#3f7694]/30",
    },
    suppression: {
        libelle: "Suppression",
        couleurBadge: "bg-red-800/15 text-red-800 border border-red-800/30",
    },
};

function formaterHorodatage(dateIso: string): string {
    try {
        const d = new Date(dateIso);
        if (isNaN(d.getTime())) return dateIso;
        const jour = String(d.getDate()).padStart(2, "0");
        const mois = String(d.getMonth() + 1).padStart(2, "0");
        const annee = d.getFullYear();
        const heures = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${jour}/${mois}/${annee} à ${heures}:${minutes}`;
    } catch {
        return dateIso;
    }
}

export default function DernieresModifications({ modifications }: DernieresModificationsProps) {
    const [filtreAction, setFiltreAction] = useState<string>("tous");
    const [filtreEntite, setFiltreEntite] = useState<string>("tous");
    const [triCol, setTriCol] = useState<ColonneTri>("date");
    const [triSens, setTriSens] = useState<SensTri>("desc");

    function toggleTri(col: ColonneTri) {
        if (triCol === col) {
            setTriSens((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setTriCol(col);
            setTriSens(col === "date" ? "desc" : "asc");
        }
    }

    const modificationsFiltreesEtTriees = useMemo(() => {
        const filtrees = modifications.filter((m) => {
            if (filtreAction !== "tous" && m.typeAction !== filtreAction) return false;
            if (filtreEntite !== "tous" && m.entite !== filtreEntite) return false;
            return true;
        });

        return filtrees.sort((a, b) => {
            let res = 0;
            switch (triCol) {
                case "action":
                    res = a.typeAction.localeCompare(b.typeAction);
                    break;
                case "entite":
                    res = a.entite.localeCompare(b.entite);
                    break;
                case "cibleNom":
                    res = a.cibleNom.localeCompare(b.cibleNom);
                    break;
                case "auteur":
                    res = a.auteurNom.localeCompare(b.auteurNom);
                    break;
                case "date":
                default:
                    res = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
            }
            return triSens === "asc" ? res : -res;
        });
    }, [modifications, filtreAction, filtreEntite, triCol, triSens]);

    const aFiltreActif = filtreAction !== "tous" || filtreEntite !== "tous";

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

    const colonnes: ColonneTableau<EntreeJournal>[] = [
        {
            cle: "action",
            largeur: "180px",
            entete: (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                        type="button"
                        onClick={() => toggleTri("action")}
                        className="flex items-center gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none select-none font-semibold"
                    >
                        <span>Action</span>
                        {renderIndicateurTri("action")}
                    </button>
                    <select
                        value={filtreAction}
                        onChange={(e) => setFiltreAction(e.target.value)}
                        aria-label="Filtrer par action"
                        className="bg-white text-[11px] rounded-md px-2 py-0.5 text-foreground/80 border border-hairline/60 cursor-pointer focus:outline-none shadow-2xs"
                    >
                        <option value="tous">Tout</option>
                        <option value="creation">Création</option>
                        <option value="modification">Modif</option>
                        <option value="suppression">Suppr</option>
                    </select>
                </div>
            ),
            cellule: (item) => {
                const actionInfo = LIBELLES_ACTION[item.typeAction] ?? {
                    libelle: item.typeAction,
                    couleurBadge: "bg-foreground/10 text-foreground border border-foreground/20",
                };
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${actionInfo.couleurBadge}`}
                    >
                        {actionInfo.libelle}
                    </span>
                );
            },
        },
        {
            cle: "entite",
            largeur: "180px",
            entete: (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                        type="button"
                        onClick={() => toggleTri("entite")}
                        className="flex items-center gap-1 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none select-none font-semibold"
                    >
                        <span>Entité</span>
                        {renderIndicateurTri("entite")}
                    </button>
                    <select
                        value={filtreEntite}
                        onChange={(e) => setFiltreEntite(e.target.value)}
                        aria-label="Filtrer par entité"
                        className="bg-white text-[11px] rounded-md px-2 py-0.5 text-foreground/80 border border-hairline/60 cursor-pointer focus:outline-none shadow-2xs"
                    >
                        <option value="tous">Tout</option>
                        <option value="competence">Comp.</option>
                        <option value="projet">Projets</option>
                        <option value="experience">Exp.</option>
                        <option value="parcours">Parcours</option>
                    </select>
                </div>
            ),
            cellule: (item) => (
                <span className="text-xs font-medium text-foreground/75 truncate">
                    {LIBELLES_ENTITE[item.entite] ?? item.entite}
                </span>
            ),
        },
        {
            cle: "cibleNom",
            largeur: "1fr",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("cibleNom")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none select-none text-left font-semibold"
                >
                    <span>Élément</span>
                    {renderIndicateurTri("cibleNom")}
                </button>
            ),
            cellule: (item) => (
                <span className="font-semibold text-foreground tracking-tight truncate pr-4">
                    {item.cibleNom}
                </span>
            ),
        },
        {
            cle: "auteur",
            largeur: "150px",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("auteur")}
                    className="flex items-center gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none select-none text-left font-semibold"
                >
                    <span>Auteur</span>
                    {renderIndicateurTri("auteur")}
                </button>
            ),
            cellule: (item) => (
                <div className="flex items-center gap-2 text-xs font-medium text-foreground/90 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>Par {item.auteurNom}</span>
                </div>
            ),
        },
        {
            cle: "date",
            largeur: "170px",
            alignement: "droite",
            entete: (
                <button
                    type="button"
                    onClick={() => toggleTri("date")}
                    className="flex items-center justify-end gap-1.5 text-foreground/75 hover:text-foreground cursor-pointer focus:outline-none select-none text-right font-semibold w-full"
                >
                    <span>Date & Heure</span>
                    {renderIndicateurTri("date")}
                </button>
            ),
            cellule: (item) => (
                <span className="font-mono text-foreground/60 text-[11px]">
                    {formaterHorodatage(item.createdAt)}
                </span>
            ),
        },
    ];

    return (
        <section className="flex flex-col gap-5 select-none">
            {/* Titre */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Dernières modifications
                </h2>
                {aFiltreActif && (
                    <motion.button
                        whileHover={{ opacity: 0.85 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setFiltreAction("tous");
                            setFiltreEntite("tous");
                        }}
                        className="rounded-full bg-foreground/10 hover:bg-foreground/15 text-foreground px-3.5 py-1 text-xs font-sans font-medium cursor-pointer focus:outline-none transition-colors"
                    >
                        Réinitialiser les filtres ({modificationsFiltreesEtTriees.length}/{modifications.length})
                    </motion.button>
                )}
            </div>

            {/* Tableau classique aux couleurs claires */}
            <TableauAdmin
                colonnes={colonnes}
                donnees={modificationsFiltreesEtTriees}
                cleLigne={(item) => item.id}
                messageVide="Aucune modification ne correspond aux filtres sélectionnés."
                largeurMin="min-w-[820px]"
            />
        </section>
    );
}
