"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ColonneTableau<T> {
    cle: string;
    entete: ReactNode;
    largeur?: string;
    alignement?: "gauche" | "centre" | "droite";
    cellule: (item: T, index: number) => ReactNode;
    className?: string;
}

interface TableauAdminProps<T> {
    colonnes: ColonneTableau<T>[];
    donnees: T[];
    cleLigne: (item: T) => string;
    onClicLigne?: (item: T) => void;
    messageVide?: string;
    grilleCols?: string;
    largeurMin?: string;
    className?: string;
}

/**
 * Composant de tableau classique réutilisable pour l'administration.
 * Présentation sobre et claire, avec en-tête clair, séparateurs fins, et animations Framer Motion layout.
 */
export default function TableauAdmin<T>({
    colonnes,
    donnees,
    cleLigne,
    onClicLigne,
    messageVide = "Aucun élément à afficher.",
    grilleCols,
    largeurMin = "min-w-[760px]",
    className = "",
}: TableauAdminProps<T>) {
    const gridTemplateColumns = grilleCols || colonnes.map((c) => c.largeur || "1fr").join(" ");

    const alignementClasse = (align?: "gauche" | "centre" | "droite") => {
        switch (align) {
            case "droite":
                return "text-right justify-self-end w-full";
            case "centre":
                return "text-center justify-self-center w-full";
            case "gauche":
            default:
                return "text-left w-full";
        }
    };

    const celluleAlignementClasse = (align?: "gauche" | "centre" | "droite") => {
        switch (align) {
            case "droite":
                return "text-right flex items-center justify-end";
            case "centre":
                return "text-center flex items-center justify-center";
            case "gauche":
            default:
                return "text-left";
        }
    };

    return (
        <div className={`w-full overflow-x-auto rounded-xl border border-hairline/60 bg-white shadow-xs select-none ${className}`}>
            <div className={`flex flex-col w-full ${largeurMin}`}>
                {/* En-tête classique aux couleurs claires */}
                <div
                    role="row"
                    className="grid w-full items-center gap-4 px-5 py-3.5 sm:px-6 bg-[#f4f7fa] border-b border-hairline/50 text-xs font-sans font-semibold text-foreground/75 tracking-wider uppercase select-none"
                    style={{ gridTemplateColumns }}
                >
                    {colonnes.map((col) => (
                        <div
                            key={col.cle}
                            role="columnheader"
                            className={`min-w-0 ${alignementClasse(col.alignement)} ${col.className ?? ""}`}
                        >
                            {col.entete}
                        </div>
                    ))}
                </div>

                {/* Corps du tableau */}
                {donnees.length === 0 ? (
                    <div className="py-12 px-6 text-center text-sm font-sans text-foreground/60">
                        {messageVide}
                    </div>
                ) : (
                    <div role="rowgroup" className="divide-y divide-hairline/25">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {donnees.map((item, index) => (
                                <motion.div
                                    key={cleLigne(item)}
                                    role="row"
                                    layout
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 350, damping: 28 },
                                        opacity: { duration: 0.2 },
                                    }}
                                    whileHover={{
                                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                                    }}
                                    onClick={() => onClicLigne?.(item)}
                                    style={{ gridTemplateColumns }}
                                    className={`grid w-full items-center gap-4 px-5 py-3.5 sm:px-6 text-sm text-foreground transition-colors ${
                                        onClicLigne ? "cursor-pointer" : ""
                                    }`}
                                >
                                    {colonnes.map((col) => (
                                        <div
                                            key={col.cle}
                                            role="cell"
                                            className={`min-w-0 ${celluleAlignementClasse(col.alignement)} ${col.className ?? ""}`}
                                        >
                                            {col.cellule(item, index)}
                                        </div>
                                    ))}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
