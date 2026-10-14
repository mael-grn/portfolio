import FormulaireProjet from "@/app/admin/components/FormulaireProjet";
import { CarteRepliable } from "@/app/admin/components/ui";
import { exigerAdmin } from "@/app/lib/admin-auth";
import { LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import { CompetenceService } from "@/app/services/CompetenceService";
import { ProjetService } from "@/app/services/ProjetService";

export default async function PageProjets() {
    await exigerAdmin();
    const [projets, competences] = await Promise.all([ProjetService.listerAdmin(), CompetenceService.listerAdmin()]);
    const options = competences.map((c) => ({ id: c.id, nom: c.nom }));

    return (
        <main className="flex flex-col gap-6">
            <h1 className="text-3xl">Projets</h1>

            <CarteRepliable titre="Nouveau projet" ouvertParDefaut={projets.length === 0}>
                <FormulaireProjet competences={options} />
            </CarteRepliable>

            <div className="flex flex-col gap-3">
                {projets.map((p) => (
                    <CarteRepliable
                        key={p.id}
                        titre={p.traductions[LOCALE_PAR_DEFAUT].nom}
                        sousTitre={`${p.dateDebut} → ${p.dateFin ?? "en cours"} · taille ${p.taille} · ordre ${p.ordre}`}
                    >
                        <FormulaireProjet projet={p} competences={options} />
                    </CarteRepliable>
                ))}
            </div>
        </main>
    );
}
