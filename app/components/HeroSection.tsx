"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";

interface HeroProps {
    titre: string;
    description: string;
}

const EASING_ALPINE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero section éditoriale brutale conforme à DESIGN.md :
 * - Image de fond hero.jpeg avec animation motion design développée :
 *   - Expansion cinématique du diaphragme géométrique (clipPath interpolé & scale fluide).
 *   - Dézoom d'optique caméra 35mm (de scale 1.28 à 1.05 avec léger pan vertical).
 *   - Transition de netteté progressive (dissipation de flou et étalonnage d'exposition).
 *   - Repères de cadrage télémétriques et balayage d'horizon éphémères.
 *   - Parallaxe mesurée au scroll pour une continuité de scrollytelling vivante.
 * - Titre apparaissant mot par mot avec fondu de flou, puis calé rigoureusement sur le bord gauche.
 */
export default function HeroSection({
    titre,
    description,
}: HeroProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [phase, setPhase] = useState<"centre" | "basGauche">("centre");

    // Parallaxe alpine au défilement (scrollytelling)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const springScroll = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const imageY = useTransform(springScroll, [0, 1], ["0%", "18%"]);
    const imageScaleScroll = useTransform(springScroll, [0, 1], [1, 1.1]);

    const mots = titre.split(" ");

    useEffect(() => {
        // Laisser le temps à tous les mots d'apparaître un à un avant de décaler le titre
        const timer = setTimeout(() => {
            setPhase("basGauche");
        }, 1800);

        return () => clearTimeout(timer);
    }, []);

    const estDecale = phase === "basGauche";

    return (
        <section
            ref={sectionRef}
            id="intro"
            className="relative w-full min-h-screen h-screen overflow-hidden bg-background flex flex-col justify-end select-none"
            aria-label={titre}
        >
            {/* Conteneur externe de l'image : Masque de déploiement cinématique (Motion Design Wipe) */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
                initial={{
                    opacity: 0,
                    clipPath: "inset(32% 20% 32% 20% round 48px)",
                    scale: 0.92,
                }}
                animate={{
                    opacity: estDecale ? 1 : 0.04,
                    clipPath: estDecale
                        ? "inset(0% 0% 0% 0% round 0px)"
                        : "inset(32% 20% 32% 20% round 48px)",
                    scale: estDecale ? 1 : 0.92,
                }}
                transition={{
                    duration: 1.85,
                    delay: 0.1,
                    ease: EASING_ALPINE,
                }}
            >
                {/* Image interne : Mouvement de caméra optique (Ken Burns inversé + parallaxe au scroll) */}
                <motion.div
                    style={{ y: imageY, scale: imageScaleScroll }}
                    className="relative w-full h-full"
                >
                    <motion.div
                        className="relative w-full h-full"
                        initial={{
                            scale: 1.3,
                            y: -25,
                            filter: "blur(18px) brightness(1.25) contrast(0.85)",
                        }}
                        animate={{
                            scale: estDecale ? 1.05 : 1.3,
                            y: estDecale ? 0 : -25,
                            filter: estDecale ? "blur(0px)" : "blur(18px)",
                        }}
                        transition={{
                            duration: 2.1,
                            delay: 0.1,
                            ease: EASING_ALPINE,
                        }}
                    >
                        <Image
                            src="/hero.jpeg"
                            alt={titre}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                    </motion.div>
                </motion.div>


            </motion.div>

            {/* Zone de mise en page du Titre : FLIP fluide du centre vers le bas totalement à gauche */}
            <div
                className={`relative z-20 flex-1 flex p-6 sm:p-12 md:p-16 transition-none ${
                    estDecale
                        ? "items-end justify-start"
                        : "items-center justify-center"
                }`}
            >
                <motion.div
                    layout
                    transition={{
                        duration: 1.4,
                        ease: EASING_ALPINE,
                    }}
                    className={`flex flex-col max-w-5xl w-full ${
                        estDecale
                            ? "items-start text-left"
                            : "items-center text-center"
                    }`}
                >
                    {/* Titre : très grand, couleur sombre (#20272e), strictement calé à gauche */}
                    <motion.h1
                        layout
                        style={{ originX: 0, originY: 1 }}
                        transition={{
                            duration: 1.4,
                            ease: EASING_ALPINE,
                        }}
                        className={`font-display font-bold uppercase tracking-tight text-foreground leading-[0.88] w-full ${
                            estDecale
                                ? "text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] text-left"
                                : "text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[11rem] text-center"
                        }`}
                    >
                        {mots.map((mot, index) => (
                            <motion.span
                                key={index}
                                className="inline-block mr-[0.25em] last:mr-0"
                                initial={{
                                    opacity: 0,
                                    y: 50,
                                    filter: "blur(14px)",
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    filter: "blur(0px)",
                                }}
                                transition={{
                                    duration: 0.85,
                                    delay: 0.15 + index * 0.15,
                                    ease: EASING_ALPINE,
                                }}
                            >
                                {mot}
                            </motion.span>
                        ))}
                    </motion.h1>

                    {/* Description sous le titre : strictement alignée sur le même bord gauche */}
                    <AnimatePresence>
                        {estDecale && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.35,
                                    ease: EASING_ALPINE,
                                }}
                                className="mt-6 flex flex-col items-start text-left max-w-2xl w-full"
                            >
                                <p className="text-base sm:text-lg md:text-xl text-foreground/90 font-medium leading-relaxed text-left w-full">
                                    {description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
