"use client";

import { Competence } from "@/app/modeles";
import Anm from "@/app/components/Animator3000";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Competences({
                                        titre,
                                        elements,
                                    }: {
    titre: string;
    elements: Competence[];
}) {
    const [deploye, setDeploye] = useState<boolean>(false);

    return (
        // 💡 Ici : motion.div avec la prop layout sur la racine
        <motion.div
            layout
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
        >
            <Anm>
                <h2 className="text-background text-2xl sm:text-4xl">{titre}</h2>
            </Anm>

            <motion.div
                layout
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`flex sm:gap-10 gap-6 ${
                    deploye ? "flex-wrap overflow-x-visible" : "flex-row overflow-x-auto scrollbar-none"
                } max-w-full overflow-y-hidden py-2`}
            >
                {elements.map((c, i) => (
                    <motion.div layout key={c.nom || i} className="flex gap-4 min-w-fit">
                        <Image
                            src={`/illustrations/${c.chemin_logo}`}
                            alt={c.nom}
                            width={56}
                            height={56}
                            className="sm:w-14 sm:h-14 h-8 w-8 rounded-sm sm:rounded-xl object-contain"
                        />

                        <div className="flex flex-col">
                            <h3 className="sm:text-lg text-sm mb-0 text-background">{c.nom}</h3>
                            <div className="flex gap-1">
                                {Array.from({ length: c.maitrise }, (_, index) => (
                                    <img
                                        key={index}
                                        src="/full-star.svg"
                                        alt="étoile"
                                        width={12}
                                        height={12}
                                        className="invert w-3 h-3"
                                    />
                                ))}
                            </div>
                            <code className="px-2 mt-2 py-0 w-fit bg-background/10 text-xs rounded-full">
                                {c.nombre_projets} Projets
                            </code>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <button
                type="button"
                className="text-background sm:mt-2 bg-background/10 active:scale-95 transition-transform sm:px-3 sm:py-2 px-2 py-1 sm:w-fit w-full flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                onClick={() => setDeploye((prev) => !prev)}
            >
                <motion.img
                    animate={{ rotate: deploye ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    src="/arrow.svg"
                    alt="arrow"
                    className="sm:w-5 w-4 invert"
                />
                {deploye ? "Réduire" : "Tout afficher"}
            </button>
        </motion.div>
    );
}