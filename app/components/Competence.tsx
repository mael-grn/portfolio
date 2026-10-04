"use client"

import {Competence} from "@/app/modeles";
import { motion } from "framer-motion";
import Image from "next/image";

export default function CompetenceComp({c} : {c: Competence}) {
    return (
        <motion.div layout className="flex gap-4 min-w-fit items-center">
            <Image
                src={`/illustrations/${c.chemin_logo}`}
                alt={c.nom}
                width={56}
                height={56}
                className="sm:w-10 sm:h-10 h-8 w-8 rounded-sm object-contain"
            />

            <div className="flex flex-col justify-center">
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
            </div>
        </motion.div>
    )
}