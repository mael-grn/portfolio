import FormulaireExperience from "@/app/admin/components/FormulaireExperience";
import { CarteRepliable } from "@/app/admin/components/ui";
import { exigerAdmin } from "@/app/lib/admin-auth";
import { LOCALE_PAR_DEFAUT } from "@/app/lib/langues";
import { ExperienceService } from "@/app/services/ExperienceService";

export default async function PageExperiences() {
    await exigerAdmin();
    const experiences = await ExperienceService.listerAdmin();

    return (
        <main className="flex flex-col gap-6">
            <h1 className="text-3xl">Expériences</h1>

            <CarteRepliable titre="Nouvelle expérience" ouvertParDefaut={experiences.length === 0}>
                <FormulaireExperience />
            </CarteRepliable>

            <div className="flex flex-col gap-3">
                {experiences.map((e) => (
                    <CarteRepliable
                        key={e.id}
                        titre={e.traductions[LOCALE_PAR_DEFAUT].nom}
                        sousTitre={`${e.dateDebut} → ${e.dateFin ?? "en cours"}`}
                    >
                        <FormulaireExperience experience={e} />
                    </CarteRepliable>
                ))}
            </div>
        </main>
    );
}
