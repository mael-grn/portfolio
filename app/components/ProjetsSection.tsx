"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
    motion,
    AnimatePresence,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { Projet } from "@/app/modeles/Projet";

const EASING_ALPINE = [0.16, 1, 0.3, 1] as const;

export interface ProjetsDict {
    titre: string;
    details?: string;
    enCours?: string;
    projetsDeployes?: string;
    mediasEtInterfaces?: string;
    fermer?: string;
    dernierProjetBadge?: string;
    autreProjetBadge?: string;
    aucunMedia?: string;
    imagePrecedente?: string;
    imageSuivante?: string;
    defilerGauche?: string;
    defilerDroite?: string;
    selectionnerProjet?: string;
}

interface ProjetsProps {
    titre: string;
    badge?: string;
    detailsLabel?: string;
    enCoursLabel?: string;
    projetsDeployesLabel?: string;
    mediasLabel?: string;
    fermerLabel?: string;
    dict?: ProjetsDict;
    projets: Projet[];
    progress: MotionValue<number>;
}

interface ProjetWordProps {
    mot: string;
    index: number;
    total: number;
    progress: MotionValue<number>;
}

/**
 * Mot individuel du titre Projets avec éclosion typographique progressive :
 * Stagger échelonné au scroll, élévation verticale (32px -> 0px), défloutage optique (blur 12px -> 0px) et échelle cinétique (0.92 -> 1).
 */
function ProjetWord({ mot, index, total, progress }: ProjetWordProps) {
    const start = 0.85 + (index / total) * 0.04;
    const end = start + 0.025;
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

interface ProjetPhotoCarouselProps {
    images: string[];
    nomProjet: string;
    dict?: ProjetsDict;
}

/**
 * Carrousel multimédia moderne pour le projet en vedette :
 * - Transitions cinétiques framer-motion avec glissement directionnel, zoom et flou optique
 * - Commandes de navigation flottantes avec flèches alpines et amorti magnétique
 * - Télémétrie d'index en monospace et indicateur à segments interactifs
 * - Défilement tactile / glisser-déposer au geste
 * - Pause automatique au survol
 * - Affichage télémétrique géométrique d'attente si aucune image n'est disponible
 */
function ProjetPhotoCarousel({ images, nomProjet, dict }: ProjetPhotoCarouselProps) {
    const [[indexCourant, direction], setPage] = useState<[number, number]>([0, 0]);
    const [estSurvole, setEstSurvole] = useState(false);

    const indexImage = useMemo(() => {
        if (images.length === 0) return 0;
        return ((indexCourant % images.length) + images.length) % images.length;
    }, [indexCourant, images.length]);

    const naviguer = useCallback(
        (nouvelleDirection: number) => {
            if (images.length <= 1) return;
            setPage(([prevIndex]) => [prevIndex + nouvelleDirection, nouvelleDirection]);
        },
        [images.length]
    );

    // Défilement automatique doux toutes les 4,5 secondes avec pause au survol
    useEffect(() => {
        if (images.length <= 1 || estSurvole) return;
        const interval = setInterval(() => {
            setPage(([prev]) => [prev + 1, 1]);
        }, 4500);
        return () => clearInterval(interval);
    }, [images.length, estSurvole]);

    if (images.length === 0) {
        return (
            <div className="relative w-full h-full min-h-[220px] md:min-h-0 bg-carbon-surface/60 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 select-none overflow-hidden">
                {/* Trame de grille alpine en arrière-plan */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                    <span className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-white/40 uppercase">
                        {nomProjet.substring(0, 2)}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                        {dict?.aucunMedia ?? "Aucun média visuel"}
                    </span>
                </div>
            </div>
        );
    }

    const imageActive = images[indexImage];

    return (
        <div
            onMouseEnter={() => setEstSurvole(true)}
            onMouseLeave={() => setEstSurvole(false)}
            className="relative w-full h-full min-h-[240px] md:min-h-0 bg-carbon-surface rounded-2xl overflow-hidden select-none group border border-white/15"
        >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={indexCourant}
                    custom={direction}
                    variants={{
                        enter: (dir: number) => ({
                            x: dir > 0 ? "100%" : "-100%",
                            opacity: 0,
                            scale: 0.95,
                            filter: "blur(8px)",
                        }),
                        center: {
                            x: "0%",
                            opacity: 1,
                            scale: 1,
                            filter: "blur(0px)",
                            transition: {
                                duration: 0.55,
                                ease: EASING_ALPINE,
                            },
                        },
                        exit: (dir: number) => ({
                            x: dir > 0 ? "-100%" : "100%",
                            opacity: 0,
                            scale: 0.95,
                            filter: "blur(8px)",
                            transition: {
                                duration: 0.45,
                                ease: EASING_ALPINE,
                            },
                        }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag={images.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                        if (info.offset.x > 40) {
                            naviguer(-1);
                        } else if (info.offset.x < -40) {
                            naviguer(1);
                        }
                    }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing will-change-transform"
                >
                    <Image
                        src={imageActive}
                        alt={`${nomProjet} - ${indexImage + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center pointer-events-none"
                        priority={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />
                </motion.div>
            </AnimatePresence>

            {/* Badge télémétrique de position */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold tracking-widest text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 select-none">
                    {String(indexImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
            </div>

            {/* Boutons de navigation interactive si plusieurs images */}
            {images.length > 1 && (
                <>
                    <motion.button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            naviguer(-1);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={dict?.imagePrecedente ?? "Image précédente"}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white flex items-center justify-center cursor-pointer shadow-none"
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </motion.button>

                    <motion.button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            naviguer(1);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={dict?.imageSuivante ?? "Image suivante"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white flex items-center justify-center cursor-pointer shadow-none"
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </motion.button>

                    {/* Ligne télémétrique segmentée de pagination */}
                    <div className="absolute bottom-3 inset-x-4 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const diff = i - indexImage;
                                    if (diff !== 0) {
                                        setPage(([prev]) => [prev + diff, diff > 0 ? 1 : -1]);
                                    }
                                }}
                                aria-label={`Slide ${i + 1}`}
                                className="relative py-1.5 px-0.5 cursor-pointer"
                            >
                                <span
                                    className={`block h-1 rounded-full ${
                                        i === indexImage
                                            ? "w-7 sm:w-8 bg-white"
                                            : "w-2.5 sm:w-3 bg-white/35 hover:bg-white/60"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

interface ProjetSecondaireCarteProps {
    projet: Projet;
    index: number;
    enCoursLabel: string;
    estSelectionne: boolean;
    onSelectionner: (projet: Projet) => void;
    scrollLeft: number;
    containerWidth: number;
    cardWidth: number;
    gap: number;
    dict?: ProjetsDict;
}

/**
 * Carte de projet secondaire à fond couleur secondaire (#43654f) :
 * - Format compact horizontal
 * - Effet d'écrasement cinétique aux extrémités gauche et droite :
 *   sauf au tout début (scrollLeft <= 5) où le premier élément reste intact.
 */
function ProjetSecondaireCarte({
    projet,
    index,
    enCoursLabel,
    estSelectionne,
    onSelectionner,
    scrollLeft,
    containerWidth,
    cardWidth,
    gap,
    dict,
}: ProjetSecondaireCarteProps) {
    // Calcul géométrique de position relative au conteneur visible
    const cardStart = index * (cardWidth + gap);
    const visibleLeft = cardStart - scrollLeft;
    const visibleRight = visibleLeft + cardWidth;

    let scaleX = 1;
    let scaleY = 1;
    let opacity = 1;
    let transformOrigin = "center center";

    // Écrasement à l'extrémité GAUCHE (actif seulement après défilement)
    if (scrollLeft > 6 && visibleLeft < 80) {
        const ratio = Math.max(0.68, Math.min(1, (visibleLeft + 120) / 200));
        scaleX = ratio;
        scaleY = 0.88 + 0.12 * ratio;
        opacity = 0.45 + 0.55 * ratio;
        transformOrigin = "right center";
    }
    // Écrasement à l'extrémité DROITE
    else if (containerWidth > 0 && containerWidth - visibleRight < 90) {
        const ratio = Math.max(
            0.68,
            Math.min(1, (containerWidth - visibleLeft) / (cardWidth + 90))
        );
        scaleX = ratio;
        scaleY = 0.88 + 0.12 * ratio;
        opacity = 0.45 + 0.55 * ratio;
        transformOrigin = "left center";
    }

    return (
        <motion.div
            style={{
                scaleX,
                scaleY,
                opacity,
                transformOrigin,
            }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectionner(projet)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectionner(projet);
                }
            }}
            aria-label={`${dict?.selectionnerProjet ?? "Afficher ce projet"} : ${projet.nom}`}
            className={`shrink-0 w-[260px] sm:w-[290px] h-[130px] sm:h-[140px] p-4 sm:p-4.5 rounded-2xl flex flex-col justify-between select-none cursor-pointer border ${
                estSelectionne
                    ? "bg-secondary text-white border-white ring-2 ring-white/40"
                    : "bg-secondary text-white border-white/20 hover:border-white/50"
            }`}
        >
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-white/75">
                    <span className="px-2 py-0.5 rounded-full bg-black/25 border border-white/15">
                        {projet.dateDebut} → {projet.dateFin ?? enCoursLabel}
                    </span>
                    <span className="font-bold text-white/90">
                        #{String(index + 1).padStart(2, "0")}
                    </span>
                </div>

                <h3 className="font-display font-bold text-lg sm:text-xl uppercase tracking-tight text-white leading-tight line-clamp-1">
                    {projet.nom}
                </h3>
            </div>

            {/* Compétences clés associées */}
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
                {projet.competences.slice(0, 3).map((comp) => (
                    <span
                        key={comp}
                        className="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-white/15 text-white border border-white/20 whitespace-nowrap"
                    >
                        {comp}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

/**
 * Section Projets cinématique unifiée :
 * - Scrollytelling synchronisé (apparition, plateau de lecture fluide, disparition)
 * - Titre "Ce que j'ai fait" avec éclosion typographique mot-à-mot à la même taille que les autres scènes
 * - Encadré principal couleur primaire (#3f7694) pour le projet le plus récent avec détails et carrousel photos
 * - Bandeau inférieur horizontal de cartes secondaires couleur secondaire (#43654f) avec effet d'écrasement aux extrémités
 */
export default function ProjetsSection({
    titre,
    enCoursLabel = "En cours",
    dict,
    projets,
    progress,
}: ProjetsProps) {
    const scrollStripRef = useRef<HTMLDivElement>(null);

    const [scrollLeft, setScrollLeft] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Détermination déterministe du dernier projet par date
    const dernierProjet = useMemo(() => {
        if (!projets || projets.length === 0) return null;
        return [...projets].sort((a, b) => {
            const dateA = a.dateFin ?? a.dateDebut;
            const dateB = b.dateFin ?? b.dateDebut;
            return dateB.localeCompare(dateA);
        })[0];
    }, [projets]);

    // Projet actuellement sélectionné dans le panneau vedette (par défaut le plus récent)
    const [projetActifId, setProjetActifId] = useState<string | null>(null);

    const projetActif = useMemo(() => {
        if (!projets || projets.length === 0) return null;
        if (projetActifId) {
            const trouve = projets.find((p) => p.id === projetActifId);
            if (trouve) return trouve;
        }
        return dernierProjet;
    }, [projets, projetActifId, dernierProjet]);

    // Autres projets pour la bandelette secondaire horizontale
    const autresProjets = useMemo(() => {
        if (!projets || !projetActif) return [];
        return projets.filter((p) => p.id !== projetActif.id);
    }, [projets, projetActif]);

    // Transforms cinématiques synchronisés avec la sortie de Compétences (0.85 -> 0.91)
    const stageY = useTransform(
        progress,
        [0.85, 0.91, 0.97, 1.00],
        [140, 0, -20, -160]
    );

    const enterOpacity = useTransform(progress, [0.85, 0.91], [0, 1]);
    const exitOpacity = useTransform(progress, [0.97, 1.00], [1, 0]);
    const exitBlur = useTransform(progress, [0.97, 1.00], ["blur(0px)", "blur(12px)"]);

    const combinedOpacity = useTransform(
        [enterOpacity, exitOpacity],
        ([a, b]) => (a as number) * (b as number)
    );

    const pointerEvents = useTransform(progress, (p) =>
        p >= 0.86 && p <= 0.99 ? "auto" : "none"
    );

    const visibility = useTransform(progress, (p) =>
        p >= 0.84 && p <= 1.01 ? "visible" : "hidden"
    );

    const motsTitre = useMemo(() => titre.split(" "), [titre]);

    // Gestion du dimensionnement et du défilement horizontal de la bandelette secondaire
    const mesurerBandelette = useCallback(() => {
        if (scrollStripRef.current) {
            setContainerWidth(scrollStripRef.current.clientWidth);
            setScrollLeft(scrollStripRef.current.scrollLeft);
        }
        setIsMobile(window.innerWidth < 640);
    }, []);

    useEffect(() => {
        mesurerBandelette();
        window.addEventListener("resize", mesurerBandelette, { passive: true });
        return () => window.removeEventListener("resize", mesurerBandelette);
    }, [mesurerBandelette]);

    const handleStripScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollLeft(e.currentTarget.scrollLeft);
    };

    const cardWidth = isMobile ? 260 : 290;
    const gap = 16;

    const defilerBandelette = (directionDelta: number) => {
        if (!scrollStripRef.current) return;
        scrollStripRef.current.scrollBy({
            left: directionDelta * (cardWidth + gap) * 1.5,
            behavior: "smooth",
        });
    };

    return (
        <motion.div
            style={{
                y: stageY,
                opacity: combinedOpacity,
                filter: exitBlur,
                visibility,
            }}
            className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-4 sm:p-8 will-change-transform select-none"
        >
            <motion.div
                style={{ pointerEvents }}
                className="w-full max-w-5xl flex flex-col gap-4 sm:gap-5"
            >
                    {/* Titre unifié avec cascade optique mot-à-mot (même gabarit que Compétences et Vision) */}
                    <div className="w-full flex items-center justify-between">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold uppercase tracking-tight text-white leading-[0.95]">
                            {motsTitre.map((mot, index) => (
                                <ProjetWord
                                    key={index}
                                    mot={mot}
                                    index={index}
                                    total={motsTitre.length}
                                    progress={progress}
                                />
                            ))}
                        </h2>
                    </div>

                    {/* ENCADRÉ PRINCIPAL : COULEUR PRIMAIRE (#3f7694) POUR LE DERNIER PROJET */}
                    {projetActif && (
                        <motion.article
                            layout
                            className="relative w-full rounded-[28px] bg-primary text-white p-6 sm:p-8 md:p-9 border border-white/20 shadow-none overflow-hidden flex flex-col md:flex-row gap-6 md:gap-8 h-[48vh] sm:h-[50vh] min-h-[360px] max-h-[470px]"
                        >
                            {/* Moitié GAUCHE : Détails du projet */}
                            <div className="w-full md:w-1/2 flex flex-col justify-between gap-4 z-10">
                                <div className="flex flex-col gap-3 sm:gap-4">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="font-mono text-xs uppercase tracking-wider text-white/90 bg-white/15 px-3 py-1 rounded-full border border-white/20">
                                            {projetActif.dateDebut} → {projetActif.dateFin ?? enCoursLabel}
                                        </span>

                                        <span className="font-mono text-[11px] font-bold text-white/80 bg-black/25 px-2.5 py-1 rounded-full border border-white/15 uppercase">
                                            {dict?.dernierProjetBadge ?? "DERNIÈRE RÉALISATION"}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight leading-[0.96] text-white">
                                        {projetActif.nom}
                                    </h3>

                                    <p className="font-body text-xs sm:text-sm md:text-base text-white/90 leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-4 md:line-clamp-5">
                                        {projetActif.description}
                                    </p>
                                </div>

                                {/* Compétences associées au projet */}
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {projetActif.competences.map((c) => (
                                        <span
                                            key={c}
                                            className="px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold bg-white/15 text-white border border-white/20"
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Moitié DROITE : Carrousel moderne animé avec les photos */}
                            <div className="w-full md:w-1/2 h-full z-10 flex items-center">
                                <ProjetPhotoCarousel
                                    key={projetActif.id}
                                    images={projetActif.images}
                                    nomProjet={projetActif.nom}
                                    dict={dict}
                                />
                            </div>
                        </motion.article>
                    )}

                    {/* BANDEAU INFÉRIEUR : AUTRES PROJETS EN COULEUR SECONDAIRE (#43654f) */}
                    {autresProjets.length > 0 && (
                        <div className="relative w-full flex flex-col gap-2">
                            {/* Bandelette horizontale défilable */}
                            <div
                                ref={scrollStripRef}
                                onScroll={handleStripScroll}
                                className="w-full overflow-x-auto scrollbar-none flex items-center gap-4 py-1.5 px-0.5"
                            >
                                {autresProjets.map((projet, idx) => (
                                    <ProjetSecondaireCarte
                                        key={projet.id}
                                        projet={projet}
                                        index={idx}
                                        enCoursLabel={enCoursLabel}
                                        estSelectionne={projet.id === projetActif?.id}
                                        onSelectionner={(p) => setProjetActifId(p.id)}
                                        scrollLeft={scrollLeft}
                                        containerWidth={containerWidth}
                                        cardWidth={cardWidth}
                                        gap={gap}
                                        dict={dict}
                                    />
                                ))}
                            </div>

                            {/* Boutons de défilement horizontal discrets */}
                            {containerWidth > 0 && (
                                <div className="hidden sm:flex items-center justify-end gap-2 pt-1">
                                    <motion.button
                                        type="button"
                                        onClick={() => defilerBandelette(-1)}
                                        disabled={scrollLeft <= 5}
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.92 }}
                                        aria-label={dict?.defilerGauche ?? "Défiler vers la gauche"}
                                        className={`w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer ${
                                            scrollLeft <= 5
                                                ? "border-white/15 text-white/20 cursor-not-allowed"
                                                : "border-white/30 text-white hover:bg-white hover:text-carbon-black"
                                        }`}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M15 18l-6-6 6-6" />
                                        </svg>
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        onClick={() => defilerBandelette(1)}
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.92 }}
                                        aria-label={dict?.defilerDroite ?? "Défiler vers la droite"}
                                        className="w-7 h-7 rounded-full border border-white/30 text-white hover:bg-white hover:text-carbon-black flex items-center justify-center cursor-pointer"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    )}
            </motion.div>
        </motion.div>
    );
}
