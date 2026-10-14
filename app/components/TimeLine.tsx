"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Experience } from "@/app/modeles/Experience";
import { formaterDate } from "@/app/lib/dates";
import { Locale } from "@/app/lib/langues";

interface TimelineProps {
    titre?: string;
    elements: Experience[];
    lang: Locale;
    presentLabel: string;
}

export default function Timeline({ titre = "Parcours", elements, lang, presentLabel }: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Les expériences arrivent déjà triées par date de début (tri fait par la requête SQL).

    // Se révèle au fur et à mesure que la ligne traverse les 2/3 de l'écran (66% du viewport en partant du haut)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 66%", "end 66%"],
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 140,
        damping: 26,
        restDelta: 0.001,
    });

    return (
        <section
            ref={containerRef}
            className="relative w-full max-w-5xl mx-auto py-20 px-4 sm:px-8 text-background select-none"
        >
            {/* Titre optionnel épuré */}
            {titre && (
                <motion.div
                    initial={{ opacity: 0, y: -25, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-24 flex items-center justify-center sm:justify-start"
                >
                    <code className="text-sm sm:text-base tracking-widest uppercase font-mono px-3 py-1 border border-background/20 rounded-md bg-background/5 text-background">
                        {titre}
                    </code>
                </motion.div>
            )}

            <div className="relative">
                {/* 1. Ligne de base : Épaisse en pointillés */}
                <div
                    className="absolute left-3 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 border-l-[3px] border-dashed border-background/25 pointer-events-none"
                />

                {/* 2. Ligne animée révélée au scroll : Épaisse et pleine */}
                <motion.div
                    style={{ scaleY }}
                    className="absolute left-3 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 w-[3px] bg-background origin-top pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                />

                {/* Liste des parcours sans conteneur de carte */}
                <div className="flex flex-col gap-20 sm:gap-28">
                    {elements.map((item, index) => (
                        <TimelineItem key={item.id} item={item} index={index} lang={lang} presentLabel={presentLabel} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TimelineItem({ item, index, lang, presentLabel }: { item: Experience; index: number; lang: Locale; presentLabel: string }) {
    const isEven = index % 2 === 0;

    return (
        <div
            className={`relative flex items-start sm:items-baseline ${
                isEven ? "sm:flex-row-reverse" : "sm:flex-row"
            } pl-10 sm:pl-0 gap-6 sm:gap-14`}
        >
            {/* Point basique réactif au seuil des 2/3 de l'écran */}
            <div className="absolute left-3 sm:left-1/2 -translate-x-1/2 top-1.5 flex items-center justify-center z-10">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0.3 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ margin: "0px 0px -34% 0px" }} // Déclenché précisément quand l'élément atteint les 2/3 de l'écran
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    className="relative flex items-center justify-center w-3.5 h-3.5"
                >
                    {/* Point simple plein */}
                    <span className="w-3.5 h-3.5 rounded-full bg-background shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

                    {/* Halo d'apparition à la révélation */}
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: [1, 2.2, 2.4], opacity: [0.8, 0.4, 0] }}
                        viewport={{ margin: "0px 0px -34% 0px" }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute w-full h-full rounded-full border border-background pointer-events-none"
                    />
                </motion.div>
            </div>

            {/* Contenu textuel sans boîte/carte */}
            <motion.div
                initial={{
                    opacity: 0,
                    x: isEven ? 40 : -40,
                    filter: "blur(8px)",
                }}
                whileInView={{
                    opacity: 1,
                    x: 0,
                    filter: "blur(0px)",
                }}
                viewport={{ margin: "0px 0px -34% 0px" }}
                transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                }}
                className={`w-full sm:w-[calc(50%-2.5rem)] flex flex-col ${
                    isEven ? "sm:text-right sm:items-end" : "sm:text-left sm:items-start"
                }`}
            >
                {/* Date / Période */}
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "0px 0px -34% 0px" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-mono text-xs tracking-wider uppercase text-background/60 mb-1"
                >
                    {formaterDate(item.dateDebut, lang)} — {item.dateFin ? formaterDate(item.dateFin, lang) : presentLabel}
                </motion.span>

                {/* Intitulé principal */}
                <motion.h3
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "0px 0px -34% 0px" }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="text-xl sm:text-2xl font-bold tracking-tight text-background leading-snug"
                >
                    {item.nom}
                </motion.h3>

                {/* Lieu / Établissement */}
                {item.lieu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ margin: "0px 0px -34% 0px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-background/70 font-medium mt-1 mb-3"
                    >
                        <svg
                            className="w-3.5 h-3.5 opacity-60 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21c-4.418-4.418-7-8.582-7-12a7 7 0 1114 0c0 3.418-2.582 7.582-7 12z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 11a2 2 0 100-4 2 2 0 000 4z"
                            />
                        </svg>
                        <span>{item.lieu}</span>
                    </motion.div>
                )}

                {/* Description */}
                {item.description && (
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "0px 0px -34% 0px" }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="text-sm sm:text-base text-background/80 font-light leading-relaxed whitespace-pre-line max-w-xl"
                    >
                        {item.description}
                    </motion.p>
                )}
            </motion.div>

            {/* Espace vide opposé pour conserver l'équilibre alterné gauche / droite sur écran large */}
            <div className="hidden sm:block sm:w-[calc(50%-2.5rem)]" />
        </div>
    );
}