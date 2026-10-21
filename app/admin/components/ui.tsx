"use client";

import { ReactNode, useState } from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import type { ResultatAction } from "@/app/admin/actions/utils";

import BoutonAdmin, { LoaderAdmin, type BoutonAdminProps } from "@/app/admin/components/BoutonAdmin";
import GalerieImagesReordonnable, {
    type ElementGalerieImage,
    type GalerieImagesReordonnableProps,
} from "@/app/admin/components/GalerieImagesReordonnable";
export * from "@/app/admin/components/ChampsFormulaire";

export {
    BoutonAdmin,
    LoaderAdmin,
    GalerieImagesReordonnable,
    type BoutonAdminProps,
    type ElementGalerieImage,
    type GalerieImagesReordonnableProps,
};

export const classeChamp =
    "w-full rounded-[6px] border border-hairline/60 bg-white px-3.5 py-2.5 text-sm font-sans text-foreground placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-primary";

export function Champ({
    label, erreur, children, className = "",
}: { label: string; erreur?: string; children: ReactNode; className?: string }) {
    return (
        <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
            <span className="font-sans text-sm font-medium text-foreground">{label}</span>
            {children}
            {erreur && (
                <span role="alert" className="text-xs font-sans font-medium text-red-600">
                    {erreur}
                </span>
            )}
        </label>
    );
}

export function Bouton({
    variante = "primaire", className = "", children, ...props
}: { variante?: "primaire" | "secondaire" | "danger" | "steel" } & HTMLMotionProps<"button">) {
    const styles = {
        primaire: "bg-foreground text-background border border-foreground/30 hover:bg-foreground/90",
        secondaire: "bg-foreground/10 text-foreground border border-foreground/20 hover:bg-foreground/15",
        danger: "bg-red-600 text-white border border-red-700 hover:bg-red-700",
        steel: "bg-primary text-background border border-primary/40 hover:bg-primary/90",
    }[variante];

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-sans font-medium disabled:cursor-not-allowed disabled:opacity-50 select-none ${styles} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}

export function MessageResultat({ resultat }: { resultat: ResultatAction | null }) {
    return (
        <AnimatePresence mode="wait">
            {resultat && (
                <motion.div
                    key={resultat.ok ? "ok" : resultat.message}
                    role={resultat.ok ? "status" : "alert"}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-xs font-medium border ${
                        resultat.ok
                            ? "bg-secondary/15 text-secondary border-secondary/40"
                            : "bg-red-600/15 text-red-700 border-red-600/30"
                    }`}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${resultat.ok ? "bg-secondary" : "bg-red-600"}`} />
                    <span>{resultat.ok ? "Enregistré" : resultat.message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** Carte dépliable stylisée en module de console (animée avec framer-motion). */
export function CarteRepliable({
    titre, sousTitre, children, ouvertParDefaut = false,
}: { titre: string; sousTitre?: string; children: ReactNode; ouvertParDefaut?: boolean }) {
    const [ouvert, setOuvert] = useState(ouvertParDefaut);
    return (
        <motion.section
            layout
            className="overflow-hidden rounded-[9px] border border-hairline/60 bg-slate-card/70"
        >
            <motion.button
                type="button"
                aria-expanded={ouvert}
                onClick={() => setOuvert((o) => !o)}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                whileTap={{ scale: 0.995 }}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left select-none"
            >
                <span className="flex flex-col gap-0.5">
                    <span className="font-bold text-base tracking-tight text-foreground">{titre}</span>
                    {sousTitre && <span className="font-mono text-[11px] text-muted-rock uppercase">{sousTitre}</span>}
                </span>
                <motion.span
                    animate={{ rotate: ouvert ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="font-mono text-xs text-primary font-bold"
                    aria-hidden
                >
                    ▼
                </motion.span>
            </motion.button>
            <AnimatePresence initial={false}>
                {ouvert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-hairline/40 p-5 bg-background/50">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}
