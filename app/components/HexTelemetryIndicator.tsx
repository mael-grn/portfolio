import React from "react";

interface Props {
    nombre?: number;
    actif?: number;
    taille?: number;
    couleur?: string;
    className?: string;
}

/**
 * Indicateur télémétrique géométrique d'état sous forme d'hexagones / points de télémétrie.
 */
export default function HexTelemetryIndicator({
    nombre = 3,
    actif = 1,
    taille = 10,
    couleur = "var(--color-primary)",
    className = "",
}: Props) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 select-none ${className}`}
            aria-hidden="true"
        >
            {Array.from({ length: nombre }).map((_, index) => {
                const estActif = index < actif;
                return (
                    <svg
                        key={index}
                        width={taille}
                        height={taille}
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <polygon
                            points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5"
                            fill={estActif ? couleur : "transparent"}
                            stroke={couleur}
                            strokeWidth="1.2"
                            strokeOpacity={estActif ? 1 : 0.4}
                        />
                    </svg>
                );
            })}
        </span>
    );
}
