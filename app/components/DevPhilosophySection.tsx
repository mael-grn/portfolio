"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Anm from "@/app/components/Animator3000";

interface DevProps {
    titre: string;
    description: string;
    badge: string;
    outils: {
        claudeRole: string;
        geminiRole: string;
        chatgptRole: string;
    };
}

/**
 * Section Développeur / Vision Inverted Card conforme à DESIGN.md :
 * Surface sombre #20272e, 32px-48px radius, contraste élevé, 100% textes issus du dictionnaire.
 */
export default function DevPhilosophySection({
    titre,
    description,
    badge,
    outils,
}: DevProps) {
    const cartesOutils = [
        { nom: "Claude", src: "/claude.webp", role: outils.claudeRole },
        { nom: "Gemini", src: "/gemini.webp", role: outils.geminiRole },
        { nom: "ChatGPT", src: "/chatgpt.jpg", role: outils.chatgptRole },
    ];

    return (
        <section
            id="vision"
            data-theme="dark"
            className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-12"
            aria-label={titre}
        >
            <div className="w-full bg-foreground text-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-14 md:p-16 flex flex-col gap-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="flex flex-col gap-3 max-w-2xl">
                        <Anm>
                            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
                                {badge}
                            </span>
                        </Anm>

                        <Anm delay={0.1}>
                            <h2 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-white leading-[0.95]">
                                {titre}
                            </h2>
                        </Anm>
                    </div>

                    <Anm delay={0.2} className="md:max-w-sm">
                        <p className="text-sm sm:text-base text-smoke leading-relaxed">
                            {description}
                        </p>
                    </Anm>
                </div>

                {/* Grille d'outils flat */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {cartesOutils.map((outil, idx) => (
                        <Anm key={outil.nom} delay={0.1 * idx}>
                            <motion.div
                                whileHover={{ y: -2 }}
                                className="flex items-center gap-4 p-5 rounded-[20px] bg-white/5 border border-white/10 select-none"
                            >
                                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/20 bg-background/10">
                                    <Image
                                        src={outil.src}
                                        alt={outil.nom}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-sm font-bold text-white uppercase tracking-tight">
                                        {outil.nom}
                                    </span>
                                    <span className="font-mono text-xs text-smoke">
                                        {outil.role}
                                    </span>
                                </div>
                            </motion.div>
                        </Anm>
                    ))}
                </div>
            </div>
        </section>
    );
}
