import "server-only";
import { sql } from "@/app/lib/db";
import { LOCALES, Locale } from "@/app/lib/langues";
import { ParcoursAdmin, ParcoursSaisie, TraductionParcours } from "@/app/modeles/Parcours";

/** Accès complet au parcours académique, toutes langues confondues (réservé à l'administration). */
export class ParcoursService {
    static async listerAdmin(): Promise<ParcoursAdmin[]> {
        const [parcoursListe, traductions] = (await sql.transaction([
            sql`SELECT id, date_debut::text AS date_debut, date_fin::text AS date_fin
                FROM parcours ORDER BY date_debut DESC`,
            sql`SELECT parcours_id, lang, nom, lieu, description FROM parcours_traduction`,
        ])) as [
            { id: string; date_debut: string; date_fin: string | null }[],
            { parcours_id: string; lang: Locale; nom: string; lieu: string; description: string }[],
        ];

        return parcoursListe.map((p) => ({
            id: p.id,
            dateDebut: p.date_debut,
            dateFin: p.date_fin,
            traductions: Object.fromEntries(
                LOCALES.map((lang) => {
                    const t = traductions.find((x) => x.parcours_id === p.id && x.lang === lang);
                    return [lang, { nom: t?.nom ?? "", lieu: t?.lieu ?? "", description: t?.description ?? "" }];
                }),
            ) as Record<Locale, TraductionParcours>,
        }));
    }

    static async existe(id: string): Promise<boolean> {
        return ((await sql`SELECT 1 FROM parcours WHERE id = ${id}`) as unknown[]).length > 0;
    }

    /** Écrit le parcours (création ou mise à jour) de façon atomique : une seule transaction. */
    static async enregistrer(id: string, saisie: ParcoursSaisie, creation: boolean): Promise<void> {
        const langues = LOCALES.filter((lang) => saisie.traductions[lang]?.nom?.trim());

        await sql.transaction([
            creation
                ? sql`INSERT INTO parcours (id, date_debut, date_fin) VALUES (${id}, ${saisie.dateDebut}, ${saisie.dateFin})`
                : sql`UPDATE parcours SET date_debut = ${saisie.dateDebut}, date_fin = ${saisie.dateFin}, updated_at = now()
                      WHERE id = ${id}`,
            ...langues.map((lang) => {
                const t = saisie.traductions[lang]!;
                return sql`INSERT INTO parcours_traduction (parcours_id, lang, nom, lieu, description)
                           VALUES (${id}, ${lang}, ${t.nom}, ${t.lieu}, ${t.description})
                           ON CONFLICT (parcours_id, lang)
                           DO UPDATE SET nom = EXCLUDED.nom, lieu = EXCLUDED.lieu, description = EXCLUDED.description`;
            }),
            sql`DELETE FROM parcours_traduction WHERE parcours_id = ${id} AND NOT (lang = ANY(${langues}::text[]))`,
        ]);
    }

    static async supprimer(id: string): Promise<void> {
        await sql`DELETE FROM parcours WHERE id = ${id}`;
    }
}
