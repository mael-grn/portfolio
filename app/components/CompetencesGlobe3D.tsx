"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type MotionValue } from "framer-motion";
import { Competence } from "@/app/modeles/Competence";

const EASING_ALPINE = [0.16, 1, 0.3, 1] as const;

/**
 * Évaluation exacte du Bézier cubique EASING_ALPINE [0.16, 1, 0.3, 1]
 */
function easeAlpine(t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const x1 = 0.16;
    const x2 = 0.3;
    let u = t;
    for (let i = 0; i < 6; i++) {
        const currentX = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
        const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
        if (Math.abs(currentX - t) < 0.0005 || dx === 0) break;
        u -= (currentX - t) / dx;
    }
    u = Math.max(0, Math.min(1, u));
    return 3 * (1 - u) * u + u * u * u;
}

interface FlightState {
    competenceId: string;
    phase: "aller" | "retour";
    startTime: number;
    duration: number;
    startProg: number;
    currentProg: number;
}

interface CompetencesGlobe3DProps {
    competences: Competence[];
    onCompetenceClick?: (competence: Competence) => void;
    scrollProgress?: MotionValue<number>;
    enSavoirPlusLabel?: string;
    selectedCompetenceId?: string | null;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
}

interface DeparturePoint {
    sector: "bas" | "gauche" | "droite";
    offsetXRatio: number;
    offsetYRatio: number;
    startProg: number;
    travelDuration: number;
    curveOffset: number;
}

/**
 * Globe 3D interactif de compétences :
 * - Agencement sphérique resserré de TOUS les logos via l'algorithme doré de Fibonacci sphérique.
 * - Répartition harmonieuse des compétences agentiques (IA) sur la face visible du globe, évitant l'écueil des pôles.
 * - Uniquement les icônes pures (zéro fond, zéro bordure, zéro arrondi / corner radius).
 * - Auto-rotation continue et fluide à 60-120 FPS sans re-render React.
 * - Déplacement naturel au drag (orientation haut/bas directe) avec inertie physique.
 * - Détection précise de clic (différenciée du drag) sur chaque icône.
 */
export default function CompetencesGlobe3D({
    competences,
    onCompetenceClick,
    scrollProgress,
    enSavoirPlusLabel,
    selectedCompetenceId,
}: CompetencesGlobe3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [isGrabbing, setIsGrabbing] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number } | null>(null);
    const hoveredIndexRef = useRef<number | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const mouseFollowRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const targetMouseFollowRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const hoveredCenterRef = useRef<{ x: number; y: number } | null>(null);

    // Gestionnaire de vol cinétique continu entre la sphère 3D et la fiche latérale
    const flightStateRef = useRef<FlightState | null>(null);
    const prevSelectedIdRef = useRef<string | null>(null);
    const lastTargetPosRef = useRef<{ x: number; y: number; scale: number } | null>(null);

    // Déclenchement automatique des transitions de vol aller / retour selon la sélection
    useEffect(() => {
        if (selectedCompetenceId && selectedCompetenceId !== prevSelectedIdRef.current) {
            const currentProg = flightStateRef.current ? flightStateRef.current.currentProg : 0;
            flightStateRef.current = {
                competenceId: selectedCompetenceId,
                phase: "aller",
                startTime: performance.now(),
                duration: 520,
                startProg: currentProg,
                currentProg,
            };
        } else if (!selectedCompetenceId && prevSelectedIdRef.current) {
            const currentProg = flightStateRef.current ? flightStateRef.current.currentProg : 1;
            flightStateRef.current = {
                competenceId: prevSelectedIdRef.current,
                phase: "retour",
                startTime: performance.now(),
                duration: 480,
                startProg: currentProg,
                currentProg,
            };
        }
        prevSelectedIdRef.current = selectedCompetenceId ?? null;
    }, [selectedCompetenceId]);

    // Positions initiales 3D sur la sphère unitaire (Fibonacci)
    const pointsRef = useRef<Point3D[]>([]);

    // Points de départ hors écran pour la formation cinétique du globe au scroll
    const departuresRef = useRef<DeparturePoint[]>([]);

    // Angles et cinématique de rotation
    const rotationXRef = useRef<number>(0.12);
    const rotationYRef = useRef<number>(0);
    const velXRef = useRef<number>(0);
    const velYRef = useRef<number>(0.0028); // vitesse d'auto-rotation par défaut

    // Suivi de l'interaction pointeur
    const isDraggingRef = useRef<boolean>(false);
    const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);

    // Suivi des compétences de catégorie 'agentique' intégrées sur le Globe
    const integreesRef = useRef<Set<string>>(new Set());

    // 0. Harmonisation géométrique : 5 places dédiées réservées sur la face avant visible du Globe 3D
    const competencesHarmonisees = useMemo(() => {
        const agents = competences.filter((c) => c.categorie === "agentique");
        const autres = competences.filter((c) => c.categorie !== "agentique");
        if (agents.length === 0) return competences;

        const N = competences.length;
        const K = agents.length;

        // Indices dédiés fixes sur la sphère de Fibonacci de 36 points :
        // 7  : y = +0.60, x = -0.37, z = +0.71 (Haut gauche avant)
        // 10 : y = +0.43, x = +0.38, z = +0.82 (Haut droite avant)
        // 15 : y = +0.14, x = -0.13, z = +0.98 (Centre plein avant, premier plan)
        // 18 : y = -0.03, x = +0.71, z = +0.71 (Milieu droite avant)
        // 28 : y = -0.60, x = -0.27, z = +0.75 (Bas centre avant)
        const PLACES_DEDIEES_DEFAUT = [7, 10, 15, 18, 28];
        const selectionIndices = PLACES_DEDIEES_DEFAUT.filter((idx) => idx < N).slice(0, K);

        // Repli si N est différent ou s'il y a plus d'agents
        if (selectionIndices.length < K) {
            for (let k = selectionIndices.length; k < K; k++) {
                const fallbackIdx = Math.floor((k + 0.5) * (N / K));
                if (!selectionIndices.includes(fallbackIdx)) {
                    selectionIndices.push(fallbackIdx);
                }
            }
        }

        const setIndicesAgents = new Set(selectionIndices);
        const resultat: Competence[] = new Array(N);

        let agentPtr = 0;
        for (const idx of selectionIndices) {
            if (agentPtr < agents.length) {
                resultat[idx] = agents[agentPtr++];
            }
        }

        let autrePtr = 0;
        for (let i = 0; i < N; i++) {
            if (!setIndicesAgents.has(i)) {
                if (autrePtr < autres.length) {
                    resultat[i] = autres[autrePtr++];
                }
            }
        }

        return resultat.filter(Boolean);
    }, [competences]);

    // 1. Initialisation des coordonnées sphériques de Fibonacci & écouteurs d'intégration
    useEffect(() => {
        const N = competencesHarmonisees.length;
        if (N === 0) return;

        // Si au chargement ou au scroll le globe est déjà dans le champ de vision, intégrer tous les agents
        const integrerTousSiVisible = () => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85) {
                competencesHarmonisees
                    .filter((c) => c.categorie === "agentique")
                    .forEach((c) => integreesRef.current.add(c.id));
            }
        };

        const handleScroll = () => {
            integrerTousSiVisible();
            if (hoveredIndexRef.current !== null) {
                hoveredIndexRef.current = null;
                setHoveredIndex(null);
                setHoveredPos(null);
                targetMouseFollowRef.current = { x: 0, y: 0 };
                mouseFollowRef.current = { x: 0, y: 0 };
            }
        };

        integrerTousSiVisible();
        window.addEventListener("scroll", handleScroll, { passive: true });

        const handleAgentIntegre = (e: Event) => {
            const ce = e as CustomEvent<{ id: string }>;
            if (ce.detail?.id) {
                integreesRef.current.add(ce.detail.id);
            }
        };

        const handleAgentDesintegre = (e: Event) => {
            const ce = e as CustomEvent<{ id: string }>;
            if (ce.detail?.id) {
                integreesRef.current.delete(ce.detail.id);
            }
        };

        window.addEventListener("agent-integre", handleAgentIntegre);
        window.addEventListener("agent-desintegre", handleAgentDesintegre);

        const phi = (1 + Math.sqrt(5)) / 2; // Nombre d'or
        const pts: Point3D[] = [];
        const deps: DeparturePoint[] = [];

        for (let i = 0; i < N; i++) {
            const y = 1 - (i / (N - 1 || 1)) * 2;
            const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
            const theta = 2 * Math.PI * i * phi;

            const x = radiusAtY * Math.cos(theta);
            const z = radiusAtY * Math.sin(theta);

            pts.push({ x, y, z });

            // Trajectoires de départ déterministes venant du bas et des côtés de l'écran
            const hash1 = Math.sin((i + 1) * 127.1 + 311.7) * 43758.5453;
            const rand1 = hash1 - Math.floor(hash1);

            const hash2 = Math.cos((i + 1) * 269.5 + 183.3) * 43758.5453;
            const rand2 = hash2 - Math.floor(hash2);

            const hash3 = Math.sin((i + 1) * 419.2 + 371.9) * 43758.5453;
            const rand3 = hash3 - Math.floor(hash3);

            let sector: "bas" | "gauche" | "droite" = "bas";
            if (rand1 < 0.42) {
                sector = "bas";
            } else if (rand1 < 0.71) {
                sector = "gauche";
            } else {
                sector = "droite";
            }

            // Départs échelonnés pour un effet de nuée cinétique harmonieuse
            const startProg = 0.02 + rand2 * 0.36;
            const travelDuration = 0.54;
            const curveOffset = (rand3 - 0.5) * 140;

            deps.push({
                sector,
                offsetXRatio: rand2,
                offsetYRatio: rand3,
                startProg,
                travelDuration,
                curveOffset,
            });
        }

        pointsRef.current = pts;
        departuresRef.current = deps;

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("agent-integre", handleAgentIntegre);
            window.removeEventListener("agent-desintegre", handleAgentDesintegre);
        };
    }, [competencesHarmonisees]);

    // 2. Boucle d'animation principale à haute fréquence (60-120 FPS sans re-render)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let running = true;

        const tick = () => {
            if (!running) return;

            const width = container.clientWidth || 460;
            const height = container.clientHeight || 460;
            const cx = width / 2;
            const cy = height / 2;

            // Progression de formation cinétique du globe au scroll [0, 1]
            const pProg = scrollProgress ? scrollProgress.get() : 1;
            const formationProg = Math.max(0, Math.min(1, pProg));

            // Rayon optimisé pour une sphère généreuse sans marge morte supérieure
            const R = Math.min(width, height) * 0.38;
            const focalLength = R * 2.8;

            // Fonction d'ancrage exact au pixel près de la cible dans la fiche latérale
            const getTargetPosInGlobe = () => {
                const targetEl = document.getElementById("competence-card-icon-target");
                if (targetEl && container) {
                    const tRect = targetEl.getBoundingClientRect();
                    const cRect = container.getBoundingClientRect();
                    if (tRect.width > 0 && tRect.height > 0) {
                        return {
                            x: tRect.left - cRect.left + tRect.width / 2,
                            y: tRect.top - cRect.top + tRect.height / 2,
                            scale: 1,
                        };
                    }
                }
                const slotEl = document.getElementById("competences-card-slot");
                if (slotEl && container) {
                    const sRect = slotEl.getBoundingClientRect();
                    const cRect = container.getBoundingClientRect();
                    const isMobile = window.innerWidth < 640;
                    const pad = isMobile ? 20 : 24;
                    const size = isMobile ? 40 : 48;
                    return {
                        x: sRect.left - cRect.left + pad + size / 2,
                        y: sRect.top - cRect.top + pad + size / 2,
                        scale: 1,
                    };
                }
                return null;
            };

            // Mise à jour cinétique
            if (!isDraggingRef.current) {
                const flight = flightStateRef.current;
                const isReturning = flight && flight.phase === "retour";
                const isHoldingOrAller = selectedCompetenceId && !isReturning;

                if (hoveredIndexRef.current !== null) {
                    velXRef.current = 0;
                    velYRef.current = 0;
                } else if (isHoldingOrAller) {
                    // Décélération douce et maintien à l'arrêt pendant que la fiche est ouverte
                    velXRef.current *= 0.88;
                    velYRef.current *= 0.88;
                    if (Math.abs(velXRef.current) < 0.0001) velXRef.current = 0;
                    if (Math.abs(velYRef.current) < 0.0001) velYRef.current = 0;
                } else {
                    // Mode normal OU PENDANT LE RETOUR :
                    // Le globe reprend progressivement et naturellement sa rotation sur Y !
                    rotationXRef.current += velXRef.current;
                    rotationYRef.current += velYRef.current;

                    // Friction sur X (retour vers 0)
                    velXRef.current *= 0.94;

                    // Restauration progressive de la vitesse d'auto-rotation naturelle sur Y
                    velYRef.current = velYRef.current * 0.94 + 0.0028 * 0.06;
                }
            }

            // Limitation de l'inclinaison verticale pour une manipulation confortable
            rotationXRef.current = Math.max(-1.1, Math.min(1.1, rotationXRef.current));

            const cosX = Math.cos(rotationXRef.current);
            const sinX = Math.sin(rotationXRef.current);
            const cosY = Math.cos(rotationYRef.current);
            const sinY = Math.sin(rotationYRef.current);

            const pts = pointsRef.current;
            const deps = departuresRef.current;
            const logoRayon = width < 500 ? 20 : 24;

            const containerRect = container.getBoundingClientRect();
            const containerLeft = containerRect.left;
            const containerTop = containerRect.top;
            const vpH = window.innerHeight;
            const vpW = window.innerWidth;

            // Amortissement fluide (lerp) du suivi magnétique de la souris
            const lerpFollow = 0.082;
            mouseFollowRef.current.x +=
                (targetMouseFollowRef.current.x - mouseFollowRef.current.x) * lerpFollow;
            mouseFollowRef.current.y +=
                (targetMouseFollowRef.current.y - mouseFollowRef.current.y) * lerpFollow;

            for (let i = 0; i < pts.length; i++) {
                const el = itemRefs.current[i];
                if (!el) continue;

                const p = pts[i];

                // A. Rotation autour de l'axe X (tangage direct)
                const y1 = p.y * cosX + p.z * sinX;
                const z1 = -p.y * sinX + p.z * cosX;
                const x1 = p.x;

                // B. Rotation autour de l'axe Y (lacet direct)
                const x2 = x1 * cosY + z1 * sinY;
                const z2 = -x1 * sinY + z1 * cosY;
                const y2 = y1;

                // C. Coordonnées mondiales avec rayon
                const X = x2 * R;
                const Y = y2 * R;
                const Z = z2 * R;

                // D. Projection perspective
                const distanceCam = focalLength - Z;
                const scale = distanceCam > 1 ? focalLength / distanceCam : 1;

                const screenX = cx + X * scale;
                const screenY = cy + Y * scale;

                // E. Facteur de profondeur Z : [0, 1] où 1 = au premier plan
                const depthNorm = (z2 + 1) / 2;

                const finalScale = scale * (0.82 + 0.38 * depthNorm);
                const opacity = Math.max(0.20, Math.min(1, 0.22 + 0.78 * Math.pow(depthNorm, 1.4)));
                const pointerEvents = z2 > -0.2 ? "auto" : "none";

                const flight = flightStateRef.current;
                const isFlyingOrSelected =
                    (selectedCompetenceId === competencesHarmonisees[i]?.id) ||
                    (flight && flight.competenceId === competencesHarmonisees[i]?.id);

                if (isFlyingOrSelected && flight) {
                    const elapsed = performance.now() - flight.startTime;
                    const rawT = Math.max(0, Math.min(1, elapsed / flight.duration));
                    const easedT = easeAlpine(rawT);

                    let flightProg = 0;
                    if (flight.phase === "aller") {
                        flightProg = flight.startProg + (1 - flight.startProg) * easedT;
                        flight.currentProg = flightProg;
                        if (rawT >= 1) {
                            flightProg = 1;
                            flight.currentProg = 1;
                        }
                    } else if (flight.phase === "retour") {
                        flightProg = flight.startProg * (1 - easedT);
                        flight.currentProg = flightProg;
                        if (rawT >= 1) {
                            flightProg = 0;
                            flightStateRef.current = null;
                        }
                    }

                    const targetPos = getTargetPosInGlobe();
                    if (targetPos) {
                        lastTargetPosRef.current = targetPos;
                    }
                    const fichePos = targetPos || lastTargetPosRef.current || { x: -380, y: cy, scale: 1 };

                    // Interpolation en temps réel vers le point 3D sur la sphère qui tourne
                    const curX = screenX * (1 - flightProg) + fichePos.x * flightProg;
                    const curY = screenY * (1 - flightProg) + fichePos.y * flightProg;
                    const curScale = finalScale * (1 - flightProg) + fichePos.scale * flightProg;
                    const curOpacity = opacity * (1 - flightProg) + 1 * flightProg;

                    // Occlusion 3D : à l'approche de la surface (flightProg < 0.35),
                    // le zIndex rejoint la profondeur 3D réelle depthNorm * 100
                    const zFactor = Math.max(0, Math.min(1, flightProg / 0.35));
                    const curZIndex = Math.round((Math.round(depthNorm * 100)) * (1 - zFactor) + 1500 * zFactor);

                    el.style.transform = `translate3d(${curX - logoRayon}px, ${curY - logoRayon}px, 0) scale(${curScale})`;
                    el.style.opacity = `${curOpacity}`;
                    el.style.zIndex = `${curZIndex}`;
                    el.style.pointerEvents = flightProg > 0.8 ? "none" : pointerEvents;
                    continue;
                }

                const isItemHovered = hoveredIndexRef.current === i;
                const zIndex = isItemHovered ? 1000 : Math.round(depthNorm * 100);
                const effectiveOpacity = isItemHovered ? 1 : opacity;

                if (isItemHovered) {
                    hoveredCenterRef.current = { x: screenX, y: screenY };
                }

                const followX = isItemHovered ? mouseFollowRef.current.x : 0;
                const followY = isItemHovered ? mouseFollowRef.current.y : 0;
                const drawX = screenX + followX;
                const drawY = screenY + followY;

                // Ancrage dynamique au millimètre du bloc d'information sur le bord gauche visuel de l'icône survolée
                if (isItemHovered && tooltipRef.current) {
                    const totalScale = finalScale * 1.45;
                    const iconHalfWidth = logoRayon * totalScale;
                    const targetLeft = drawX - iconHalfWidth - 18;
                    const targetTop = drawY;
                    tooltipRef.current.style.left = `${targetLeft}px`;
                    tooltipRef.current.style.top = `${targetTop}px`;
                }

                const estAgent = competencesHarmonisees[i]?.categorie === "agentique";

                if (estAgent) {
                    const estIntegre = integreesRef.current.has(competencesHarmonisees[i].id);

                    if (!estIntegre) {
                        el.style.opacity = "0";
                        el.style.pointerEvents = "none";
                        el.style.transform = `translate3d(${drawX - logoRayon}px, ${drawY - logoRayon}px, 0) scale(0.1)`;
                    } else {
                        el.style.transform = `translate3d(${drawX - logoRayon}px, ${drawY - logoRayon}px, 0) scale(${finalScale})`;
                        el.style.zIndex = `${zIndex}`;
                        el.style.opacity = `${effectiveOpacity}`;
                        el.style.pointerEvents = pointerEvents;
                    }
                } else {
                    // Compétences non-agentiques : formation cinétique du globe au scroll depuis le bas et les côtés
                    if (formationProg >= 0.98) {
                        el.style.transform = `translate3d(${drawX - logoRayon}px, ${drawY - logoRayon}px, 0) scale(${finalScale})`;
                        el.style.zIndex = `${zIndex}`;
                        el.style.opacity = `${effectiveOpacity}`;
                        el.style.pointerEvents = pointerEvents;
                    } else {
                        const dep = deps[i];
                        if (!dep) {
                            el.style.transform = `translate3d(${drawX - logoRayon}px, ${drawY - logoRayon}px, 0) scale(${finalScale})`;
                            el.style.zIndex = `${zIndex}`;
                            el.style.opacity = `${opacity}`;
                            el.style.pointerEvents = pointerEvents;
                        } else {
                            const uRaw = Math.max(0, Math.min(1, (formationProg - dep.startProg) / dep.travelDuration));
                            if (uRaw <= 0) {
                                el.style.opacity = "0";
                                el.style.pointerEvents = "none";
                                el.style.transform = "translate3d(-999px, -999px, 0)";
                            } else {
                                const u = 1 - Math.pow(1 - uRaw, 3);

                                let startLocalX = cx;
                                let startLocalY = cy + height;

                                if (dep.sector === "bas") {
                                    const vpX = (dep.offsetXRatio - 0.5) * vpW * 1.1 + vpW / 2;
                                    const vpY = vpH + 140 + dep.offsetYRatio * 180;
                                    startLocalX = vpX - containerLeft;
                                    startLocalY = vpY - containerTop;
                                } else if (dep.sector === "gauche") {
                                    const vpX = -120 - dep.offsetXRatio * 80;
                                    const vpY = vpH * 0.45 + dep.offsetYRatio * (vpH * 0.55);
                                    startLocalX = vpX - containerLeft;
                                    startLocalY = vpY - containerTop;
                                } else {
                                    const vpX = vpW + 120 + dep.offsetXRatio * 80;
                                    const vpY = vpH * 0.45 + dep.offsetYRatio * (vpH * 0.55);
                                    startLocalX = vpX - containerLeft;
                                    startLocalY = vpY - containerTop;
                                }

                                const ctrlX = (startLocalX + drawX) / 2 + dep.curveOffset;
                                const ctrlY = Math.min(startLocalY, drawY) + (dep.sector === "bas" ? -60 : 40);

                                const oneMinusU = 1 - u;
                                const curX = oneMinusU * oneMinusU * startLocalX + 2 * oneMinusU * u * ctrlX + u * u * drawX;
                                const curY = oneMinusU * oneMinusU * startLocalY + 2 * oneMinusU * u * ctrlY + u * u * drawY;

                                const curScale = (0.28 + 0.72 * u) * finalScale;
                                const curOpacity = Math.min(1, Math.max(0, uRaw * 1.8)) * opacity;
                                const curZIndex = u > 0.88 ? zIndex : Math.round(u * 50);

                                el.style.transform = `translate3d(${curX - logoRayon}px, ${curY - logoRayon}px, 0) scale(${curScale})`;
                                el.style.zIndex = `${curZIndex}`;
                                el.style.opacity = `${curOpacity}`;
                                el.style.pointerEvents = u > 0.9 && z2 > -0.2 ? "auto" : "none";
                            }
                        }
                    }
                }
            }

            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);

        return () => {
            running = false;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [competencesHarmonisees, scrollProgress, selectedCompetenceId]);

    // 3. Gestionnaires d'interaction Grab & Drag (sens vertical naturel non inversé)
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (selectedCompetenceId) return;
        isDraggingRef.current = true;
        setIsGrabbing(true);
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
        pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
        velXRef.current = 0;
        velYRef.current = 0;

        if (hoveredIndexRef.current !== null) {
            hoveredIndexRef.current = null;
            setHoveredIndex(null);
            setHoveredPos(null);
            targetMouseFollowRef.current = { x: 0, y: 0 };
            mouseFollowRef.current = { x: 0, y: 0 };
        }

        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDraggingRef.current) {
            const totalDist = Math.hypot(
                e.clientX - pointerDownPosRef.current.x,
                e.clientY - pointerDownPosRef.current.y
            );

            if (totalDist > 4) {
                if (hoveredIndexRef.current !== null) {
                    hoveredIndexRef.current = null;
                    setHoveredIndex(null);
                    setHoveredPos(null);
                    targetMouseFollowRef.current = { x: 0, y: 0 };
                    mouseFollowRef.current = { x: 0, y: 0 };
                }
            }

            const dx = e.clientX - lastPointerPosRef.current.x;
            const dy = e.clientY - lastPointerPosRef.current.y;

            const sensitivity = 0.0055;
            rotationYRef.current += dx * sensitivity;
            // Déplacement vertical corrigé : glisser vers le haut fait tourner vers le haut
            rotationXRef.current += dy * sensitivity;

            velYRef.current = dx * sensitivity * 0.8;
            velXRef.current = dy * sensitivity * 0.8;

            lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
            return;
        }

        // Effet de suivi dynamique amorti de la souris au survol
        if (hoveredIndexRef.current !== null && hoveredCenterRef.current && containerRef.current) {
            const cRect = containerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - cRect.left;
            const mouseY = e.clientY - cRect.top;
            const dx = mouseX - hoveredCenterRef.current.x;
            const dy = mouseY - hoveredCenterRef.current.y;
            const maxOffset = 16;
            targetMouseFollowRef.current = {
                x: Math.max(-maxOffset, Math.min(maxOffset, dx * 0.42)),
                y: Math.max(-maxOffset, Math.min(maxOffset, dy * 0.42)),
            };
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        isDraggingRef.current = false;
        setIsGrabbing(false);
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    };

    const handleLogoClick = (competence: Competence, e: React.MouseEvent) => {
        e.stopPropagation();

        const dist = Math.hypot(
            lastPointerPosRef.current.x - pointerDownPosRef.current.x,
            lastPointerPosRef.current.y - pointerDownPosRef.current.y
        );

        if (dist < 6) {
            hoveredIndexRef.current = null;
            setHoveredIndex(null);
            setHoveredPos(null);
            targetMouseFollowRef.current = { x: 0, y: 0 };
            mouseFollowRef.current = { x: 0, y: 0 };

            onCompetenceClick?.(competence);
        }
    };

    return (
        <div
            id="competences-globe-3d"
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={() => {
                hoveredIndexRef.current = null;
                setHoveredIndex(null);
                setHoveredPos(null);
                targetMouseFollowRef.current = { x: 0, y: 0 };
            }}
            className={`relative w-full aspect-square max-w-[480px] sm:max-w-[540px] select-none touch-none overflow-visible flex items-center justify-center ${
                selectedCompetenceId ? "cursor-default" : isGrabbing ? "cursor-grabbing" : "cursor-grab"
            }`}
        >
            {/* Icônes pures de chaque compétence en agencement 3D avec micro-interactions Framer Motion */}
            {competencesHarmonisees.map((c, index) => {
                const isHovered = hoveredIndex === index;
                const hasAnyHover = hoveredIndex !== null;
                const isSelected = selectedCompetenceId === c.id;

                return (
                    <div
                        key={c.id}
                        id={`globe-competence-${c.id}`}
                        ref={(el) => {
                            itemRefs.current[index] = el;
                        }}
                        onClick={(e) => handleLogoClick(c, e)}
                        onPointerEnter={(e) => {
                            if (selectedCompetenceId || flightStateRef.current) return;
                            if (e.pointerType === "mouse" || !isDraggingRef.current) {
                                const itemEl = itemRefs.current[index];
                                if (itemEl && containerRef.current) {
                                    const cRect = containerRef.current.getBoundingClientRect();
                                    const iRect = itemEl.getBoundingClientRect();
                                    const centerX = iRect.left - cRect.left + iRect.width / 2;
                                    const centerY = iRect.top - cRect.top + iRect.height / 2;
                                    hoveredCenterRef.current = { x: centerX, y: centerY };
                                    targetMouseFollowRef.current = { x: 0, y: 0 };
                                    mouseFollowRef.current = { x: 0, y: 0 };
                                    const expandedHalfWidth = (iRect.width / 2) * 1.45;
                                    setHoveredPos({
                                        x: centerX - expandedHalfWidth - 18,
                                        y: centerY,
                                    });
                                }
                                hoveredIndexRef.current = index;
                                setHoveredIndex(index);
                            }
                        }}
                        onPointerMove={(e) => {
                            if (hoveredIndexRef.current === index && hoveredCenterRef.current && containerRef.current) {
                                const cRect = containerRef.current.getBoundingClientRect();
                                const mouseX = e.clientX - cRect.left;
                                const mouseY = e.clientY - cRect.top;
                                const dx = mouseX - hoveredCenterRef.current.x;
                                const dy = mouseY - hoveredCenterRef.current.y;
                                const maxOffset = 16;
                                targetMouseFollowRef.current = {
                                    x: Math.max(-maxOffset, Math.min(maxOffset, dx * 0.42)),
                                    y: Math.max(-maxOffset, Math.min(maxOffset, dy * 0.42)),
                                };
                            }
                        }}
                        onPointerLeave={() => {
                            if (hoveredIndexRef.current === index) {
                                hoveredIndexRef.current = null;
                                setHoveredIndex(null);
                                setHoveredPos(null);
                                targetMouseFollowRef.current = { x: 0, y: 0 };
                            }
                        }}
                        className="absolute top-0 left-0 w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] flex items-center justify-center select-none will-change-transform bg-transparent p-0 border-0 outline-none cursor-pointer shadow-none"
                        style={{
                            transform: "translate3d(0, 0, 0)",
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: isSelected ? 1 : isHovered ? 1.45 : hasAnyHover ? 0.78 : 1,
                                opacity: isSelected ? 1 : isHovered ? 1 : hasAnyHover ? 0.35 : 1,
                            }}
                            whileTap={{ scale: 0.92 }}
                            transition={{
                                duration: 0.28,
                                ease: EASING_ALPINE,
                            }}
                            className="relative w-full h-full flex items-center justify-center select-none pointer-events-none will-change-transform"
                        >
                            {c.logoUrl ? (
                                <div className="relative w-full h-full select-none pointer-events-none flex items-center justify-center">
                                    <Image
                                        src={c.logoUrl}
                                        alt={c.nom}
                                        fill
                                        sizes="128px"
                                        quality={90}
                                        className="object-contain select-none pointer-events-none"
                                    />
                                </div>
                            ) : (
                                <span className="font-mono text-sm font-bold text-white select-none pointer-events-none">
                                    {c.nom.slice(0, 2).toUpperCase()}
                                </span>
                            )}
                        </motion.div>
                    </div>
                );
            })}

            {/* Étiquette d'information cinétique en haute définition, découplée du conteneur 3D pour garantir un rendu vectoriel 1:1 net */}
            <AnimatePresence>
                {hoveredIndex !== null && hoveredPos && competencesHarmonisees[hoveredIndex] && (
                    <motion.div
                        ref={tooltipRef}
                        key={competencesHarmonisees[hoveredIndex].id}
                        initial={{
                            opacity: 0,
                            x: 20,
                            scaleX: 0.35,
                            scaleY: 0.65,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scaleX: 1,
                            scaleY: 1,
                        }}
                        exit={{
                            opacity: 0,
                            x: 16,
                            scaleX: 0.45,
                            scaleY: 0.7,
                            transition: {
                                duration: 0.18,
                                ease: EASING_ALPINE,
                            },
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 280,
                            damping: 20,
                            mass: 0.7,
                        }}
                        style={{
                            left: hoveredPos.x,
                            top: hoveredPos.y,
                            originX: 1,
                            originY: 0.5,
                        }}
                        className="absolute -translate-x-full -translate-y-1/2 flex items-center justify-end pointer-events-none z-50 select-none whitespace-nowrap will-change-transform pr-4 pl-6 py-2.5"
                    >
                        {/* Arrière-plan de flou progressif pur : démarre strictement à right-0 sans aucun débordement sur l'icône */}
                        <div
                            className="absolute inset-y-[-14px] right-0 -left-10 pointer-events-none overflow-hidden select-none"
                            style={{
                                maskImage:
                                    "radial-gradient(ellipse 65% 58% at 68% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 24%, rgba(0,0,0,0.24) 50%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0) 100%)",
                                WebkitMaskImage:
                                    "radial-gradient(ellipse 65% 58% at 68% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 24%, rgba(0,0,0,0.24) 50%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0) 100%)",
                            }}
                        >
                            {/* Couche optique de flou progressif */}
                            <div className="absolute inset-0 backdrop-blur-xl" />
                            {/* Voile sombre diffus pour garantir le contraste sans aucune ligne de bordure */}
                            <div className="absolute inset-0 bg-black/60" />
                        </div>

                        {/* Typographie éditoriale alignée vers l'icône, agrandie et en haute définition native */}
                        <motion.div
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.22, ease: EASING_ALPINE }}
                            className="relative z-10 flex flex-col items-end text-right antialiased"
                        >
                            <span className="font-body font-bold text-xl sm:text-2xl text-white leading-tight tracking-tight">
                                {competencesHarmonisees[hoveredIndex].nom}
                            </span>
                            <span className="font-body italic text-[10px] sm:text-xs text-white/70 mt-1 leading-tight tracking-normal">
                                {enSavoirPlusLabel || "Cliquer pour en savoir plus"}
                            </span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
