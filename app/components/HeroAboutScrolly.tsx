"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
import AgentUnifiedFlight from "@/app/components/AgentUnifiedFlight";
import CompetencesSection from "@/app/components/CompetencesSection";
import ProjetsSection, { ProjetsDict } from "@/app/components/ProjetsSection";
import { Competence } from "@/app/modeles/Competence";
import { Projet } from "@/app/modeles/Projet";
import { CompetencesDict } from "@/app/components/CompetencesSection";

interface HeroAboutScrollyProps {
    heroTitre: string;
    heroDescription: string;
    aboutTitre: string;
    aboutDescription: string;
    devTitre: string;
    devDescription: string;
    competencesTitre: string;
    competencesBadge: string;
    competences: Competence[];
    competencesEnSavoirPlus?: string;
    competencesAgentiques?: Competence[];
    competencesDict?: CompetencesDict;
    projetsTitre?: string;
    projetsEnCoursLabel?: string;
    projetsDict?: ProjetsDict;
    projets?: Projet[];
}

const EASING_ALPINE = [0.16, 1, 0.3, 1] as const;

interface ScrollyWordProps {
    mot: string;
    index: number;
    total: number;
    progress: MotionValue<number>;
    rangeStart: number;
    rangeSpread: number;
    wordDuration: number;
}

/**
 * Mot individuel d'un titre de scène avec éclosion typographique progressive :
 * Stagger échelonné au scroll, élévation verticale (32px -> 0px), défloutage optique (blur 12px -> 0px) et échelle cinétique (0.92 -> 1).
 */
function ScrollyWord({
    mot,
    index,
    total,
    progress,
    rangeStart,
    rangeSpread,
    wordDuration,
}: ScrollyWordProps) {
    const start = rangeStart + (index / total) * rangeSpread;
    const end = start + wordDuration;
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

/**
 * Scrollytelling cinématographique monumental en 3 Actes :
 * - ACTE 1 (Aperçu) : Grand panorama alpin (hero.jpeg), zoom puissant vers Maël à droite.
 * - ACTE 2 (À propos) : Photo de profil grandissant à droite, glissant vers la gauche pour révéler le texte de présentation.
 * - ACTE 3 (Vision & Développement Agentique) :
 *   1. Réduction totale de la photo de profil vers zéro sur place à gauche.
 *   2. Éclosion en miroir des 3 bulles d'IA (Claude, Gemini, ChatGPT) qui restent ancrées à gauche avec rappel élastique.
 *   3. Transition textuelle éditoriale d'envergure : déconstruction brumeuse du texte À propos et apparition mot par mot du titre Vision.
 */
export default function HeroAboutScrolly({
    heroTitre,
    heroDescription,
    aboutTitre,
    aboutDescription,
    devTitre,
    devDescription,
    competencesTitre,
    competencesBadge,
    competences,
    competencesEnSavoirPlus,
    competencesAgentiques,
    competencesDict,
    projetsTitre,
    projetsEnCoursLabel,
    projetsDict,
    projets,
}: HeroAboutScrollyProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const photoRef = useRef<HTMLDivElement>(null);

    // Calcul de l'amplitude horizontale de voyage
    const [distanceDroitePx, setDistanceDroitePx] = useState(900);

    useEffect(() => {
        const mesurerDistance = () => {
            if (!contentRef.current) return;
            const containerRect = contentRef.current.getBoundingClientRect();
            const containerLeft = containerRect.left;
            const viewportWidth = window.innerWidth;
            const photoEl = photoRef.current;
            const photoWidth = photoEl ? photoEl.offsetWidth : 320;
            const photoRestingLeft = containerLeft + (photoEl ? photoEl.offsetLeft : 0);

            // Distance pour caler le bord droit au bord de la fenêtre
            const distance = viewportWidth - photoRestingLeft - photoWidth - 24;
            setDistanceDroitePx(Math.max(distance, 250));
        };

        mesurerDistance();
        window.addEventListener("resize", mesurerDistance, { passive: true });
        return () => window.removeEventListener("resize", mesurerDistance);
    }, []);

    // Découpage des mots du titre de la landing pour l'apparition initiale (même cinétique alpine que ScrollyWord)
    const motsHero = useMemo(() => heroTitre.split(" "), [heroTitre]);

    // Mots du titre À propos et Vision pour la transition typographique échelonnée
    const motsAbout = useMemo(() => aboutTitre.split(" "), [aboutTitre]);
    const motsVision = useMemo(() => devTitre.split(" "), [devTitre]);

    // Écoute de la progression continue du scroll
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Lissage cinétique haute précision (doux et feutré)
    const progress = useSpring(scrollYProgress, {
        stiffness: 140,
        damping: 26,
        restDelta: 0.0005,
    });

    // ==========================================
    // --- ACTE 1 : TRANSFORMS HERO ---
    // ==========================================
    // Défilement vertical continu immédiat du hero dès le moindre mouvement de scroll
    const heroTextOpacity = useTransform(progress, [0, 0.12], [1, 0]);
    const heroTextY = useTransform(progress, [0, 0.14], [0, -180]);
    const heroTextFilter = useTransform(progress, [0, 0.12], ["blur(0px)", "blur(10px)"]);

    const heroBgScale = useTransform(progress, [0, 0.24], [1.05, 3.8]);
    const heroBgX = useTransform(progress, [0, 0.24], ["0%", "-20%"]);
    const heroBgY = useTransform(progress, [0, 0.24], [0, -90]);
    const heroBgOpacity = useTransform(progress, [0.12, 0.24], [1, 0]);

    // ==========================================
    // --- ACTE 2 : TRANSFORMS À PROPOS ---
    // ==========================================
    // Défilement vertical continu de l'Acte 2 :
    // - Montée depuis le bas (140px -> 0px) de 0.08 à 0.24
    // - Défilement doux pendant la lecture (0px -> -30px) de 0.24 à 0.38 (durée = 0.14)
    // - Évacuation ascendante vers la Vision (-30px -> -180px) de 0.38 à 0.50 (durée = 0.12)
    const aboutStageY = useTransform(
        progress,
        [0.08, 0.24, 0.38, 0.50],
        [140, 0, -30, -180]
    );

    const portraitEntranceOpacity = useTransform(progress, [0.08, 0.18], [0, 1]);
    const portraitEntranceScale = useTransform(progress, [0.08, 0.20], [0.06, 1]);
    const portraitFilter = useTransform(progress, [0.08, 0.20], ["blur(8px)", "blur(0px)"]);

    // Glissement horizontal de la droite vers la gauche
    const photoTravelLeft = useTransform(progress, [0, 0.08, 0.24], [1, 1, 0]);
    const portraitX = useTransform(photoTravelLeft, (val) => `${val * distanceDroitePx}px`);

    // ==========================================
    // --- ACTE 3 : TRANSFORMS VISION & AGENTS ---
    // ==========================================
    // Défilement vertical continu de l'Acte 3 :
    // - Montée ascendante depuis le bas (140px -> 0px) de 0.38 à 0.50
    // - Défilement continu fluide pendant la lecture et la flottaison des bulles (0px -> -30px) de 0.50 à 0.64 (durée = 0.14)
    // - Sortie vers le haut en accompagnant le vol des agents vers le Globe (-30px -> -180px) de 0.64 à 0.76 (durée = 0.12)
    const visionStageY = useTransform(
        progress,
        [0.38, 0.50, 0.64, 0.76],
        [140, 0, -30, -180]
    );

    // 1. Réduction totale de la photo de profil vers zéro
    const photoShrinkScale = useTransform(progress, [0.38, 0.50], [1, 0]);
    const photoShrinkOpacity = useTransform(progress, [0.38, 0.50], [1, 0]);
    const photoShrinkRotate = useTransform(progress, [0.38, 0.50], [0, -12]);

    const portraitOpacityCombined = useTransform(
        [portraitEntranceOpacity, photoShrinkOpacity],
        ([a, b]) => (a as number) * (b as number)
    );
    const portraitScaleCombined = useTransform(
        [portraitEntranceScale, photoShrinkScale],
        ([a, b]) => (a as number) * (b as number)
    );

    // 2. Déconstruction brumeuse et élégante du texte "À propos" lors de la transition vers Vision
    const aboutTitreExitOpacity = useTransform(progress, [0.38, 0.50], [1, 0]);
    const aboutTitreExitBlur = useTransform(progress, [0.38, 0.50], ["blur(0px)", "blur(12px)"]);

    const aboutDescExitOpacity = useTransform(progress, [0.39, 0.50], [1, 0]);
    const aboutDescExitBlur = useTransform(progress, [0.39, 0.50], ["blur(0px)", "blur(10px)"]);

    // Émergence cinématique du texte À propos (identique à Vision, cadencée avec l'arrivée de la photo)
    const aboutDescEntranceOpacity = useTransform(progress, [0.23, 0.28], [0, 1]);
    const aboutDescEntranceBlur = useTransform(progress, [0.23, 0.28], ["blur(12px)", "blur(0px)"]);
    const aboutDescEntranceScale = useTransform(progress, [0.23, 0.28], [0.97, 1]);

    const aboutDescOpacity = useTransform(
        [aboutDescEntranceOpacity, aboutDescExitOpacity],
        ([a, b]) => (a as number) * (b as number)
    );
    const aboutDescBlur = useTransform(
        [aboutDescEntranceBlur, aboutDescExitBlur],
        ([a, b]) => (a !== "blur(0px)" ? a : b)
    );

    // 3. Émergence cinématique du texte Vision
    const devDescOpacity = useTransform(progress, [0.48, 0.54], [0, 1]);
    const devDescBlur = useTransform(progress, [0.48, 0.54], ["blur(12px)", "blur(0px)"]);
    const devDescScale = useTransform(progress, [0.48, 0.54], [0.97, 1]);

    // Dissipation du texte Vision au scroll descendant pour laisser place au Globe sans temps mort
    // Durée de transition rigoureusement identique au passage À propos -> Vision (delta = 0.12)
    const visionExitOpacity = useTransform(progress, [0.64, 0.76], [1, 0]);
    const visionExitBlur = useTransform(progress, [0.64, 0.76], ["blur(0px)", "blur(10px)"]);

    const visionPointerEvents = useTransform(progress, (p) =>
        p >= 0.16 && p <= 0.64 ? "auto" : "none"
    );
    const visionVisibility = useTransform(progress, (p) =>
        p >= 0.08 && p <= 0.72 ? "visible" : "hidden"
    );

    // Transition cinématique vers le thème sombre pour Compétences et Projets
    const dynamicBgColor = useTransform(
        progress,
        [0.64, 0.74, 0.96, 1.00],
        ["#dfe5ed", "#14181d", "#14181d", "#dfe5ed"]
    );

    return (
        <div
            id="hero-about-scrolly"
            ref={containerRef}
            className="relative w-full h-[500vh] sm:h-[580vh] bg-background"
        >
            {/* Orchestrateur cinématique unifié des agents IA vers le Globe 3D */}
            <AgentUnifiedFlight
                agents={competencesAgentiques}
                progress={progress}
            />
            {/* Ancre de navigation pour la section 1 : Intro */}
            <div
                id="intro"
                className="absolute top-0 left-0 w-full h-[65vh] pointer-events-none select-none"
                aria-hidden="true"
            />

            {/* Ancre de navigation pour la section 2 : À propos */}
            <div
                id="moi"
                data-theme="light"
                className="absolute top-[75vh] sm:top-[80vh] left-0 w-full h-[65vh] pointer-events-none select-none"
                aria-hidden="true"
            />

            {/* Ancre de navigation pour la section 3 : Vision */}
            <div
                id="vision"
                data-theme="light"
                className="absolute top-[185vh] sm:top-[214vh] left-0 w-full h-[65vh] pointer-events-none select-none"
                aria-hidden="true"
            />

            {/* Ancre de navigation pour la section 4 : Compétences */}
            <div
                id="competences"
                data-theme="dark"
                className="absolute top-[295vh] sm:top-[339vh] left-0 w-full h-[65vh] pointer-events-none select-none"
                aria-hidden="true"
            />

            {/* Ancre de navigation pour la section 5 : Projets */}
            <div
                id="projets"
                data-theme="dark"
                className="absolute top-[395vh] sm:top-[440vh] left-0 w-full h-[65vh] pointer-events-none select-none"
                aria-hidden="true"
            />

            {/* Scène fixe épinglée tout au long du scrollytelling avec transition de fond sombre */}
            <motion.div
                style={{ backgroundColor: dynamicBgColor }}
                className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center pointer-events-auto select-none"
            >
                {/* 1. SCÈNE HERO : Panorama et zoom 3D vers Maël avec défilement de parallaxe */}
                <motion.div
                    style={{
                        scale: heroBgScale,
                        x: heroBgX,
                        y: heroBgY,
                        opacity: heroBgOpacity,
                        transformOrigin: "79% 49%",
                    }}
                    className="absolute inset-0 z-0 pointer-events-none overflow-hidden will-change-transform"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 1.08, filter: "blur(14px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{
                            duration: 1.5,
                            ease: EASING_ALPINE,
                        }}
                        className="absolute inset-0"
                    >
                        <Image
                            src="/hero.jpeg"
                            alt={heroTitre}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                    </motion.div>
                </motion.div>

                {/* 2. TEXTE DU HERO : Apparition cinématique mot par mot et défilement ascendant au scroll */}
                <motion.div
                    style={{
                        opacity: heroTextOpacity,
                        y: heroTextY,
                        filter: heroTextFilter,
                    }}
                    className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end p-6 sm:p-12 md:p-16 will-change-transform"
                >
                    <div className="w-full flex items-end justify-start">
                        <div className="flex flex-col max-w-5xl w-full items-start text-left">
                            <h1 className="font-display font-bold uppercase tracking-tight text-foreground leading-[0.88] w-fit text-left text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem]">
                                {motsHero.map((mot, index) => (
                                    <motion.span
                                        key={index}
                                        className="inline-block mr-[0.24em] last:mr-0 will-change-transform"
                                        initial={{
                                            opacity: 0,
                                            y: 32,
                                            scale: 0.92,
                                            filter: "blur(12px)",
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            filter: "blur(0px)",
                                        }}
                                        transition={{
                                            duration: 0.95,
                                            delay: 0.2 + index * 0.14,
                                            ease: EASING_ALPINE,
                                        }}
                                    >
                                        {mot}
                                    </motion.span>
                                ))}
                            </h1>

                            {/* Sous-titre du hero : apparition fluide et moderne */}
                            <motion.div
                                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 1.0,
                                    delay: 0.2 + motsHero.length * 0.14 + 0.15,
                                    ease: EASING_ALPINE,
                                }}
                                className="mt-6 min-h-[4rem] max-w-2xl w-full"
                            >
                                <p className="text-base sm:text-lg md:text-xl text-foreground/90 font-medium leading-relaxed text-left w-full">
                                    {heroDescription}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. SCÈNE UNIFIÉE : À PROPOS & VISION */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6 sm:p-12 md:p-16">
                    <motion.div
                        ref={contentRef}
                        style={{
                            pointerEvents: visionPointerEvents,
                            visibility: visionVisibility,
                        }}
                        className="relative w-full max-w-7xl flex flex-col sm:flex-row items-center justify-center gap-16 sm:gap-20 md:gap-24 lg:gap-28"
                    >
                        {/* ---------------------------------------------------- */}
                        {/* ZONE GAUCHE : PHOTO DE PROFIL & BULLES D'IA          */}
                        {/* ---------------------------------------------------- */}
                        <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 shrink-0 select-none z-10 flex items-center justify-center">
                            {/* A. Photo de profil solo (montée avec le scroll, glissement droite -> gauche, puis réduction vers zéro) */}
                            <motion.div
                                ref={photoRef}
                                style={{
                                    opacity: portraitOpacityCombined,
                                    scale: portraitScaleCombined,
                                    rotate: photoShrinkRotate,
                                    filter: portraitFilter,
                                    x: portraitX,
                                    y: aboutStageY,
                                }}
                                className="absolute inset-0 rounded-full overflow-hidden shadow-none pointer-events-none will-change-transform aspect-square"
                            >
                                <Image
                                    src="/me.png"
                                    alt={aboutTitre}
                                    fill
                                    priority
                                    sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
                                    className="object-cover object-top rounded-full"
                                />
                            </motion.div>

                            {/* B. Ancre géométrique pour le cercle des agents IA (montant avec la Vision) */}
                            <motion.div
                                id="agent-vision-anchor"
                                style={{ y: visionStageY }}
                                className="absolute inset-0 pointer-events-none"
                            />
                        </div>

                        {/* ---------------------------------------------------- */}
                        {/* ZONE DROITE : TEXTE À PROPOS & VISION                */}
                        {/* ---------------------------------------------------- */}
                        <div className="relative flex-1 max-w-2xl text-left z-10 min-h-[240px] flex items-center">
                            {/* A. TEXTE DE LA SECTION "À PROPOS" (ACTE 2) */}
                            <motion.div
                                style={{
                                    opacity: aboutTitreExitOpacity,
                                    y: aboutStageY,
                                    filter: aboutTitreExitBlur,
                                }}
                                className="absolute inset-0 flex flex-col justify-center gap-5 pointer-events-none"
                            >
                                {/* Titre À propos révélé mot par mot avec cascade optique (identique à Vision) */}
                                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tight text-foreground leading-[0.92]">
                                    {motsAbout.map((mot, index) => (
                                        <ScrollyWord
                                            key={index}
                                            mot={mot}
                                            index={index}
                                            total={motsAbout.length}
                                            progress={progress}
                                            rangeStart={0.185}
                                            rangeSpread={0.045}
                                            wordDuration={0.025}
                                        />
                                    ))}
                                </h2>

                                {/* Description À propos avec mise au point optique (identique à Vision) */}
                                <motion.p
                                    style={{
                                        opacity: aboutDescOpacity,
                                        filter: aboutDescBlur,
                                        scale: aboutDescEntranceScale,
                                    }}
                                    className="text-base sm:text-lg md:text-xl text-foreground/85 leading-relaxed font-normal will-change-transform origin-top-left"
                                >
                                    {aboutDescription}
                                </motion.p>
                            </motion.div>

                            {/* B. TEXTE DE LA SECTION "VISION / AGENTIQUE" (ACTE 3) */}
                            <motion.div
                                style={{
                                    opacity: visionExitOpacity,
                                    y: visionStageY,
                                    filter: visionExitBlur,
                                }}
                                className="flex flex-col gap-5 w-full z-10 will-change-transform"
                            >
                                {/* Titre Vision révélé mot par mot avec cascade optique */}
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-foreground leading-[0.95]">
                                    {motsVision.map((mot, index) => (
                                        <ScrollyWord
                                            key={index}
                                            mot={mot}
                                            index={index}
                                            total={motsVision.length}
                                            progress={progress}
                                            rangeStart={0.42}
                                            rangeSpread={0.05}
                                            wordDuration={0.03}
                                        />
                                    ))}
                                </h2>

                                {/* Description Vision avec mise au point optique */}
                                <motion.p
                                    style={{
                                        opacity: devDescOpacity,
                                        filter: devDescBlur,
                                        scale: devDescScale,
                                    }}
                                    className="text-base sm:text-lg md:text-xl text-slate leading-relaxed font-normal will-change-transform origin-top-left"
                                >
                                    {devDescription}
                                </motion.p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* 4. SCÈNE UNIFIÉE : COMPÉTENCES & GLOBE 3D (ACTE 4) */}
                <CompetencesSection
                    titre={competencesTitre}
                    badge={competencesBadge}
                    elements={competences}
                    progress={progress}
                    enSavoirPlusLabel={competencesEnSavoirPlus}
                    dict={competencesDict}
                />

                {/* 5. SCÈNE UNIFIÉE : PROJETS & CARROUSEL (ACTE 5) */}
                {projets && projets.length > 0 && projetsTitre && (
                    <ProjetsSection
                        titre={projetsTitre}
                        enCoursLabel={projetsEnCoursLabel}
                        dict={projetsDict}
                        projets={projets}
                        progress={progress}
                    />
                )}
            </motion.div>
        </div>
    );
}
