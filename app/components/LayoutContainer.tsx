"use client"

import { motion } from "framer-motion";
import {ReactNode} from "react";

export default function LayoutContainer({children}:{children: ReactNode}) {
    return <motion.div layout>
        {children}
    </motion.div>
}