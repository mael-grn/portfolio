"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    animate,
    type MotionValue,
} from "framer-motion";

interface ZoomLensNavProps {
    apercuLabel: string;
    aProposLabel: string;
    visionLabel: string;
    competencesLabel: string;
    projetsLabel: string;
    parcoursLabel: string;
}

const EASING_ALPINE = [0.16, 1, 0.3, 1] as const;

// 22 barres optiques de zoom pour un défilement continu équilibré et soyeux
const NOMBRE_TRAITS = 22;
const ESPACEMENT_TRAITS = 16; // espacement vertical en pixels
const HAUTEUR_CYCLE = NOMBRE_TRAITS * ESPACEMENT_TRAITS; // 352px
const TRAITS = Array.from({ length: NOMBRE_TRAITS }, (_, i) => ({ id: i }));

interface TickItemProps {
    index: number;
    springScrollY: MotionValue<number>;
    activeYMotion: MotionValue<number>;
    estFondSombre: boolean;
}

/**
 * Trait individuel du ruban optique :
 * - Défilement à vitesse modérée et fluide (0.15) synchronisé avec le scroll.
 * - Le trait le plus long (36px) est centré exactement sur l'axe vertical médian du titre actif.
 * - Dégressivité gaussienne resserrée (sigma=24px) pour un repère de focalisation net et lisible.
 * - Adaptation chromatique automatique en direct selon la couleur du fond.
 */
function TickItem({ index, springScrollY, activeYMotion, estFondSombre }: TickItemProps) {
    // Vitesse de défilement douce et feutrée (0.15) dans le sens naturel du scroll
    const y = useTransform(springScrollY, (valeurScroll) => {
        const rawY = index * ESPACEMENT_TRAITS + (valeurScroll * 0.15);
        return ((rawY % HAUTEUR_CYCLE) + HAUTEUR_CYCLE) % HAUTEUR_CYCLE;
    });

    // Largeur dynamique : culmine à 36px exactement en face du centre du texte du titre
    const width = useTransform([y, activeYMotion], ([currentY, targetY]) => {
        const distance = Math.abs((currentY as number) - (targetY as number));
        const facteur = Math.exp(-Math.pow(distance / 24, 2));
        return 6 + 30 * facteur;
    });

    // Opacité dynamique : 0.95 au niveau du titre, 0.22 aux extrémités
    const opacity = useTransform([y, activeYMotion], ([currentY, targetY]) => {
        const distance = Math.abs((currentY as number) - (targetY as number));
        const facteur = Math.exp(-Math.pow(distance / 24, 2));
        return 0.22 + 0.73 * facteur;
    });

    return (
        <motion.div
            animate={{
                backgroundColor: estFondSombre ? "#ffffff" : "#20272e",
            }}
            transition={{
                duration: 0.3,
                ease: EASING_ALPINE,
            }}
            style={{
                top: 0,
                y,
                width,
                opacity,
            }}
            className="absolute right-0 -translate-y-1/2 h-[2.5px] sm:h-[3px] rounded-full"
        />
    );
}

interface LibelleEtapeProps {
    libelle: string;
    estActif: boolean;
    estPasse: boolean;
    estFondSombre: boolean;
    setSpanRef: (element: HTMLSpanElement | null) => void;
}

/**
 * Libellé d'étape avec morphing typographique fluide :
 * - Police de titre monumentale (font-display) uniquement pour la section active.
 * - Police de corps de texte normale (font-body) pour les sections grisées.
 * - Crossfade interpolé avec léger flou moderne (mode popLayout) pour une transition ultra smooth.
 */
function LibelleEtape({
    libelle,
    estActif,
    estPasse,
    estFondSombre,
    setSpanRef,
}: LibelleEtapeProps) {
    const couleur = estActif
        ? (estFondSombre ? "#ffffff" : "#20272e")
        : estPasse
        ? (estFondSombre ? "rgba(255, 255, 255, 0.42)" : "rgba(122, 134, 148, 0.75)")
        : (estFondSombre ? "rgba(255, 255, 255, 0.65)" : "rgba(68, 80, 92, 0.75)");

    return (
        <div className="relative flex items-center justify-end overflow-visible">
            <AnimatePresence mode="popLayout" initial={false}>
                {estActif ? (
                    <motion.span
                        key="titre-actif"
                        ref={setSpanRef}
                        layout
                        initial={{ opacity: 0, scale: 0.94, filter: "blur(3px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.94, filter: "blur(3px)" }}
                        transition={{ duration: 0.35, ease: EASING_ALPINE }}
                        style={{ color: couleur }}
                        className="font-display font-bold tracking-tight text-xl sm:text-2xl md:text-3xl leading-none whitespace-nowrap"
                    >
                        {libelle}
                    </motion.span>
                ) : (
                    <motion.span
                        key="titre-corps"
                        ref={setSpanRef}
                        layout
                        initial={{ opacity: 0, scale: 1.06, filter: "blur(2px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.06, filter: "blur(2px)" }}
                        transition={{ duration: 0.3, ease: EASING_ALPINE }}
                        style={{ color: couleur }}
                        className="font-body font-normal text-[11px] sm:text-xs leading-tight whitespace-nowrap"
                    >
                        {libelle}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Navigation "Zoom Lens" en angle supérieur droit (style getartcraft.com / molette de zoom caméra) :
 * - Défilement continu à vitesse mesurée des traits de zoom optique.
 * - Titres resserrés collés aux tirets, avec transition moderne entre police de titre et police de corps.
 * - Alignement direct et rigoureux du trait le plus long avec la ligne médiane du titre actif.
 * - Navigation totalement transparente, sans aucun arrière-plan flou ni opaque.
 */
export default function ZoomLensNav({
    apercuLabel,
    aProposLabel,
    visionLabel,
    competencesLabel,
    projetsLabel,
    parcoursLabel,
}: ZoomLensNavProps) {
    const etapes = useMemo(
        () => [
            { id: "intro", libelle: apercuLabel },
            { id: "moi", libelle: aProposLabel },
            { id: "vision", libelle: visionLabel },
            { id: "competences", libelle: competencesLabel },
            { id: "projets", libelle: projetsLabel },
            { id: "parcours", libelle: parcoursLabel },
        ],
        [apercuLabel, aProposLabel, visionLabel, competencesLabel, projetsLabel, parcoursLabel]
    );

    const [indexActif, setIndexActif] = useState(0);
    const [estFondSombre, setEstFondSombre] = useState(true);
    const indexActifRef = useRef(0);
    const estFondSombreRef = useRef(true);

    const navContainerRef = useRef<HTMLDivElement | null>(null);
    const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const rulerRef = useRef<HTMLDivElement | null>(null);
    const rafIdRef = useRef<number | null>(null);

    // Écoute continue et lissée du défilement
    const { scrollY } = useScroll();
    const springScrollY = useSpring(scrollY, {
        stiffness: 140,
        damping: 24,
        restDelta: 0.001,
    });

    // Position Y du point focal actif (aligné au pixel près sur le centre du texte du titre actif)
    const activeYMotion = useMotionValue(24);

    // Détection optimisée en temps réel (zéro layout thrashing, zéro getComputedStyle au scroll)
    const synchroniserNavigation = useCallback(() => {
        const seuil = window.innerHeight * 0.32;
        let indexTrouve = 0;

        for (let i = 0; i < etapes.length; i++) {
            const element = document.getElementById(etapes[i].id);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= seuil) {
                    indexTrouve = i;
                }
            }
        }

        // Mise à jour de l'index uniquement s'il a changé (0 re-render pendant le scroll intra-section)
        if (indexTrouve !== indexActifRef.current) {
            indexActifRef.current = indexTrouve;
            setIndexActif(indexTrouve);
        }

        // Le fond sombre correspond au hero (index 0), aux compétences (index 3) et aux projets (index 4)
        const nouveauSombre =
            indexTrouve === 0 || indexTrouve === 3 || indexTrouve === 4;
        if (nouveauSombre !== estFondSombreRef.current) {
            estFondSombreRef.current = nouveauSombre;
            setEstFondSombre(nouveauSombre);
        }
    }, [etapes]);

    useEffect(() => {
        const lancerSynchro = () => {
            if (rafIdRef.current !== null) return;
            rafIdRef.current = requestAnimationFrame(() => {
                synchroniserNavigation();
                rafIdRef.current = null;
            });
        };

        window.addEventListener("scroll", lancerSynchro, { passive: true });
        window.addEventListener("resize", lancerSynchro, { passive: true });
        synchroniserNavigation();

        return () => {
            if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
            window.removeEventListener("scroll", lancerSynchro);
            window.removeEventListener("resize", lancerSynchro);
        };
    }, [synchroniserNavigation]);

    // Calcule et aligne rigoureusement le point focal sur la ligne médiane exacte du titre actif
    const actualiserPointFocal = useCallback(() => {
        const span = spanRefs.current[indexActif];
        const ruler = rulerRef.current;
        if (!span || !ruler) return;

        const rectSpan = span.getBoundingClientRect();
        const rectRuler = ruler.getBoundingClientRect();
        if (rectRuler.height <= 0) return;

        // Centre vertical exact du texte du titre par rapport au haut de ruler
        const centreY = (rectSpan.top + rectSpan.bottom) / 2 - rectRuler.top;

        animate(activeYMotion, centreY, {
            type: "spring",
            stiffness: 380,
            damping: 26,
            mass: 0.5,
        });
    }, [indexActif, activeYMotion]);

    useEffect(() => {
        actualiserPointFocal();

        // Réajustements synchronisés avec les transitions de layout des titres
        const t1 = setTimeout(actualiserPointFocal, 60);
        const t2 = setTimeout(actualiserPointFocal, 150);
        const t3 = setTimeout(actualiserPointFocal, 300);

        window.addEventListener("resize", actualiserPointFocal, { passive: true });

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            window.removeEventListener("resize", actualiserPointFocal);
        };
    }, [indexActif, actualiserPointFocal]);

    const naviguerVersSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <motion.nav
            aria-label="Navigation principale"
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{
                duration: 1.2,
                delay: 0.35,
                ease: EASING_ALPINE,
            }}
            className="fixed top-0 right-0 z-40 flex items-start select-none pointer-events-none"
        >
            <div
                ref={navContainerRef}
                className="relative pointer-events-auto pt-5 sm:pt-6 pr-4 sm:pr-6 pb-10 pl-3 sm:pl-4 flex items-center gap-1.5 sm:gap-2 bg-transparent"
            >
                {/* Liste verticale des étapes textuelles resserrée */}
                <div className="relative flex flex-col items-end justify-between py-1 gap-1 sm:gap-1.5 pr-0.5">
                    {etapes.map((etape, index) => {
                        const delta = Math.abs(index - indexActif);
                        const estPasse = index < indexActif;
                        const estActif = index === indexActif;

                        // Courbure qui épouse fidèlement la forme convexe des barres :
                        // Le grand trait de 36px s'étend à gauche (titre actif à x = 0).
                        // Les traits adjacents et distants sont plus courts : leurs titres s'avancent vers la droite pour rester collés à leurs pointes.
                        const decalageX =
                            delta === 0 ? 0 : delta === 1 ? 10 : delta === 2 ? 18 : 24;

                        return (
                            <motion.button
                                key={etape.id}
                                type="button"
                                onClick={() => naviguerVersSection(etape.id)}
                                animate={{ x: decalageX }}
                                whileHover={{ scale: estActif ? 1.03 : 1.08, opacity: 1 }}
                                transition={{ duration: 0.35, ease: EASING_ALPINE }}
                                className="group relative flex items-center justify-end text-right focus:outline-none cursor-pointer whitespace-nowrap py-0.5"
                                aria-current={estActif ? "step" : undefined}
                            >
                                <LibelleEtape
                                    libelle={etape.libelle}
                                    estActif={estActif}
                                    estPasse={estPasse}
                                    estFondSombre={estFondSombre}
                                    setSpanRef={(element) => {
                                        spanRefs.current[index] = element;
                                    }}
                                />
                            </motion.button>
                        );
                    })}
                </div>

                {/* Réglette optique avec défilement rapide mesuré et alignement rigoureux au titre */}
                <div
                    ref={rulerRef}
                    className="relative w-[36px] sm:w-[38px] h-48 sm:h-56 overflow-hidden pointer-events-none select-none"
                    style={{
                        maskImage:
                            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                    }}
                >
                    {TRAITS.map((trait) => (
                        <TickItem
                            key={trait.id}
                            index={trait.id}
                            springScrollY={springScrollY}
                            activeYMotion={activeYMotion}
                            estFondSombre={estFondSombre}
                        />
                    ))}
                </div>
            </div>
        </motion.nav>
    );
}
