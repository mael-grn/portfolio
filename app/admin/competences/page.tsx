import { exigerAdmin } from "@/app/lib/admin-auth";
import { CATEGORIES_COMPETENCE } from "@/app/modeles/Competence";
import { getDictionary } from "@/app/recup-dictionnaire";
import { CompetenceService } from "@/app/services/CompetenceService";
import TableauCompetences from "@/app/admin/components/TableauCompetences";

export const dynamic = "force-dynamic";

export default async function PageCompetences() {
    await exigerAdmin();
    const [competences, dict] = await Promise.all([CompetenceService.listerAdmin(), getDictionary("fr")]);
    const categories = CATEGORIES_COMPETENCE.map((valeur) => ({
        valeur,
        libelle: dict.competences.categories[valeur],
    }));

    return (
        <main className="flex flex-col gap-6">
            <TableauCompetences competences={competences} categories={categories} />
        </main>
    );
}
