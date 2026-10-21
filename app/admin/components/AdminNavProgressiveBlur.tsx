"use client";

/**
 * Arrière-plan de navigation avec flou progressif non-linéaire (Progressive Blur).
 * Gradient de flou multicouche à accélération exponentielle :
 * - Au début (en bas) : flou très doux (1px - 2px) s'estompant naturellement
 * - Au milieu : accélération de la diffusion (4px -> 8px -> 16px)
 * - En haut : flou intense (32px -> 64px) assurant une parfaite lisibilité des commandes
 */
export default function AdminNavProgressiveBlur() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -bottom-6 -z-10 overflow-hidden select-none">
            {/* Dégradé de teinte non-linéaire pour la couleur de fond */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-transparent" />

            {/* Couches de flou progressif non-linéaire */}
            {/* Couche 1 : flou initial très doux (1px) */}
            <div className="absolute inset-0 backdrop-blur-[1px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_20%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_0%,rgba(0,0,0,1)_20%,rgba(0,0,0,1)_100%)]" />

            {/* Couche 2 : flou léger (2px) */}
            <div className="absolute inset-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_15%,rgba(0,0,0,1)_35%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_15%,rgba(0,0,0,1)_35%,rgba(0,0,0,1)_100%)]" />

            {/* Couche 3 : flou modéré (4px) */}
            <div className="absolute inset-0 backdrop-blur-[4px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_30%,rgba(0,0,0,1)_50%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_30%,rgba(0,0,0,1)_50%,rgba(0,0,0,1)_100%)]" />

            {/* Couche 4 : accélération (8px) */}
            <div className="absolute inset-0 backdrop-blur-[8px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_45%,rgba(0,0,0,1)_65%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_45%,rgba(0,0,0,1)_65%,rgba(0,0,0,1)_100%)]" />

            {/* Couche 5 : flou prononcé (16px) */}
            <div className="absolute inset-0 backdrop-blur-[16px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_60%,rgba(0,0,0,1)_80%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_60%,rgba(0,0,0,1)_80%,rgba(0,0,0,1)_100%)]" />

            {/* Couche 6 : flou fort (28px) */}
            <div className="absolute inset-0 backdrop-blur-[28px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_72%,rgba(0,0,0,1)_90%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_72%,rgba(0,0,0,1)_90%,rgba(0,0,0,1)_100%)]" />

            {/* Couche 7 : flou très fort (44px) */}
            <div className="absolute inset-0 backdrop-blur-[44px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_82%,rgba(0,0,0,1)_96%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_82%,rgba(0,0,0,1)_96%,rgba(0,0,0,1)_100%)]" />

            {/* Couche 8 : flou maximal au sommet (64px) */}
            <div className="absolute inset-0 backdrop-blur-[64px] [mask-image:linear-gradient(to_top,rgba(0,0,0,0)_90%,rgba(0,0,0,1)_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,0)_90%,rgba(0,0,0,1)_100%)]" />
        </div>
    );
}
