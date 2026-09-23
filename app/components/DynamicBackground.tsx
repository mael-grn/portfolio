"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Anm from "@/app/components/Animator3000";

function BackgroundScrubber() {
    const contentOpacity = useMotionValue(0);
    const codeOpacity = useMotionValue(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const contentEl = document.getElementById("content");
            const codeEl = document.getElementById("code");
            const windowHeight = window.innerHeight;
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            const startFactor = mobile ? 0.95 : 0.9;
            const endFactor = mobile ? 0.45 : 0.3;

            const calcProgress = (el: HTMLElement | null) => {
                if (!el) return 0;
                const top = el.getBoundingClientRect().top;
                const start = windowHeight * startFactor;
                const end = windowHeight * endFactor;

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

    const maxBlur = isMobile ? "blur(16px)" : "blur(30px)";
    const blurValue = useTransform(contentOpacity, [0, 1], ["blur(0px)", maxBlur]);

    return (
        <>
            {/* Utilisation de fixed inset-0 pour garantir la couverture plein écran quel que soit le parent */}
            <motion.div
                className="fixed inset-0 w-screen h-[100dvh] md:h-screen pointer-events-none"
                style={{
                    backdropFilter: blurValue,
                    WebkitBackdropFilter: blurValue,
                }}
            />

            <motion.div
                className="fixed inset-0 w-screen h-[100dvh] md:h-screen pointer-events-none"
                style={{
                    backgroundColor: "var(--background)",
                    opacity: contentOpacity,
                }}
            />

            <motion.div
                className="fixed inset-0 w-screen h-[100dvh] md:h-screen pointer-events-none"
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
        <div className="fixed inset-0 w-full h-[100dvh] md:h-screen -z-1 pointer-events-none overflow-hidden">
            {/* L'image subit le scale de Anm */}
            <Anm className="w-full h-full min-h-[100dvh] md:min-h-screen" y={0} scale={1.5}>
                <img
                    className="w-full h-full min-h-[100dvh] md:min-h-screen object-cover"
                    src="/hero.jpeg"
                    alt="hero"
                />
            </Anm>

            {/* Le scrubber est sorti du conteneur transformé pour ne pas être bridé par Anm */}
            {isMounted && <BackgroundScrubber />}
        </div>
    );
}