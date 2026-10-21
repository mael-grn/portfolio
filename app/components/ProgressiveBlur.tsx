"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressiveBlurProps {
    className?: string;
    estFondSombre?: boolean;
}

const EASING_ALPINE = [0.16, 1, 0.3, 1] as const;

/**
 * Surface de flou progressif étagée à accélération exponentielle (Progressive Optical Glass) :
 * - Commence doucement au niveau du texte du titre (micro-flou quasi nul à gauche).
 * - S'intensifie de plus en plus rapidement vers la droite (effet cubique/exponentiel).
 * - Très flou et dense au niveau des tirets et dans l'angle supérieur droit.
 * - S'estompe verticalement de manière soyeuse vers le bas.
 */
export default function ProgressiveBlur({
    className = "",
    estFondSombre = false,
}: ProgressiveBlurProps) {
    // Masque vertical régulier avec estompe douce vers le bas
    const masqueVertical =
        "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 25%, rgba(0,0,0,0.82) 50%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.18) 90%, rgba(0,0,0,0) 100%)";

    // Masque horizontal cubique doux : quasi transparent au début du texte (à gauche), puis accélération vers la droite
    const masqueHorizontalDoux =
        "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.16) 80%, rgba(0,0,0,0.03) 93%, rgba(0,0,0,0) 100%)";

    // Masque horizontal médium : s'active sur la seconde moitié
    const masqueHorizontalMedium =
        "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0) 88%)";

    // Masque horizontal fort : concentré sur le tiers droit pour un flou très dense
    const masqueHorizontalFort =
        "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0) 78%)";

    const styleLayerDoux = {
        maskImage: `${masqueHorizontalDoux}, ${masqueVertical}`,
        WebkitMaskImage: `${masqueHorizontalDoux}, ${masqueVertical}`,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
    };

    const styleLayerMedium = {
        maskImage: `${masqueHorizontalMedium}, ${masqueVertical}`,
        WebkitMaskImage: `${masqueHorizontalMedium}, ${masqueVertical}`,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
    };

    const styleLayerFort = {
        maskImage: `${masqueHorizontalFort}, ${masqueVertical}`,
        WebkitMaskImage: `${masqueHorizontalFort}, ${masqueVertical}`,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
    };

    return (
        <div
            className={`absolute pointer-events-none overflow-hidden select-none ${className}`}
            aria-hidden="true"
        >
            {/* Couche 1 : Micro-flou très doux (4px) démarrant imperceptiblement au début du texte */}
            <div
                className="absolute inset-0 backdrop-blur-xs opacity-90"
                style={styleLayerDoux}
            />

            {/* Couche 2 : Flou intermédiaire (12px) assurant l'accélération progressive */}
            <div
                className="absolute inset-0 backdrop-blur-md"
                style={styleLayerMedium}
            />

            {/* Couche 3 : Flou profond puissant (32px) devenant très flou rapidement vers l'angle droit */}
            <div
                className="absolute inset-0 backdrop-blur-2xl sm:backdrop-blur-3xl"
                style={styleLayerFort}
            />

            {/* Teinte de verre adaptative (sombre ou claire) animée par Framer Motion */}
            <motion.div
                animate={{
                    backgroundColor: estFondSombre
                        ? "rgba(32, 39, 46, 0.4)"
                        : "rgba(223, 229, 237, 0.32)",
                }}
                transition={{ duration: 0.35, ease: EASING_ALPINE }}
                className="absolute inset-0"
                style={styleLayerMedium}
            />
        </div>
    );
}
