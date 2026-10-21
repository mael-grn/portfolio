"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TiroirAdminProps {
    ouvert: boolean;
    onFermer: () => void;
    titre: string;
    children: ReactNode;
}

/**
 * Menu latéral flottant d'administration (Slide-over Drawer).
 * Ancré sur la droite avec marge périphérique (haut, bas, droite), coins totalement arrondis (rounded-[32px]),
 * et animation développée avec Framer Motion (ressort physique alpin soyeux).
 * L'en-tête ne comporte pas de bouton 'X' : la fermeture s'effectue via le bouton « Annuler » en bas ou le clic extérieur.
 */
export default function TiroirAdmin({
    ouvert,
    onFermer,
    titre,
    children,
}: TiroirAdminProps) {
    // Verrouillage du scroll de la page parente et écoute de la touche Échap
    useEffect(() => {
        if (!ouvert) return;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onFermer();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [ouvert, onFermer]);

    return (
        <AnimatePresence>
            {ouvert && (
                <div className="fixed inset-0 z-50 overflow-hidden select-none">
                    {/* Arrière-plan sombre avec flou d'ambiance cinématique */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        onClick={onFermer}
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
                    />

                    {/* Menu latéral flottant à droite avec ressort dynamique Framer Motion */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={titre}
                        initial={{ x: "calc(100% + 2rem)", opacity: 0.85, scale: 0.98 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: "calc(100% + 2rem)", opacity: 0.85, scale: 0.98 }}
                        transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 32,
                            mass: 0.8,
                        }}
                        className="fixed top-3 right-3 bottom-3 sm:top-4 sm:right-4 sm:bottom-4 z-10 flex flex-col w-[calc(100vw-1.5rem)] sm:w-[580px] md:w-[640px] max-w-full rounded-[32px] bg-white text-foreground border border-hairline/40 shadow-2xl overflow-hidden"
                    >
                        {/* Contenu défilant depuis tout en haut avec titre intégré dans le scroll */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {/* Titre directement intégré dans le contenu défilant */}
                            <div className="pt-8 px-6 sm:px-8 pb-2">
                                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                    {titre}
                                </h3>
                            </div>

                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
