"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface StatItem {
    titre: string;
    valeur: number;
    href: string;
}

function TuileItem({ s }: { s: StatItem }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Amorti physique haute fidélité : soyeux, précis et sans secousses
    const springConfig = { stiffness: 220, damping: 20, mass: 0.6 };

    // Inclinaison subtile (6° max) pour un effet de matière réaliste et stable
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

    function handlePointerMove(e: React.PointerEvent<HTMLAnchorElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const xPct = (e.clientX - rect.left) / rect.width - 0.5;
        const yPct = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(xPct);
        mouseY.set(yPct);
    }

    function handlePointerLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <div style={{ perspective: 1000 }} className="w-full">
            <Link
                href={s.href}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="block w-full focus:outline-none select-none rounded-[32px]"
            >
                <motion.div
                    initial={{
                        backgroundColor: "#2b455b",
                        borderColor: "rgba(63, 118, 148, 0.45)",
                    }}
                    whileHover={{
                        scale: 1.02,
                        backgroundColor: "#385c7a",
                        borderColor: "#508dae",
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 24,
                    }}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    className="flex items-center justify-between gap-4 p-8 rounded-[32px] border text-white shadow-none cursor-pointer"
                >
                    <span
                        style={{ transform: "translateZ(18px)" }}
                        className="text-2xl font-bold text-white tracking-tight"
                    >
                        {s.titre}
                    </span>
                    <span
                        style={{ transform: "translateZ(24px)" }}
                        className="text-4xl sm:text-5xl font-bold text-white tracking-tight"
                    >
                        {String(s.valeur).padStart(2, "0")}
                    </span>
                </motion.div>
            </Link>
        </div>
    );
}

export default function TuilesStatsAdmin({ stats }: { stats: StatItem[] }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
                <TuileItem key={s.titre} s={s} />
            ))}
        </div>
    );
}
