"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MonogramLogo from "@/app/components/MonogramLogo";

interface FooterProps {
    role: string;
    githubLabel: string;
    linkedinLabel: string;
    contactLabel: string;
    adminLabel: string;
    signature: string;
}

/**
 * Footer sombre compact conforme à DESIGN.md :
 * Surface #20272e, typographie monospace 12px, 100% textes issus du dictionnaire.
 */
export default function FooterSection({
    role,
    githubLabel,
    linkedinLabel,
    contactLabel,
    adminLabel,
    signature,
}: FooterProps) {
    const annee = new Date().getFullYear();

    return (
        <footer
            data-theme="dark"
            className="w-full bg-foreground text-white py-12 px-6 sm:px-12 select-none border-t border-white/10"
        >
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-smoke">
                {/* Logo & Identité */}
                <div className="flex items-center gap-3 text-white">
                    <MonogramLogo taille={24} couleur="#ffffff" />
                    <span className="font-bold tracking-widest uppercase">
                        MAËL GARNIER
                    </span>
                    <span className="hidden sm:inline text-white/40">·</span>
                    <span className="hidden sm:inline text-white/70">
                        {role}
                    </span>
                </div>

                {/* Liens de contact & réseaux */}
                <div className="flex flex-wrap items-center gap-6">
                    <motion.a
                        href="https://github.com/mael-grn"
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -1 }}
                        className="text-white hover:text-primary transition-none"
                    >
                        {githubLabel}
                    </motion.a>

                    <motion.a
                        href="https://linkedin.com/in/mael-garnier"
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ y: -1 }}
                        className="text-white hover:text-primary transition-none"
                    >
                        {linkedinLabel}
                    </motion.a>

                    <motion.a
                        href="mailto:contact@maelg.fr"
                        whileHover={{ y: -1 }}
                        className="text-white hover:text-primary transition-none"
                    >
                        {contactLabel}
                    </motion.a>

                    <Link
                        href="/admin"
                        className="text-white/40 hover:text-white transition-none"
                    >
                        {adminLabel}
                    </Link>
                </div>

                {/* Copyright */}
                <div className="text-white/50 text-[11px]">
                    © {annee} {signature}
                </div>
            </div>
        </footer>
    );
}
