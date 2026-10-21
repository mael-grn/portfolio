"use client";

import { ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export type VarianteBoutonAdmin = "primaire" | "danger" | "secondaire";

export interface BoutonAdminProps {
    /** Texte du bouton. */
    texte?: string;
    /** Icône du bouton (ex. PlusIcon, PencilSquareIcon, TrashIcon). */
    icone?: ReactNode;
    /** Si vrai, forme circulaire parfaite pour afficher uniquement l'icône. */
    rond?: boolean;
    /** Contrôle explicite de l'affichage du texte (par défaut : true si texte présent et !rond). */
    afficherTexte?: boolean;
    /** État de chargement : désactive le bouton et remplace l'icône par un spinner animé avec Framer Motion. */
    chargement?: boolean;
    /** Infobulle accessible (recommandé pour les boutons ronds). */
    titre?: string;
    /** Variante de couleur (défaut : primaire aux couleurs des tuiles). */
    variante?: VarianteBoutonAdmin;
    /** Type HTML du bouton. */
    type?: "button" | "submit" | "reset";
    /** État désactivé. */
    disabled?: boolean;
    /** Gestionnaire de clic. */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Classes CSS utilitaires additionnelles. */
    className?: string;
    /** Contenu personnalisé optionnel. */
    children?: ReactNode;
}

/** Indicateur de chargement circulaire 100% Framer Motion (sans animation CSS). */
export function LoaderAdmin({
    taille = "w-4 h-4",
    couleur = "text-current",
    className = "",
}: {
    taille?: string;
    couleur?: string;
    className?: string;
}) {
    return (
        <motion.svg
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
            className={`${taille} ${couleur} shrink-0 ${className}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3.5"
            />
            <path
                className="opacity-95"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </motion.svg>
    );
}

export const LoaderBouton = LoaderAdmin;

/**
 * Bouton d'administration unifié.
 * Reprend fidèlement la matière et les couleurs des tuiles administratives (#2b455b -> #385c7a),
 * ainsi que leur comportement cinétique au hover (inclinaison physique 3D soyeuse et agrandissement élastique).
 * Paramétrable pour afficher le texte ou s'afficher sous forme purement circulaire.
 */
export default function BoutonAdmin({
    texte,
    icone,
    rond = false,
    afficherTexte,
    chargement = false,
    titre,
    variante = "primaire",
    type = "button",
    disabled = false,
    onClick,
    className = "",
    children,
}: BoutonAdminProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const estDesactive = disabled || chargement;

    // Amorti physique haute fidélité identique aux tuiles
    const springConfig = { stiffness: 260, damping: 20, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

    function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
        if (estDesactive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
    }

    function handlePointerLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    // Décision d'afficher le texte ou non
    const doitAfficherTexte = afficherTexte ?? (!rond && Boolean(texte));
    const labelAccessibilite = titre || texte || (typeof children === "string" ? children : undefined);

    // Nuancier par variante
    const stylesVariante = {
        primaire: {
            initial: {
                backgroundColor: "#2b455b",
                borderColor: "rgba(63, 118, 148, 0.45)",
                color: "#ffffff",
            },
            hover: {
                backgroundColor: "#385c7a",
                borderColor: "#508dae",
            },
        },
        danger: {
            initial: {
                backgroundColor: "#dc2626",
                borderColor: "rgba(239, 68, 68, 0.45)",
                color: "#ffffff",
            },
            hover: {
                backgroundColor: "#b91c1c",
                borderColor: "#f87171",
            },
        },
        secondaire: {
            initial: {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                borderColor: "rgba(0, 0, 0, 0.12)",
                color: "inherit",
            },
            hover: {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderColor: "rgba(0, 0, 0, 0.22)",
            },
        },
    }[variante];

    const formeClasses = rond
        ? "w-11 h-11 p-0 rounded-full shrink-0"
        : "rounded-full px-5 py-2.5 text-sm font-sans font-medium";

    // Icône dynamique : remplacée par le loader animé si en cours de chargement
    const iconeAffichee = chargement ? (
        <LoaderBouton taille={rond ? "w-5 h-5" : "w-4 h-4"} />
    ) : (
        icone
    );

    return (
        <div style={{ perspective: 600 }} className="inline-flex">
            <motion.button
                type={type}
                disabled={estDesactive}
                onClick={onClick}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                title={labelAccessibilite}
                aria-label={labelAccessibilite}
                initial={stylesVariante.initial}
                whileHover={
                    estDesactive
                        ? {}
                        : {
                              scale: rond ? 1.05 : 1.03,
                              ...stylesVariante.hover,
                          }
                }
                whileTap={estDesactive ? {} : { scale: 0.96 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                }}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className={`inline-flex items-center justify-center gap-2 border select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none ${formeClasses} ${className}`}
            >
                <span
                    style={{ transform: "translateZ(8px)" }}
                    className="inline-flex items-center justify-center gap-2"
                >
                    {iconeAffichee}
                    {doitAfficherTexte && texte && <span>{texte}</span>}
                    {children}
                </span>
            </motion.button>
        </div>
    );
}
