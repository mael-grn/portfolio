import { exigerAdmin } from "@/app/lib/admin-auth";
import { ParcoursService } from "@/app/services/ParcoursService";
import TableauParcours from "@/app/admin/components/TableauParcours";

export const dynamic = "force-dynamic";

export default async function PageParcours() {
    await exigerAdmin();
    const parcours = await ParcoursService.listerAdmin();

    return (
        <main className="flex flex-col gap-6">
            <TableauParcours parcours={parcours} />
        </main>
    );
}
