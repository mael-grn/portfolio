import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";

// L'administration ne doit jamais être mise en cache, ni indexée.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
    title: "Administration",
    robots: { index: false, follow: false, nocache: true },
};

const LIENS = [
    { href: "/admin/competences", libelle: "Compétences" },
    { href: "/admin/projets", libelle: "Projets" },
    { href: "/admin/experiences", libelle: "Expériences" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8">
            <nav aria-label="Administration" className="flex flex-wrap items-center gap-3">
                <Link href="/admin" className="mr-4 text-xl font-black">Administration</Link>
                {LIENS.map((lien) => (
                    <Link key={lien.href} href={lien.href} className="rounded-full bg-foreground/10 px-4 py-1 text-sm font-medium">
                        {lien.libelle}
                    </Link>
                ))}
                <Link href="/" className="ml-auto text-sm underline">Voir le site</Link>
            </nav>
            {children}
        </div>
    );
}
