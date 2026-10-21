"use client";

import { useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import type { MotionValue } from "framer-motion";
import { Competence } from "@/app/modeles/Competence";

interface AgentUnifiedFlightProps {
    agents?: Competence[];
    progress: MotionValue<number>;
}

interface AgentItem {
    id: string;
    nom: string;
    src: string;
}

/**
 * Composant UNIFIÉ des agents IA :
 * - Aucune rupture : ce sont les MÊMES icônes du début à la fin.
 * - Acte 3 (Vision, p in [0.52, 0.68]) : éclosion en cercle à gauche avec flottaison harmonique.
 * - Transition vers Compétences (p >= 0.68) : les icônes quittent le cercle et se déplacent
 *   EN SE SUIVANT le long d'une trajectoire courbe alpine continue vers le Globe 3D.
 * - Arrivée sur le Globe : chaque icône s'ancre à son emplacement 3D réel dans la rotation.
 */
export default function AgentUnifiedFlight({ agents, progress }: AgentUnifiedFlightProps) {
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const animFrameRef = useRef<number | null>(null);
    const integreeStateRef = useRef<Map<string, boolean>>(new Map());
    const sLisseRef = useRef<number>(0);

    // Liste des agents IA ordonnée
    const itemsAgents: AgentItem[] = useMemo(() => {
        if (agents && agents.length > 0) {
            return agents.map((c) => ({
                id: c.id,
                nom: c.nom,
                src: c.logoUrl || `/${c.nom.toLowerCase()}.webp`,
            }));
        }
        return [
            { id: "c7c279f8-3257-4ac6-87ab-e9b6a7e1bdff", nom: "Claude", src: "/claude.webp" },
            { id: "14692ab9-2a8b-466d-a62a-bc61b29b1f5f", nom: "Gemini", src: "/gemini.webp" },
            { id: "d285b061-0178-4b75-bf7a-e25b9b6800b6", nom: "ChatGPT", src: "/chatgpt.webp" },
            { id: "69a5529d-2b67-44f3-a3f0-722ace1d395b", nom: "Mistral", src: "/mistral.webp" },
            { id: "30c1eeef-6508-4ea2-831e-7f1afa963e21", nom: "DeepSeek", src: "/deepseek.webp" },
        ];
    }, [agents]);

    useEffect(() => {
        let running = true;
        const total = itemsAgents.length || 5;

        const tick = (now: number) => {
            if (!running) return;

            const p = progress.get();
            const time = now * 0.002;
            const isMobile = window.innerWidth < 640;
            const tailleInitiale = isMobile ? 40 : 52;

            // 1. Récupération de l'ancre de la Vision (zone gauche où était la photo)
            const anchorEl = document.getElementById("agent-vision-anchor");
            const anchorRect = anchorEl?.getBoundingClientRect();
            const cx = anchorRect
                ? anchorRect.left + anchorRect.width / 2
                : window.innerWidth * 0.28;
            const cy = anchorRect
                ? anchorRect.top + anchorRect.height / 2
                : window.innerHeight * 0.50;

            const rCercle = isMobile ? 66 : 94;

            // CAS 1 : Avant l'Acte 3 de la Vision (p < 0.38) -> invisibles
            if (p < 0.38) {
                itemsAgents.forEach((agent, i) => {
                    const el = itemRefs.current[i];
                    if (el) el.style.opacity = "0";

                    if (integreeStateRef.current.get(agent.id)) {
                        integreeStateRef.current.set(agent.id, false);
                        window.dispatchEvent(
                            new CustomEvent("agent-desintegre", { detail: { id: agent.id } })
                        );
                    }
                });
                animFrameRef.current = requestAnimationFrame(tick);
                return;
            }

            // CAS 2 : Dans la Vision (0.38 <= p < 0.64) -> Éclosion et CERCLE STABLE AVEC FLOTTAISON (état d'arrêt officiel)
            if (p < 0.64) {
                const tEclosion = Math.min(1, Math.max(0, (p - 0.38) / 0.12));
                const easeEc = tEclosion * tEclosion * (3 - 2 * tEclosion);
                sLisseRef.current = 0;

                itemsAgents.forEach((agent, i) => {
                    const el = itemRefs.current[i];
                    if (!el) return;

                    if (integreeStateRef.current.get(agent.id)) {
                        integreeStateRef.current.set(agent.id, false);
                        window.dispatchEvent(
                            new CustomEvent("agent-desintegre", { detail: { id: agent.id } })
                        );
                    }

                    const angle = -Math.PI / 2 + i * ((2 * Math.PI) / total);
                    const orbite = rCercle * easeEc;
                    const ondeX = Math.cos(time * 1.8 + i * 1.25) * 5 * easeEc;
                    const ondeY = Math.sin(time * 1.8 + i * 1.25) * 5 * easeEc;

                    const curX = cx + orbite * Math.cos(angle) + ondeX;
                    const curY = cy + orbite * Math.sin(angle) + ondeY;

                    el.style.opacity = `${easeEc}`;
                    el.style.transform = `translate3d(${curX - tailleInitiale / 2}px, ${curY - tailleInitiale / 2}px, 0) scale(${easeEc})`;
                });

                animFrameRef.current = requestAnimationFrame(tick);
                return;
            }

            // CAS 3 : Transition vers le Globe 3D déclenchée de manière fluide (p >= 0.64)
            // Synchronisation exacte avec l'apparition du globe (0.64 -> 0.76)
            const sCible = Math.max(0, Math.min(1, (p - 0.64) / (0.76 - 0.64)));
            // Suivi feutré et dynamique
            sLisseRef.current += (sCible - sLisseRef.current) * 0.14;
            const s = sLisseRef.current;

            itemsAgents.forEach((agent, i) => {
                const el = itemRefs.current[i];
                if (!el) return;

                // Position de départ du cercle
                const angle = -Math.PI / 2 + i * ((2 * Math.PI) / total);
                const departX = cx + rCercle * Math.cos(angle);
                const departY = cy + rCercle * Math.sin(angle);

                // Position cible en direct sur le Globe 3D
                const targetEl = document.getElementById(`globe-competence-${agent.id}`);
                const targetRect = targetEl?.getBoundingClientRect();

                const cibleX = targetRect
                    ? targetRect.left + targetRect.width / 2
                    : window.innerWidth * 0.65;
                const cibleY = targetRect
                    ? targetRect.top + targetRect.height / 2
                    : cy;
                const cibleTaille = targetRect ? Math.max(26, targetRect.width) : tailleInitiale * 0.80;

                // Point de contrôle de la courbe alpine en cloche
                const ctrlX = (departX + cibleX) / 2;
                const ctrlY = Math.min(departY, cibleY) - (isMobile ? 40 : 70);

                // Décalage en procession : vol fluide avec arrivée calée à s = 1
                const fenetreStart = i * 0.08;
                const fenetreDuree = 0.52;
                const uRaw = Math.max(0, Math.min(1, (s - fenetreStart) / fenetreDuree));

                if (uRaw <= 0) {
                    // Phase d'attente dans le cercle de Vision
                    if (integreeStateRef.current.get(agent.id)) {
                        integreeStateRef.current.set(agent.id, false);
                        window.dispatchEvent(
                            new CustomEvent("agent-desintegre", { detail: { id: agent.id } })
                        );
                    }
                    const ondeX = Math.cos(time * 1.8 + i * 1.25) * 5;
                    const ondeY = Math.sin(time * 1.8 + i * 1.25) * 5;
                    const curX = departX + ondeX;
                    const curY = departY + ondeY;

                    el.style.opacity = "1";
                    el.style.transform = `translate3d(${curX - tailleInitiale / 2}px, ${curY - tailleInitiale / 2}px, 0) scale(1)`;
                } else if (uRaw < 1 && s < 0.85) {
                    // En vol le long de la courbe avec easing sinusoïdal
                    const u = 0.5 * (1 - Math.cos(Math.PI * uRaw));

                    if (integreeStateRef.current.get(agent.id)) {
                        integreeStateRef.current.set(agent.id, false);
                        window.dispatchEvent(
                            new CustomEvent("agent-desintegre", { detail: { id: agent.id } })
                        );
                    }

                    // Courbe quadratique de Bézier
                    const oneMinusU = 1 - u;
                    const curX = oneMinusU * oneMinusU * departX + 2 * oneMinusU * u * ctrlX + u * u * cibleX;
                    const curY = oneMinusU * oneMinusU * departY + 2 * oneMinusU * u * ctrlY + u * u * cibleY;

                    const curTaille = tailleInitiale + (cibleTaille - tailleInitiale) * u;
                    const curScale = curTaille / tailleInitiale;

                    el.style.opacity = "1";
                    el.style.transform = `translate3d(${curX - tailleInitiale / 2}px, ${curY - tailleInitiale / 2}px, 0) scale(${curScale})`;
                } else {
                    // Arrivée accomplie : transmission totale au Globe 3D et disparition immédiate de la couche de vol
                    if (!integreeStateRef.current.get(agent.id)) {
                        integreeStateRef.current.set(agent.id, true);
                        window.dispatchEvent(
                            new CustomEvent("agent-integre", { detail: { id: agent.id } })
                        );
                    }
                    el.style.opacity = "0";
                    el.style.transform = "translate3d(-999px, -999px, 0)";
                }
            });

            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);

        return () => {
            running = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [progress, itemsAgents]);

    return (
        <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-visible">
            {itemsAgents.map((agent, i) => (
                <div
                    key={agent.id}
                    ref={(el) => {
                        itemRefs.current[i] = el;
                    }}
                    className="absolute top-0 left-0 w-[40px] h-[40px] sm:w-[52px] sm:h-[52px] flex items-center justify-center select-none will-change-transform bg-transparent p-0 opacity-0 pointer-events-none"
                    style={{
                        transform: "translate3d(-999px, -999px, 0)",
                    }}
                >
                    <div className="relative w-full h-full select-none pointer-events-none flex items-center justify-center">
                        <Image
                            src={agent.src}
                            alt={agent.nom}
                            fill
                            sizes="128px"
                            quality={90}
                            className="object-contain"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
