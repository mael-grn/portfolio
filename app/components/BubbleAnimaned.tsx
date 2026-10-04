"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";

// --- TYPES & CONTEXTE ---

interface BubbleData {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    phase: number;
    frequency: number;
    node: HTMLDivElement;
}

interface BubbleContextType {
    registerBubble: (id: string, radius: number, node: HTMLDivElement) => void;
    unregisterBubble: (id: string) => void;
}

const BubbleContext = createContext<BubbleContextType | null>(null);

// --- COMPOSANT PARENT ---

export function BubbleContainer({
                                    children,
                                    className = "",
                                }: {
    children: ReactNode;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bubblesRef = useRef<Map<string, BubbleData>>(new Map());
    const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
        x: 0,
        y: 0,
        active: false,
    });
    const lastScrollY = useRef(0);

    const registerBubble = (id: string, radius: number, node: HTMLDivElement) => {
        const rect = containerRef.current?.getBoundingClientRect();
        const width = rect?.width || 400;
        const height = rect?.height || 400;

        // Déphasage unique pour éviter que les bulles oscillent en synchronie
        const phase = Math.random() * Math.PI * 2;
        const frequency = 0.0018 + Math.random() * 0.0008;

        bubblesRef.current.set(id, {
            id,
            x: width / 2,
            y: height / 2,
            vx: 0,
            vy: 0,
            radius,
            phase,
            frequency,
            node,
        });
    };

    const unregisterBubble = (id: string) => {
        bubblesRef.current.delete(id);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        lastScrollY.current = window.scrollY;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                active: true,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        // Réaction au scroll amortie (impulsion liquide)
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const deltaY = currentScrollY - lastScrollY.current;
            lastScrollY.current = currentScrollY;

            bubblesRef.current.forEach((b) => {
                b.vy -= deltaY * 0.008;
                b.vx += (Math.cos(b.phase) * deltaY) * 0.003;
            });
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("scroll", handleScroll, { passive: true });

        let animationFrameId: number;

        const tick = (time: number) => {
            const bounds = container.getBoundingClientRect();
            const bubbles = Array.from(bubblesRef.current.values());

            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;

            // Cibles du triangle équilatéral centré
            const triangleRadius = 78;
            const triangleTargets = [
                { x: centerX, y: centerY - triangleRadius * 0.95 },
                {
                    x: centerX - triangleRadius * Math.cos(Math.PI / 6),
                    y: centerY + triangleRadius * 0.55,
                },
                {
                    x: centerX + triangleRadius * Math.cos(Math.PI / 6),
                    y: centerY + triangleRadius * 0.55,
                },
            ];

            for (let i = 0; i < bubbles.length; i++) {
                const b1 = bubbles[i];

                // 1. Dérive sinusoïdale fluide (flottaison organique sans tremblement)
                const floatOffsetX = Math.cos(time * b1.frequency + b1.phase) * 14;
                const floatOffsetY = Math.sin(time * b1.frequency * 1.3 + b1.phase) * 14;

                // 2. Rappel doux vers la position d'ancrage avec décalage de flottement
                if (i < triangleTargets.length) {
                    const target = triangleTargets[i];
                    const targetX = target.x + floatOffsetX;
                    const targetY = target.y + floatOffsetY;

                    // Ressort sur-amorti (aucun rebond sec)
                    b1.vx += (targetX - b1.x) * 0.004;
                    b1.vy += (targetY - b1.y) * 0.004;
                }

                // 3. Frottement visqueux élevé pour adoucir toute perturbation
                b1.vx *= 0.90;
                b1.vy *= 0.90;

                // 4. Répulsion du curseur (courbe douce et progressive)
                if (mouseRef.current.active) {
                    const dx = b1.x - mouseRef.current.x;
                    const dy = b1.y - mouseRef.current.y;
                    const dist = Math.hypot(dx, dy);
                    const pushRadius = 120;

                    if (dist < pushRadius && dist > 0) {
                        // Courbe quadratique inversée pour éviter le choc franc
                        const normDist = dist / pushRadius;
                        const force = Math.pow(1 - normDist, 2) * 0.7;
                        b1.vx += (dx / dist) * force;
                        b1.vy += (dy / dist) * force;
                    }
                }

                // 5. Répulsion douce entre bulles (résolution élastique amortie)
                for (let j = i + 1; j < bubbles.length; j++) {
                    const b2 = bubbles[j];
                    const dx = b2.x - b1.x;
                    const dy = b2.y - b1.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = b1.radius + b2.radius + 10; // Marge de respiration

                    if (dist < minDist && dist > 0) {
                        const overlap = (minDist - dist) * 0.03;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        b1.vx -= nx * overlap;
                        b1.vy -= ny * overlap;
                        b2.vx += nx * overlap;
                        b2.vy += ny * overlap;
                    }
                }

                // 6. Intégration
                b1.x += b1.vx;
                b1.y += b1.vy;

                // Confinement doux aux parois
                const pad = b1.radius;
                if (b1.x - pad < 0) {
                    b1.x = pad;
                    b1.vx = 0;
                } else if (b1.x + pad > bounds.width) {
                    b1.x = bounds.width - pad;
                    b1.vx = 0;
                }

                if (b1.y - pad < 0) {
                    b1.y = pad;
                    b1.vy = 0;
                } else if (b1.y + pad > bounds.height) {
                    b1.y = bounds.height - pad;
                    b1.vy = 0;
                }

                // 7. Rendu direct transform
                if (b1.node) {
                    b1.node.style.transform = `translate3d(${b1.x - b1.radius}px, ${
                        b1.y - b1.radius
                    }px, 0)`;
                }
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <BubbleContext.Provider value={{ registerBubble, unregisterBubble }}>
            <div
                ref={containerRef}
                className={`relative overflow-hidden ${className}`}
            >
                {children}
            </div>
        </BubbleContext.Provider>
    );
}

// --- COMPOSANT ENFANT (BUBBLE) ---

interface BubbleProps {
    children?: ReactNode;
    size?: number;
    className?: string;
}

export function Bubble({ children, size = 80, className = "" }: BubbleProps) {
    const context = useContext(BubbleContext);
    const nodeRef = useRef<HTMLDivElement>(null);
    const [id] = useState(() => Math.random().toString(36).slice(2, 9));

    useEffect(() => {
        if (!context || !nodeRef.current) return;
        context.registerBubble(id, size / 2, nodeRef.current);
        return () => context.unregisterBubble(id);
    }, [context, id, size]);

    return (
        <div
            ref={nodeRef}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                willChange: "transform",
            }}
            className={`absolute top-0 left-0 flex items-center justify-center rounded-full select-none ${className}`}
        >
            {children}
        </div>
    );
}