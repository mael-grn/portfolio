"use client";

import {motion} from "framer-motion";
import {ReactNode} from "react";

export default function Anm({delay = 0, x = 0, y = 60, scale = 1, children, className="", layoutId}: {
    layoutId?: string;
    delay?: number,
    x?: number;
    y?: number,
    scale?: number,
    children: ReactNode,
    className?: string
}) {
    return <motion.div
        transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
        }}
        layoutId={layoutId}
        layout={layoutId !== undefined}
        className={className}
    >
        <motion.div

            transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
                delay: delay
            }}
            initial={{opacity: 0, y: y, x: x, scale: scale}}
            whileInView={{
                opacity: 1, y: 0, x: 0, scale: 1
            }}
            exit={{scale: 0}}
        >
            {children}
        </motion.div>
    </motion.div>
}