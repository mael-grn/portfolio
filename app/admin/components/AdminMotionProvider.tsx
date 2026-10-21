"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/**
 * Fournisseur de configuration Framer Motion pour l'espace /admin.
 * Force l'exécution des animations d'interaction (hover, tilt, tap)
 * même si le système d'exploitation ou le navigateur a activé prefers-reduced-motion.
 */
export default function AdminMotionProvider({ children }: { children: ReactNode }) {
    return (
        <MotionConfig reducedMotion="never">
            {children}
        </MotionConfig>
    );
}
