"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnmProps {
    layoutId?: string;
    delay?: number;
    duration?: number;
    x?: number;
    y?: number;
    scale?: number;
    children: ReactNode;
    className?: string;
}

/**
 * Composant d'animation universel Animator3000 avec l'easing caractéristique [0.16, 1, 0.3, 1].
 */
export default function Anm({
    delay = 0,
    duration = 0.9,
    x = 0,
    y = 30,
    scale = 1,
    children,
    className = "",
    layoutId,
}: AnmProps) {
    return (
        <motion.div
            layoutId={layoutId}
            layout={layoutId !== undefined}
            className={className}
        >
            <motion.div
                initial={{ opacity: 0, y, x, scale }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                    x: 0,
                    scale: 1,
                }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                    duration,
                    ease: [0.16, 1, 0.3, 1],
                    delay,
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
