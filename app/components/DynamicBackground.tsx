"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Anm from "@/app/components/Animator3000";

function BackgroundScrubber() {
    const contentOpacity = useMotionValue(0);
    const codeOpacity = useMotionValue(0);

    useEffect(() => {
        const handleScroll = () => {
            const contentEl = document.getElementById("content");
            const codeEl = document.getElementById("code");
            const windowHeight = window.innerHeight;

            // Calcul progressif :
            // 0 quand le haut de la div est à 90% du bas de l'écran
            // 1 quand le haut de la div monte à 30% du haut de l'écran
            const calcProgress = (el: HTMLElement | null) => {
                if (!el) return 0;
                const top = el.getBoundingClientRect().top;
                const start = windowHeight * 0.9;
                const end = windowHeight * 0.3;

                if (top >= start) return 0;
                if (top <= end) return 1;
                return (start - top) / (start - end);
            };

            contentOpacity.set(calcProgress(contentEl));
            codeOpacity.set(calcProgress(codeEl));
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [contentOpacity, codeOpacity]);

    // Le flou progresse doucement de 0px à 30px dès qu'on commence à scroller sur content
    const blurValue = useTransform(contentOpacity, [0, 1], ["blur(0px)", "blur(30px)"]);

    return (
        <>
            {/* Calque de flou commun (évite de multiplier les filtres graphiques) */}
            <motion.div
                className="w-full h-screen absolute top-0 left-0"
                style={{
                    backdropFilter: blurValue,
                    WebkitBackdropFilter: blurValue,
                }}
            />

            {/* Calque 1 : opacité progressive vers var(--background) */}
            <motion.div
                className="w-full h-screen absolute top-0 left-0"
                style={{
                    backgroundColor: "var(--background)",
                    opacity: contentOpacity,
                }}
            />

            {/* Calque 2 : opacité progressive vers var(--foreground) par-dessus */}
            <motion.div
                className="w-full h-screen absolute top-0 left-0"
                style={{
                    backgroundColor: "var(--foreground)",
                    opacity: codeOpacity,
                }}
            />
        </>
    );
}

export default function DynBg() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-screen -z-1 pointer-events-none">
            <Anm className="w-full h-screen" y={0} scale={1.5}>
                <img
                    className="w-full h-screen object-cover"
                    src="/hero.jpeg"
                    alt="hero"
                />

                {isMounted && <BackgroundScrubber />}
            </Anm>
        </div>
    );
}