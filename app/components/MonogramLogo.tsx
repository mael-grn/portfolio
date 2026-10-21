import React from "react";

interface Props {
    taille?: number;
    couleur?: string;
    className?: string;
}

/**
 * Monogramme géométrique MG (Maël Garnier) respectant la charte brutaliste/éditoriale.
 */
export default function MonogramLogo({
    taille = 24,
    couleur = "currentColor",
    className = "",
}: Props) {
    return (
        <svg
            width={taille}
            height={taille}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Logo Maël Garnier"
        >
            {/* Cadre géométrique épuré */}
            <rect
                x="2"
                y="2"
                width="28"
                height="28"
                rx="6"
                stroke={couleur}
                strokeWidth="2"
                fill="none"
            />
            {/* Lettre M */}
            <path
                d="M8 23V9L13.5 17L19 9V23"
                stroke={couleur}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Lettre G stylisée */}
            <path
                d="M24 13C23 10 20 9 17 9"
                stroke={couleur}
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <path
                d="M24 16H20V23H24"
                stroke={couleur}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
