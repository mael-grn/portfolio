import { exigerAdmin } from "@/app/lib/admin-auth";
import { CompetenceService } from "@/app/services/CompetenceService";
import { ProjetService } from "@/app/services/ProjetService";
import TableauProjets from "@/app/admin/components/TableauProjets";

export const dynamic = "force-dynamic";

export default async function PageProjets() {
    await exigerAdmin();
    const [projets, competences] = await Promise.all([ProjetService.listerAdmin(), CompetenceService.listerAdmin()]);
    const options = competences.map((c) => ({ id: c.id, nom: c.nom }));

    return (
        <main className="flex flex-col gap-6">
            <TableauProjets projets={projets} competencesOptions={options} />
        </main>
    );
}
