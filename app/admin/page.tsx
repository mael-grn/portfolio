import { exigerAdmin } from "@/app/lib/admin-auth";
import { CompetenceService } from "@/app/services/CompetenceService";
import { ProjetService } from "@/app/services/ProjetService";
import { ExperienceService } from "@/app/services/ExperienceService";
import { ParcoursService } from "@/app/services/ParcoursService";
import { JournalService } from "@/app/services/JournalService";
import TuilesStatsAdmin from "@/app/admin/components/TuilesStatsAdmin";
import DernieresModifications from "@/app/admin/components/DernieresModifications";

export const dynamic = "force-dynamic";

export default async function PageAdmin() {
    await exigerAdmin();

    const [competences, projets, experiences, parcours, dernieresModifications] = await Promise.all([
        CompetenceService.listerAdmin(),
        ProjetService.listerAdmin(),
        ExperienceService.listerAdmin(),
        ParcoursService.listerAdmin(),
        JournalService.listerDernieres(8),
    ]);

    const stats = [
        {
            titre: "Compétences",
            valeur: competences.length,
            href: "/admin/competences",
        },
        {
            titre: "Projets",
            valeur: projets.length,
            href: "/admin/projets",
        },
        {
            titre: "Expériences",
            valeur: experiences.length,
            href: "/admin/experiences",
        },
        {
            titre: "Parcours",
            valeur: parcours.length,
            href: "/admin/parcours",
        },
    ];

    return (
        <main className="flex flex-col gap-8">
            {/* Cartes métriques interactives du dashboard */}
            <TuilesStatsAdmin stats={stats} />

            {/* Liste des dernières modifications intervenues sur la BDD */}
            <DernieresModifications modifications={dernieresModifications} />
        </main>
    );
}
