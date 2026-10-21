"use client";

import Image from "next/image";
import Anm from "@/app/components/Animator3000";

interface AboutProps {
    titre: string;
    description: string;
    badge: string;
    metadonnees: {
        experience: string;
        experienceVal: string;
        methodologie: string;
        methodologieVal: string;
        environnement: string;
        environnementVal: string;
    };
}

/**
 * Section À propos / Profil conforme à DESIGN.md :
 * Standard Card blanche (32px radius) sur canvas slate (#dfe5ed),
 * portrait épuré, tag sage green, et 100% textes issus du dictionnaire.
 */
export default function AboutSection({
    titre,
    description,
    badge,
    metadonnees,
}: AboutProps) {
    return (
        <section
            id="moi"
            className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-20 sm:py-28"
            aria-label={titre}
        >
            <div className="w-full bg-white rounded-[32px] border border-ash/40 p-6 sm:p-12 md:p-16 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                {/* Photo de profil géométrique sans ombre */}
                <div className="w-48 h-48 sm:w-64 sm:h-64 shrink-0 relative">
                    <Anm scale={0.9} duration={1}>
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-[28px] overflow-hidden bg-mist-gray border border-ash/60">
                            <Image
                                src="/me.png"
                                alt={titre}
                                fill
                                sizes="(max-width: 640px) 192px, 256px"
                                className="object-cover object-top"
                            />
                        </div>
                    </Anm>
                </div>

                {/* Contenu textuel éditorial */}
                <div className="flex flex-col gap-6 flex-1 text-left">
                    <Anm delay={0.1}>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary text-white font-mono text-xs uppercase tracking-wider select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>{badge}</span>
                        </div>
                    </Anm>

                    <Anm delay={0.2}>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold uppercase tracking-tight text-foreground leading-[0.95]">
                            {titre}
                        </h2>
                    </Anm>

                    <Anm delay={0.3}>
                        <p className="text-base sm:text-lg text-slate leading-relaxed font-normal">
                            {description}
                        </p>
                    </Anm>

                    {/* Métadonnées télémétriques */}
                    <Anm delay={0.4}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-ash/30 font-mono text-xs text-smoke">
                            <div>
                                <span className="block text-foreground font-bold uppercase">{metadonnees.experience}</span>
                                <span>{metadonnees.experienceVal}</span>
                            </div>
                            <div>
                                <span className="block text-foreground font-bold uppercase">{metadonnees.methodologie}</span>
                                <span>{metadonnees.methodologieVal}</span>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <span className="block text-foreground font-bold uppercase">{metadonnees.environnement}</span>
                                <span>{metadonnees.environnementVal}</span>
                            </div>
                        </div>
                    </Anm>
                </div>
            </div>
        </section>
    );
}
