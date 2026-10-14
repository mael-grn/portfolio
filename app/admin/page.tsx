import Link from "next/link";
import { exigerAdmin } from "@/app/lib/admin-auth";

const SECTIONS = [
    { href: "/admin/competences", titre: "Compétences", description: "Logos, niveaux de maîtrise et catégories." },
    { href: "/admin/projets", titre: "Projets", description: "Cartes du portfolio, images, compétences et traductions." },
    { href: "/admin/experiences", titre: "Expériences", description: "Parcours et expériences, avec traductions." },
];

export default async function PageAdmin() {
    await exigerAdmin();
    return (
        <main className="grid gap-4 sm:grid-cols-3">
            {SECTIONS.map((s) => (
                <Link key={s.href} href={s.href} className="flex flex-col gap-2 rounded-xl border border-foreground/10 bg-white/60 p-5">
                    <h2 className="text-lg font-bold">{s.titre}</h2>
                    <p className="text-sm text-foreground/70">{s.description}</p>
                </Link>
            ))}
        </main>
    );
}
