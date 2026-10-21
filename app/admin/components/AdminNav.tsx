"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import AdminNavProgressiveBlur from "@/app/admin/components/AdminNavProgressiveBlur";

const ONGLETS_ADMIN = [
    { href: "/admin", libelle: "Dashboard" },
    { href: "/admin/competences", libelle: "Compétences" },
    { href: "/admin/projets", libelle: "Projets" },
    { href: "/admin/experiences", libelle: "Expériences" },
    { href: "/admin/parcours", libelle: "Parcours" },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Arrière-plan flou progressif non-linéaire */}
            <AdminNavProgressiveBlur />

            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
                {/* Titre en haut à gauche avec réaction au hover */}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                        href="/admin"
                        className="font-display uppercase text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground select-none"
                    >
                        PORTAIL ADMIN
                    </Link>
                </motion.div>

                {/* Boutons de navigation avec pilule active coulissante et hover Framer Motion */}
                <LayoutGroup id="admin-nav-group">
                <nav aria-label="Sections d'administration" className="flex flex-wrap items-center gap-1.5">
                    {ONGLETS_ADMIN.map((onglet) => {
                        const estActif =
                            onglet.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(onglet.href);

                        return (
                            <Link
                                key={onglet.href}
                                href={onglet.href}
                                className="relative rounded-full focus:outline-none select-none"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="relative px-4 py-2"
                                >
                                    {estActif && (
                                        <motion.div
                                            layoutId="admin-active-pill"
                                            className="absolute inset-0 rounded-full bg-foreground"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                    <span
                                        className={`relative z-10 text-sm font-medium ${
                                            estActif
                                                ? "text-background"
                                                : "text-foreground/75"
                                        }`}
                                    >
                                        {onglet.libelle}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>
            </LayoutGroup>
            </div>
        </header>
    );
}
