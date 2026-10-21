"use client";

import { motion } from "framer-motion";
import { Experience } from "@/app/modeles/Experience";
import Anm from "@/app/components/Animator3000";

interface ExperiencesProps {
    titre: string;
    badge: string;
    presentLabel: string;
    jalonsLabel: string;
    experiences: Experience[];
}

/**
 * Section Expériences / Parcours conforme à DESIGN.md :
 * Chronologie éditoriale sur axe Hairline (#c2ccd6),
 * 100% des textes issus du dictionnaire.
 */
export default function ExperiencesSection({
    titre,
    badge,
    presentLabel,
    jalonsLabel,
    experiences,
}: ExperiencesProps) {
    return (
        <section
            id="parcours"
            className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-20 sm:py-28 flex flex-col gap-12"
            aria-label={titre}
        >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-ash/50">
                <div className="flex flex-col gap-2">
                    <Anm>
                        <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                            {badge}
                        </span>
                    </Anm>
                    <Anm delay={0.1}>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold uppercase tracking-tight text-foreground leading-[0.95]">
                            {titre}
                        </h2>
                    </Anm>
                </div>

                <Anm delay={0.2}>
                    <span className="font-mono text-xs text-smoke">
                        {experiences.length} {jalonsLabel}
                    </span>
                </Anm>
            </div>

            {/* Ligne chronologique éditoriale */}
            <div className="relative border-l-2 border-ash/50 ml-4 sm:ml-8 pl-6 sm:pl-10 flex flex-col gap-10">
                {experiences.map((exp, idx) => (
                    <Anm key={exp.id} delay={0.1 * idx}>
                        <div className="relative flex flex-col gap-3">
                            {/* Point de repère géométrique sur l'axe */}
                            <span
                                className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-4 border-background"
                                aria-hidden="true"
                            />

                            {/* Carte de jalon */}
                            <motion.div
                                whileHover={{ x: 3 }}
                                className="p-6 sm:p-8 rounded-[24px] bg-white border border-ash/40 flex flex-col gap-3 select-none"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                                    <span className="px-3 py-1 rounded-full bg-mist-gray text-primary font-bold uppercase">
                                        {exp.dateDebut} → {exp.dateFin ?? presentLabel}
                                    </span>
                                    <span className="text-smoke font-medium">
                                        {exp.lieu}
                                    </span>
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-foreground">
                                    {exp.nom}
                                </h3>

                                <p className="text-sm sm:text-base text-slate leading-relaxed font-normal whitespace-pre-line">
                                    {exp.description}
                                </p>
                            </motion.div>
                        </div>
                    </Anm>
                ))}
            </div>
        </section>
    );
}
