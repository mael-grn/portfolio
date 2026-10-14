"use client";

import { ReactNode, useState } from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import type { ResultatAction } from "@/app/admin/actions/utils";

export const classeChamp =
    "w-full rounded-lg border border-foreground/20 bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary";

export function Champ({
    label, erreur, children, className = "",
}: { label: string; erreur?: string; children: ReactNode; className?: string }) {
    return (
        <label className={`flex flex-col gap-1 text-sm font-medium ${className}`}>
            <span>{label}</span>
            {children}
            {erreur && <span role="alert" className="text-xs font-normal text-red-700">{erreur}</span>}
        </label>
    );
}

export function Bouton({
    variante = "primaire", className = "", ...props
}: { variante?: "primaire" | "secondaire" | "danger" } & HTMLMotionProps<"button">) {
    const styles = {
        primaire: "bg-foreground text-background",
        secondaire: "bg-foreground/10 text-foreground",
        danger: "bg-red-700 text-white",
    }[variante];
    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
            {...props}
        />
    );
}

export function MessageResultat({ resultat }: { resultat: ResultatAction | null }) {
    return (
        <AnimatePresence mode="wait">
            {resultat && (
                <motion.p
                    key={resultat.ok ? "ok" : resultat.message}
                    role={resultat.ok ? "status" : "alert"}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm font-medium ${resultat.ok ? "text-secondary" : "text-red-700"}`}
                >
                    {resultat.ok ? "Enregistré." : resultat.message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

/** Carte dépliable (animée avec framer-motion). */
export function CarteRepliable({
    titre, sousTitre, children, ouvertParDefaut = false,
}: { titre: string; sousTitre?: string; children: ReactNode; ouvertParDefaut?: boolean }) {
    const [ouvert, setOuvert] = useState(ouvertParDefaut);
    return (
        <motion.section layout className="overflow-hidden rounded-xl border border-foreground/10 bg-white/60">
            <button
                type="button"
                aria-expanded={ouvert}
                onClick={() => setOuvert((o) => !o)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left"
            >
                <span className="flex flex-col">
                    <span className="font-semibold">{titre}</span>
                    {sousTitre && <span className="text-xs text-foreground/60">{sousTitre}</span>}
                </span>
                <motion.span animate={{ rotate: ouvert ? 180 : 0 }} aria-hidden>▾</motion.span>
            </button>
            <AnimatePresence initial={false}>
                {ouvert && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-foreground/10 p-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}
