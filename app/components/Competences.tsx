"use client"

import {Competence} from "@/app/modeles";
import Anm from "@/app/components/Animator3000";
import {useState} from "react";
import { motion } from "framer-motion";

export default function Competences({titre, elements}: {titre: string, elements: Competence[]}) {
    const [deploye, setDeploye] = useState<boolean>(false);
    return <div className={"flex flex-col gap-3"}>
        <Anm>
            <h2 className={"text-background text-2xl sm:text-4xl"}>{titre}</h2>
        </Anm>
        <div className={`flex gap-10 ${deploye ? "flex-wrap" : "flex-row"} max-w-full overflow-y-hidden scrollbar-none overflow-x-auto`}>
            {
                elements.map((c, i)=>{
                    return <div key={i} className={"flex gap-4 min-w-fit"}>
                        <Anm scale={0} y={0}>
                            <img className={"sm:w-20 sm:min-w-20 w-12 min-w-12 rounded-xl"} src={"/illustrations/"+c.chemin_logo} alt={c.nom} />
                        </Anm>
                        <div className={"flex flex-col"}>
                            <Anm delay={0.1}>
                                <h3 className={"sm:text-xl text-sm mb-0 text-background"}>{c.nom}</h3>
                            </Anm>
                            <div className={"flex gap-1"}>
                                {Array.from({ length: c.maitrise }, (_, index) => (
                                    <Anm key={index} delay={0.2+index/10} y={20}>
                                        <img src={"/full-star.svg"} className={"invert sm:min-w-5 sm:min-h-5 sm:w-5 sm:h-5 min-w-3 min-h-3 w-3 h-3"}/>
                                    </Anm>
                                ))}
                            </div>
                            <Anm delay={0.2} className={" sm:mt-1"}>
                                <code className={"px-2 py-0 w-fit bg-background/10 sm:text-sm text-xs rounded-full"}>
                                    {c.nombre_projets} Projets
                                </code>
                            </Anm>
                        </div>
                    </div>
                })
            }
        </div>
        <Anm>
            <motion.button
                whileHover={{
                    scale: 1.1,
                    opacity: 0.8
                }}
                whileTap={{
                    scale: 0.9,
                }}
                className={"text-background bg-background/10 px-3 py-2 flex items-center justify-center gap-2 rounded-xl cursor-pointer"}
                onClick={() => setDeploye(!deploye)}>
                <motion.img animate={deploye ? {rotate: "180deg"} : {rotate: "0deg"}} src={"/arrow.svg"} alt={"arrow"} className={"w-5 invert"}/>
                Tout afficher
            </motion.button>
        </Anm>
    </div>
}