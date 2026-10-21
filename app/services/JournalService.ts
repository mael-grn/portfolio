import "server-only";
import { sql } from "@/app/lib/db";
import { EntreeJournal, EntiteModifiee, TypeAction } from "@/app/modeles/JournalActivite";

interface LigneJournal {
    id: string;
    type_action: TypeAction;
    entite: EntiteModifiee;
    cible_nom: string;
    auteur_id: string;
    auteur_nom: string;
    created_at: string;
}

export class JournalService {
    /**
     * Enregistre un événement de modification dans la base de données.
     */
    static async enregistrer({
        typeAction,
        entite,
        cibleNom,
        auteurId,
        auteurNom,
    }: {
        typeAction: TypeAction;
        entite: EntiteModifiee;
        cibleNom: string;
        auteurId: string;
        auteurNom: string;
    }): Promise<void> {
        try {
            await sql`
                INSERT INTO journal_activite (type_action, entite, cible_nom, auteur_id, auteur_nom)
                VALUES (${typeAction}, ${entite}, ${cibleNom}, ${auteurId}, ${auteurNom})
            `;
        } catch (erreur) {
            console.error("Erreur lors de l'enregistrement dans le journal d'activité :", erreur);
        }
    }

    /**
     * Récupère la liste des dernières modifications intervenues sur la base.
     * Si le journal est vierge (ex. nouvelle installation), il est automatiquement
     * initialisé à partir des horodatages de compétences, projets et expériences.
     */
    static async listerDernieres(limite = 10): Promise<EntreeJournal[]> {
        let lignes = (await sql`
            SELECT id, type_action, entite, cible_nom, auteur_id, auteur_nom, created_at
            FROM journal_activite
            ORDER BY created_at DESC
            LIMIT ${limite}
        `) as LigneJournal[];

        if (lignes.length === 0) {
            await JournalService.initialiserHistorique();
            lignes = (await sql`
                SELECT id, type_action, entite, cible_nom, auteur_id, auteur_nom, created_at
                FROM journal_activite
                ORDER BY created_at DESC
                LIMIT ${limite}
            `) as LigneJournal[];
        }

        return lignes.map((l) => ({
            id: l.id,
            typeAction: l.type_action,
            entite: l.entite,
            cibleNom: l.cible_nom,
            auteurId: l.auteur_id,
            auteurNom: l.auteur_nom,
            createdAt: l.created_at,
        }));
    }

    /**
     * Initialise le journal d'activité à partir des entrées existantes en base.
     */
    private static async initialiserHistorique(): Promise<void> {
        try {
            const admin = (await sql`SELECT id, nom FROM authorized ORDER BY created_at ASC LIMIT 1`) as {
                id: string;
                nom: string | null;
            }[];
            const auteurId = admin[0]?.id ?? "1";
            const auteurNom = admin[0]?.nom ?? "Maël";

            // Compétences
            const competences = (await sql`
                SELECT nom, updated_at FROM competence ORDER BY updated_at DESC LIMIT 6
            `) as { nom: string; updated_at: string }[];

            // Projets
            const projets = (await sql`
                SELECT pt.nom, p.updated_at
                FROM projet p
                LEFT JOIN projet_traduction pt ON pt.projet_id = p.id AND pt.lang = 'fr'
                ORDER BY p.updated_at DESC
                LIMIT 5
            `) as { nom: string | null; updated_at: string }[];

            // Expériences
            const experiences = (await sql`
                SELECT et.nom, e.updated_at
                FROM experience e
                LEFT JOIN experience_traduction et ON et.experience_id = e.id AND et.lang = 'fr'
                ORDER BY e.updated_at DESC
                LIMIT 5
            `) as { nom: string | null; updated_at: string }[];

            const elements = [
                ...competences.map((c) => ({
                    entite: "competence" as const,
                    nom: c.nom,
                    date: c.updated_at,
                })),
                ...projets.map((p) => ({
                    entite: "projet" as const,
                    nom: p.nom ?? "Projet",
                    date: p.updated_at,
                })),
                ...experiences.map((e) => ({
                    entite: "experience" as const,
                    nom: e.nom ?? "Expérience",
                    date: e.updated_at,
                })),
            ];

            elements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            for (const el of elements.slice(0, 8)) {
                await sql`
                    INSERT INTO journal_activite (type_action, entite, cible_nom, auteur_id, auteur_nom, created_at)
                    VALUES ('modification', ${el.entite}, ${el.nom}, ${auteurId}, ${auteurNom}, ${el.date}::timestamptz)
                `;
            }
        } catch (erreur) {
            console.error("Erreur lors de l'initialisation de l'historique :", erreur);
        }
    }
}
