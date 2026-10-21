import { exigerAdmin } from "@/app/lib/admin-auth";
import { ExperienceService } from "@/app/services/ExperienceService";
import TableauExperiences from "@/app/admin/components/TableauExperiences";

export const dynamic = "force-dynamic";

export default async function PageExperiences() {
    await exigerAdmin();
    const experiences = await ExperienceService.listerAdmin();

    return (
        <main className="flex flex-col gap-6">
            <TableauExperiences experiences={experiences} />
        </main>
    );
}
