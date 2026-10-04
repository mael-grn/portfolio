"use client";

import { Competence } from "@/app/modeles";
import { motion } from "framer-motion";
import CompetenceComp from "@/app/components/Competence";
import { useEffect, useRef, useState } from "react";
import Anm from "@/app/components/Animator3000";

export default function Competences({titre, elements}: { titre: string; elements: Competence[]; }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPaused = useRef(false);

    const [iterations, setIterations] = useState(2);
    const isAdding = useRef(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        let animationFrameId: number;

        const autoScroll = () => {
            if (!isPaused.current && el) {
                el.scrollLeft += 1.5;

                const seuilFin = 300;
                if (
                    !isAdding.current &&
                    el.scrollLeft + el.clientWidth >= el.scrollWidth - seuilFin
                ) {
                    isAdding.current = true;
                    setIterations((prev) => prev + 1);
                }
            }

            animationFrameId = requestAnimationFrame(autoScroll);
        };

        animationFrameId = requestAnimationFrame(autoScroll);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    useEffect(() => {
        isAdding.current = false;
    }, [iterations]);

    return (
        <Anm y={0} x={200}>
            <motion.div
                ref={scrollRef}
                layout
                className="flex sm:gap-10 gap-6 flex-row overflow-x-auto scrollbar-none max-w-full overflow-y-hidden py-2"
            >
                <div className="sticky left-0 h-20 z-10 flex shrink-0 items-center">
                    <div className="flex h-full items-center bg-linear-to-l from-transparent to-foreground pl-4 pr-16 backdrop-blur [mask-image:linear-gradient(to_right,black_calc(100%-4rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-4rem),transparent)]">
                        <code className="text-background whitespace-nowrap text-xl sm:text-2xl">
                            {titre}
                        </code>
                    </div>
                </div>


                {Array.from({ length: iterations }).map((_, batchIndex) =>
                    elements.map((c, i) => (
                        <CompetenceComp
                            key={`batch-${batchIndex}-${c.nom || i}`}
                            c={c}
                        />
                    ))
                )}
                <div className="sticky right-0 z-10 h-full min-h-[60px] w-12 sm:w-20 shrink-0 pointer-events-none bg-gradient-to-r from-transparent to-foreground" />

            </motion.div>
        </Anm>
    );
}