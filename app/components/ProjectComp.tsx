"use client"


import {Projet} from "@/app/modeles/Projet";
import {formaterDate} from "@/app/lib/dates";
import {Locale} from "@/app/lib/langues";
import Image from "next/image";
import { motion } from "framer-motion";

export interface LibellesProjet {
    details: string;
    present: string;
}

interface TailleProps {
    p: Projet;
    color: string;
    delay: number;
    lang: Locale;
    labels: LibellesProjet;
}

/*
Sizes:
1: petit carré
2: moyen rectangle vertical
3: grand rectangle horizontal
4: grand rectangle avec toutes les images
 */
export default function ProjectComp({p, lang, labels, delay=0}: {p:Projet, lang:Locale, labels:LibellesProjet, delay?:number}) {
    const props = {p, color: p.couleur, delay, lang, labels};
    return <>
    {
        p.taille === 1 ? <Size1 {...props}/> :
            p.taille === 2 ? <Size2 {...props}/> :
                p.taille === 3 ? <Size3 {...props}/> :
                    <Size4 {...props}/>
    }
    </>
}

function Size1({p, color, delay, lang, labels}: TailleProps) {
    return <motion.div
        transition={{
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            delay: delay
        }}
        initial={{opacity:0}}
        whileInView={{opacity:1}}
        style={{background: color}}
        className={`flex gap-4 flex-col text-background rounded-2xl p-6`}>
        <p className={"text-4xl"}>{p.nom}</p>
        <div className={"w-full gap-2 flex items-center"}>
            <div className={"flex items-center bg-foreground gap-2 text-sm py-1 px-2 justify-center w-full rounded-full"}>
                {formaterDate(p.dateDebut, lang)}
            </div>
            <Image src={"/real-arrow.svg"} alt={"arrow"} width={20} height={20} className={"invert"}/>

            <div className={"flex items-center bg-foreground text-sm gap-2 py-1 px-2 justify-center w-full rounded-full"}>
                {p.dateFin ? formaterDate(p.dateFin, lang) : labels.present}
            </div>
        </div>

        <div className={"flex gap-2 items-center flex-wrap"}>
            {
                p.competences.map((c)=><p className={"px-3 py-1 rounded-full bg-linear-to-b from-foreground/30 to-foreground/70"} key={c}>{c}</p>)
            }
        </div>
        <button className={"flex cursor-pointer items-center justify-center gap-3 py-2 px-4 w-full bg-background text-foreground rounded-full"}>
            <Image src={"/out.svg"} alt={"out"} width={13} height={13} className={""}/>
            <p>{labels.details}</p>
        </button>
    </motion.div>
}

function Size2({p, color, delay, lang, labels}: TailleProps) {
    return <motion.div
        transition={{
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            delay: delay
        }}
        initial={{opacity:0}}
        whileInView={{opacity:1}}
        style={{background: color}}
        className={`flex flex-1 gap-4 flex-col text-background rounded-2xl p-6`}>
        <p className={"text-4xl"}>{p.nom}</p>
        <div className={"w-full flex flex-col gap-2 items-center"}>
            <div className={"flex items-center bg-foreground gap-2 p-2 justify-center w-full rounded-full"}>
                <Image src={"/calendar.svg"} alt={"calendar"} width={13} height={13} className={"invert"}/>
                {formaterDate(p.dateDebut, lang)}
            </div>
            <Image src={"/real-arrow.svg"} alt={"arrow"} width={20} height={20} className={"invert rotate-90"}/>
            <div className={"flex items-center bg-foreground gap-2 p-2 justify-center w-full rounded-full"}>
                <Image src={"/calendar.svg"} alt={"calendar"} width={13} height={13} className={"invert"}/>
                {p.dateFin ? formaterDate(p.dateFin, lang) : labels.present}
            </div>
        </div>

        {
            p.images[0] && <Image src={p.images[0]} alt={p.nom} width={800} height={600} sizes={"(min-width: 1024px) 33vw, 100vw"} className={"w-full h-auto object-contain rounded-xl"}/>

        }

        <div className={"flex gap-2 items-center flex-wrap"}>
            {
                p.competences.map((c)=><p className={"px-3 py-1 rounded-full bg-linear-to-b from-foreground/30 to-foreground/70"} key={c}>{c}</p>)
            }
        </div>
        <button className={"flex cursor-pointer items-center justify-center gap-3 py-2 px-4 w-full bg-background text-foreground rounded-full"}>
            <Image src={"/out.svg"} alt={"out"} width={13} height={13} className={""}/>
            <p>{labels.details}</p>
        </button>
    </motion.div>
}

function Size3({p, color, delay, lang, labels}: TailleProps) {
    return <motion.div
        transition={{
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            delay: delay
        }}
        initial={{opacity:0}}
        whileInView={{opacity:1}}
        style={{background: color}}
        className={`flex gap-4 flex-1 flex-col text-background rounded-2xl p-6`}>
        <p className={"text-4xl"}>{p.nom}</p>
        <div className={"w-full flex gap-2 items-center flex-wrap"}>
            <div className={"flex items-center bg-foreground gap-2  py-1 px-3 justify-center w-fit rounded-full"}>
                {formaterDate(p.dateDebut, lang)}
            </div>
            <Image src={"/real-arrow.svg"} alt={"arrow"} width={20} height={20} className={"invert"}/>
            <div className={"flex items-center bg-foreground gap-2 py-1 px-3 justify-center w-fit rounded-full"}>
                {p.dateFin ? formaterDate(p.dateFin, lang) : labels.present}
            </div>

        </div>
        <div className={"w-full flex gap-2 items-center flex-wrap"}>
            {
                p.competences.map((c)=><p className={"px-3 py-1 rounded-full bg-linear-to-b from-foreground/30 to-foreground/70"} key={c}>{c}</p>)
            }
        </div>
        <button className={"flex cursor-pointer items-center justify-center gap-3 py-2 px-4 w-full bg-background text-foreground rounded-full"}>
            <Image src={"/out.svg"} alt={"out"} width={13} height={13} className={""}/>
            <p>{labels.details}</p>
        </button>
    </motion.div>
}

function Size4({p, color, delay, lang, labels}: TailleProps) {
    return <motion.div
        transition={{
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            delay: delay
        }}
        initial={{opacity:0}}
        whileInView={{opacity:1}}
        style={{background: color}}
        className={`flex gap-4 flex-col text-background rounded-2xl p-6`}>
        <p className={"text-5xl"}>{p.nom}</p>
        <div className={"w-full flex gap-2 items-center justify-center"}>
            <div className={"flex items-center bg-foreground gap-2 p-2 justify-center w-full rounded-full"}>
                <Image src={"/calendar.svg"} alt={"calendar"} width={13} height={13} className={"invert"}/>
                {formaterDate(p.dateDebut, lang)}
            </div>
            <Image src={"/real-arrow.svg"} alt={"arrow"} width={20} height={20} className={"invert"}/>
            <div className={"flex items-center bg-foreground gap-2 p-2 justify-center w-full rounded-full"}>
                <Image src={"/calendar.svg"} alt={"calendar"} width={13} height={13} className={"invert"}/>
                {p.dateFin ? formaterDate(p.dateFin, lang) : labels.present}
            </div>
        </div>

        <div className={"w-full flex flex-row gap-4 items-center justify-center"}>
            {p.images.map((i, index)=><div key={i} className={"flex-1"}><Image src={i} alt={`${p.nom} (${index + 1})`} width={800} height={600} sizes={"(min-width: 1024px) 33vw, 100vw"} className={"w-full h-auto object-contain rounded-3xl"}/></div>)}

        </div>

        <div className={"flex gap-2 items-center flex-wrap"}>
            {
                p.competences.map((c)=><p className={"px-3 py-1 rounded-full bg-linear-to-b from-foreground/30 to-foreground/70"} key={c}>{c}</p>)
            }
        </div>
        <button className={"flex cursor-pointer items-center justify-center gap-3 py-2 px-4 w-full bg-background text-foreground rounded-full"}>
            <Image src={"/out.svg"} alt={"out"} width={13} height={13} className={""}/>
            <p>{labels.details}</p>
        </button>
    </motion.div>
}