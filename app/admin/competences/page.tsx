import FormulaireCompetence from "@/app/admin/components/FormulaireCompetence";
import { CarteRepliable } from "@/app/admin/components/ui";
import { exigerAdmin } from "@/app/lib/admin-auth";
import { CATEGORIES_COMPETENCE } from "@/app/modeles/Competence";
import { getDictionary } from "@/app/recup-dictionnaire";
import { CompetenceService } from "@/app/services/CompetenceService";

export default async function PageCompetences() {
    await exigerAdmin();
    const [competences, dict] = await Promise.all([CompetenceService.listerAdmin(), getDictionary("fr")]);
    const categories = CATEGORIES_COMPETENCE.map((valeur) => ({ valeur, libelle: dict.competences.categories[valeur] }));

    return (
        <main className="flex flex-col gap-6">
            <h1 className="text-3xl">Compétences</h1>

            <CarteRepliable titre="Nouvelle compétence" ouvertParDefaut={competences.length === 0}>
                <FormulaireCompetence categories={categories} />
            </CarteRepliable>

            {categories.map((categorie) => {
                const liste = competences.filter((c) => c.categorie === categorie.valeur);
                return (
                    <section key={categorie.valeur} className="flex flex-col gap-3">
                        <h2 className="text-xl">{categorie.libelle} ({liste.length})</h2>
                        {liste.map((c) => (
                            <CarteRepliable key={c.id} titre={c.nom} sousTitre={`Maîtrise ${c.maitrise}/5 · ordre ${c.ordre}`}>
                                <FormulaireCompetence competence={c} categories={categories} />
                            </CarteRepliable>
                        ))}
                    </section>
                );
            })}
        </main>
    );
}
