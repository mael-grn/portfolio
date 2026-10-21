"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    useTransform,
    useMotionValue,
    useSpring,
    AnimatePresence,
    type MotionValue,
} from "framer-motion";
import { Competence } from "@/app/modeles/Competence";
import CompetencesGlobe3D from "@/app/components/CompetencesGlobe3D";

const EASING_ALPINE = [0.16, 1, 0.3, 1] as const;

export interface CompetencesDict {
    badge?: string;
    titre: string;
    filtreToutes?: string;
    projetsAbrege?: string;
    cliquerPourEnSavoirPlus?: string;
    niveauMaitrise?: string;
    categorie?: string;
    projetsAssocies?: string;
    aucunProjetAssocie?: string;
    fermer?: string;
    boutonFermer?: string;
    maitriseAbrege?: string;
    categories: Record<string, string>;
}

interface CompetencesSectionProps {
    titre: string;
    badge?: string;
    elements: Competence[];
    progress: MotionValue<number>;
    enSavoirPlusLabel?: string;
    dict?: CompetencesDict;
}

interface CompetenceWordProps {
    mot: string;
    index: number;
    total: number;
    progress: MotionValue<number>;
}

/**
 * Mot individuel du titre Compétences avec éclosion typographique progressive :
 * Stagger échelonné au scroll, élévation verticale (32px -> 0px), défloutage optique (blur 12px -> 0px) et échelle cinétique (0.92 -> 1) identique à Vision.
 */
function CompetenceWord({ mot, index, total, progress }: CompetenceWordProps) {
    const start = 0.68 + (index / total) * 0.05;
    const end = start + 0.03;
    const opacity = useTransform(progress, [start, end], [0, 1]);
    const y = useTransform(progress, [start, end], [32, 0]);
    const blur = useTransform(progress, [start, end], ["blur(12px)", "blur(0px)"]);
    const scale = useTransform(progress, [start, end], [0.92, 1]);

    return (
        <motion.span
            style={{
                opacity,
                y,
                filter: blur,
                scale,
                display: "inline-block",
            }}
            className="mr-[0.24em] last:mr-0 will-change-transform"
        >
            {mot}
        </motion.span>
    );
}

interface BoutonFermerCompetenceProps {
    onClick: () => void;
    label: string;
}

/**
 * Bouton de fermeture interactif à fond noir :
 * - Déplacement magnétique réactif à la position de la souris
 * - Halo spéculaire interne suivant le curseur
 * - Flèche à gauche du texte, alignée et agrandie
 * - Grossissement au hover instantané sans aucune latence
 */
function BoutonFermerCompetence({ onClick, label }: BoutonFermerCompetenceProps) {
    const btnRef = useRef<HTMLButtonElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const spotlightX = useMotionValue(0);
    const spotlightY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 350, damping: 25 });
    const springY = useSpring(mouseY, { stiffness: 350, damping: 25 });
    const springSpotlightX = useSpring(spotlightX, { stiffness: 450, damping: 30 });
    const springSpotlightY = useSpring(spotlightY, { stiffness: 450, damping: 30 });

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const relX = e.clientX - centerX;
        const relY = e.clientY - centerY;

        // Déplacement magnétique contrôlé (amplitude max ±7px X, ±4px Y)
        mouseX.set(Math.max(-7, Math.min(7, relX * 0.12)));
        mouseY.set(Math.max(-4, Math.min(4, relY * 0.12)));

        // Halo lumineux suivant la position relative dans le bouton
        spotlightX.set(e.clientX - rect.left);
        spotlightY.set(e.clientY - rect.top);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsHovered(true);
        handleMouseMove(e);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.button
            ref={btnRef}
            type="button"
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                x: springX,
                y: springY,
            }}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            aria-label={label}
            className="relative w-full py-3.5 px-5 rounded-xl border border-white/20 bg-black text-white flex items-center justify-center cursor-pointer select-none overflow-hidden"
        >
            {/* Halo lumineux interactif suivant la souris */}
            <motion.div
                style={{
                    x: springSpotlightX,
                    y: springSpotlightY,
                }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.18 }}
                className="absolute top-0 left-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-lg pointer-events-none"
            />

            {/* Contenu centré : flèche à gauche du texte, plus grosse, alignée et juste à côté */}
            <div className="relative z-10 flex items-center justify-center gap-2.5">
                <motion.span
                    animate={{
                        x: isHovered ? 2 : 0,
                        y: isHovered ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="flex items-center justify-center text-white shrink-0"
                >
                    <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                </motion.span>
                <span className="font-body font-medium text-sm sm:text-base text-white tracking-normal">
                    {label}
                </span>
            </div>
        </motion.button>
    );
}

/**
 * Acte 4 : Scène Compétences conforme à DESIGN.md :
 * - Grand titre animé lettre par lettre au scroll, s'élevant lors de la sélection d'une compétence.
 * - Déplacement cinétique réel de l'icône depuis le globe 3D vers le panneau gauche avec flou de mouvement.
 * - Retrait de l'icône sur le globe pendant qu'elle est affichée sur le côté.
 * - Le contenu (titre, étoiles de maîtrise progressives, métadonnées) surgit depuis l'icône et l'accompagne.
 */
export default function CompetencesSection({
    titre,
    elements,
    progress,
    enSavoirPlusLabel,
    dict,
}: CompetencesSectionProps) {
    const [competenceSelectionnee, setCompetenceSelectionnee] = useState<Competence | null>(null);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    const cardSlotRef = useRef<HTMLDivElement>(null);

    // Progression de formation cinétique du globe et cascade des lettres lors de l'entrée (0.64 -> 0.76)
    const formationProgress = useTransform(progress, [0.64, 0.76], [0, 1]);

    // Défilement vertical continu unifié conforme à À propos et Vision
    const stageY = useTransform(
        progress,
        [0.64, 0.76, 0.85, 0.91],
        [140, 0, -20, -160]
    );

    const enterOpacity = useTransform(progress, [0.64, 0.74], [0, 1]);
    const exitOpacity = useTransform(progress, [0.85, 0.91], [1, 0]);
    const exitBlur = useTransform(progress, [0.85, 0.91], ["blur(0px)", "blur(12px)"]);

    const combinedOpacity = useTransform(
        [enterOpacity, exitOpacity],
        ([a, b]) => (a as number) * (b as number)
    );

    const pointerEvents = useTransform(progress, (p) =>
        p >= 0.64 && p <= 0.88 ? "auto" : "none"
    );

    const visibility = useTransform(progress, (p) =>
        p >= 0.62 && p <= 0.92 ? "visible" : "hidden"
    );

    const motsTitre = useMemo(() => titre.split(" "), [titre]);

    const handleGlobeLogoClick = (competence: Competence) => {
        if (competenceSelectionnee?.id === competence.id) {
            setCompetenceSelectionnee(null);
        } else {
            setCompetenceSelectionnee(competence);
        }
    };

    return (
        <motion.div
            style={{
                y: stageY,
                opacity: combinedOpacity,
                filter: exitBlur,
                visibility,
            }}
            className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-6 sm:p-12 md:p-16 will-change-transform"
        >
            <motion.div
                style={{ pointerEvents }}
                className="relative w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 lg:gap-8"
            >
                {/* Zone GAUCHE : Grand Titre animé + Fiche dynamique dont le contenu émerge de l'icône */}
                <div className="flex-1 w-full flex flex-col justify-center relative z-10 md:min-h-[480px] lg:min-h-[540px]">
                    <motion.div
                        animate={{
                            y: competenceSelectionnee ? (isDesktop ? -112 : -48) : 0,
                        }}
                        transition={{
                            duration: 0.68,
                            ease: EASING_ALPINE,
                        }}
                        className="relative w-full flex flex-col items-start"
                    >
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold uppercase tracking-tight text-white leading-[0.95]">
                            {motsTitre.map((mot, index) => (
                                <CompetenceWord
                                    key={index}
                                    mot={mot}
                                    index={index}
                                    total={motsTitre.length}
                                    progress={progress}
                                />
                            ))}
                        </h2>

                        {/* Conteneur d'ancrage de la fiche détaillée */}
                        <div
                            ref={cardSlotRef}
                            id="competences-card-slot"
                            className="w-full max-w-md lg:max-w-[460px] mt-6 sm:mt-8 relative md:absolute md:top-full md:left-0"
                        >
                            <AnimatePresence mode="wait">
                                {competenceSelectionnee && (
                                    <motion.div
                                        key={competenceSelectionnee.id}
                                        initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)", transition: { duration: 0.22, ease: "easeOut" } }}
                                        transition={{ duration: 0.52, ease: EASING_ALPINE, delay: 0.05 }}
                                        className="relative w-full flex flex-col gap-4 select-none"
                                    >
                                        {/* Rangée supérieure : Icône motrice pure et titre */}
                                        <div className="flex items-center gap-4">
                                            {/* Boîte d'ancrage réceptrice accueillant l'icône pure 3D du globe */}
                                            <div
                                                id="competence-card-icon-target"
                                                className="relative w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] shrink-0"
                                            />

                                            {/* Titre se déployant depuis l'icône */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -14, filter: "blur(6px)" }}
                                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, x: -10, filter: "blur(4px)", transition: { duration: 0.16 } }}
                                                transition={{ delay: 0.14, duration: 0.38, ease: EASING_ALPINE }}
                                                className="flex-1 min-w-0 flex flex-col justify-center"
                                            >
                                                <h3 className="font-body font-bold text-2xl sm:text-3xl text-white tracking-tight leading-none truncate">
                                                    {competenceSelectionnee.nom}
                                                </h3>
                                            </motion.div>
                                        </div>

                                        {/* Niveau de maîtrise avec grosses étoiles et label (maîtrise) sans texte de titre ni score */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, y: 8, filter: "blur(4px)", transition: { duration: 0.16 } }}
                                            transition={{ delay: 0.20, duration: 0.4, ease: EASING_ALPINE }}
                                            className="flex flex-col gap-2"
                                        >
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    {[1, 2, 3, 4, 5].map((starIndex) => {
                                                        const estRemplie = starIndex <= competenceSelectionnee.maitrise;
                                                        return (
                                                            <motion.div
                                                                key={starIndex}
                                                                initial={{ scale: 0, opacity: 0, rotate: -25 }}
                                                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                                                transition={{
                                                                    delay: 0.22 + starIndex * 0.07,
                                                                    type: "spring",
                                                                    stiffness: 320,
                                                                    damping: 20,
                                                                }}
                                                                className="relative"
                                                            >
                                                                <svg
                                                                    className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 ${
                                                                        estRemplie
                                                                            ? "text-amber-400 fill-amber-400"
                                                                            : "text-white/20 fill-transparent"
                                                                    }`}
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                                                    />
                                                                </svg>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                                <motion.span
                                                    initial={{ opacity: 0, x: -6 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.58, duration: 0.35, ease: EASING_ALPINE }}
                                                    className="italic text-white/50 text-xs sm:text-sm font-body select-none"
                                                >
                                                    {dict?.maitriseAbrege || "(maîtrise)"}
                                                </motion.span>
                                            </div>
                                        </motion.div>

                                        {/* Métadonnées de la table compétence se déployant en cascade */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, y: 8, filter: "blur(4px)", transition: { duration: 0.16 } }}
                                            transition={{ delay: 0.26, duration: 0.4, ease: EASING_ALPINE }}
                                            className="grid grid-cols-2 gap-3 text-xs"
                                        >
                                            <div>
                                                <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 block">
                                                    {dict?.categorie || "Catégorie"}
                                                </span>
                                                <span className="font-body font-semibold text-white mt-0.5 block truncate">
                                                    {dict?.categories[competenceSelectionnee.categorie] || competenceSelectionnee.categorie}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 block">
                                                    {dict?.projetsAssocies || "Projets associés"}
                                                </span>
                                                <span className="font-body font-semibold text-white mt-0.5 block truncate">
                                                    {competenceSelectionnee.nombreProjets > 0
                                                        ? `${competenceSelectionnee.nombreProjets} ${dict?.projetsAbrege || "proj."}`
                                                        : dict?.aucunProjetAssocie || "Aucun projet pour l'instant"}
                                                </span>
                                            </div>
                                        </motion.div>

                                        {/* Bouton Fermer pleine largeur à fond noir avec réaction dynamique à la souris */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, y: 8, filter: "blur(4px)", transition: { duration: 0.16 } }}
                                            transition={{ delay: 0.30, duration: 0.4, ease: EASING_ALPINE }}
                                            className="w-full mt-2"
                                        >
                                            <BoutonFermerCompetence
                                                onClick={() => setCompetenceSelectionnee(null)}
                                                label={dict?.boutonFermer || dict?.fermer || "Fermer"}
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                    </div>
                </motion.div>
            </div>

                {/* Zone DROITE : Gros Globe 3D interactif décalé vers la gauche */}
                <div className="w-full md:w-[480px] lg:w-[540px] shrink-0 flex items-center justify-center will-change-transform md:-translate-x-28 lg:-translate-x-40 xl:-translate-x-52 relative z-30">
                    <CompetencesGlobe3D
                        competences={elements}
                        onCompetenceClick={handleGlobeLogoClick}
                        scrollProgress={formationProgress}
                        enSavoirPlusLabel={enSavoirPlusLabel}
                        selectedCompetenceId={competenceSelectionnee?.id ?? null}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
