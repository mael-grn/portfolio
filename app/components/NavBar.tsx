"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavProps {
    apercuLabel?: string;
    aProposLabel?: string;
    competencesLabel?: string;
    projetsLabel?: string;
    parcoursLabel?: string;
    contactLabel?: string;
    basculerLangueLabel?: string;
}

/**
 * Barre de navigation conforme à DESIGN.md :
 * Hauteur généreuse, fond transparent canvas, nav-pill flottante blanche 48px radius centrée,
 * sélecteur de langue bilingue et bouton contact à droite.
 */
export default function NavBar({
    apercuLabel = "Aperçu",
    aProposLabel = "À propos",
    competencesLabel = "Compétences",
    projetsLabel = "Projets",
    parcoursLabel = "Parcours",
    contactLabel = "CONTACT",
    basculerLangueLabel = "Changer de langue",
}: NavProps) {
    const pathname = usePathname();
    const estAnglais = pathname?.startsWith("/en");
    const langueCible = estAnglais ? "fr" : "en";
    const nouveauChemin = pathname?.replace(/^\/(fr|en)/, `/${langueCible}`) || `/${langueCible}`;

    const liensNav = [
        { href: "#intro", libelle: apercuLabel },
        { href: "#moi", libelle: aProposLabel },
        { href: "#competences", libelle: competencesLabel },
        { href: "#projets", libelle: projetsLabel },
        { href: "#parcours", libelle: parcoursLabel },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-24 sm:h-32 flex items-center justify-between px-4 sm:px-12 pointer-events-none">
            {/* Espace réservé à gauche pour équilibrer la nav-pill centrée */}
            <div className="hidden sm:block w-36 pointer-events-none" />

            {/* Nav Pill centrale flottante (48px radius, fond blanc) */}
            <nav
                aria-label={apercuLabel}
                className="pointer-events-auto flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-3 rounded-full bg-white border border-ash/40 select-none mx-auto sm:mx-0"
            >
                {liensNav.map((item) => (
                    <motion.a
                        key={item.href}
                        href={item.href}
                        whileHover={{ y: -1 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs sm:text-sm font-medium text-slate hover:text-foreground tracking-tight transition-none"
                    >
                        {item.libelle}
                    </motion.a>
                ))}
            </nav>

            {/* Actions à droite : Sélecteur de langue + Contact */}
            <div className="pointer-events-auto flex items-center gap-3 sm:w-36 justify-end">
                {/* Sélecteur de langue bilingue */}
                <Link
                    href={nouveauChemin}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-ash/40 text-xs font-mono font-bold text-foreground hover:bg-mist-gray select-none"
                    title={basculerLangueLabel}
                >
                    <span className={!estAnglais ? "text-primary font-bold" : "text-smoke"}>FR</span>
                    <span className="mx-1 text-ash">/</span>
                    <span className={estAnglais ? "text-primary font-bold" : "text-smoke"}>EN</span>
                </Link>

                {/* Bouton Contact style filled primary (8px radius) */}
                <motion.a
                    href="mailto:contact@maelg.fr"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-xs font-mono font-bold tracking-wider uppercase select-none"
                >
                    {contactLabel}
                </motion.a>
            </div>
        </header>
    );
}
