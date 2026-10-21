"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PageNonAutorise() {
    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-foreground">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-foreground/15 bg-white/70 p-8 text-center backdrop-blur"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-700"
                    aria-hidden
                >
                    ✕
                </motion.div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black">Accès non autorisé</h1>
                    <p className="text-sm text-foreground/75 leading-relaxed">
                        Vous êtes bien authentifié via la plateforme de compte globale, mais votre identifiant ne dispose pas des droits d&apos;administration sur ce portfolio.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Link
                        href="/"
                        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
                    >
                        Retourner au portfolio
                    </Link>
                    <a
                        href="https://account.maelg.fr/login"
                        className="rounded-full bg-foreground/10 px-5 py-2.5 text-sm font-medium text-foreground"
                    >
                        Changer de compte
                    </a>
                </div>
            </motion.div>
        </main>
    );
}
