import "server-only";
import { sql } from "@/app/lib/db";
import { LOCALES, Locale } from "@/app/lib/langues";
import { ExperienceAdmin, ExperienceSaisie, TraductionExperience } from "@/app/modeles/Experience";

/** Accès complet aux expériences, toutes langues confondues (réservé à l'administration). */
export class ExperienceService {
    static async listerAdmin(): Promise<ExperienceAdmin[]> {
        const [experiences, traductions] = (await sql.transaction([
            sql`SELECT id, date_debut::text AS date_debut, date_fin::text AS date_fin
                FROM experience ORDER BY date_debut DESC`,
            sql`SELECT experience_id, lang, nom, lieu, description FROM experience_traduction`,
        ])) as [
            { id: string; date_debut: string; date_fin: string | null }[],
            { experience_id: string; lang: Locale; nom: string; lieu: string; description: string }[],
        ];

        return experiences.map((e) => ({
            id: e.id,
            dateDebut: e.date_debut,
            dateFin: e.date_fin,
            traductions: Object.fromEntries(
                LOCALES.map((lang) => {
                    const t = traductions.find((x) => x.experience_id === e.id && x.lang === lang);
                    return [lang, { nom: t?.nom ?? "", lieu: t?.lieu ?? "", description: t?.description ?? "" }];
                }),
            ) as Record<Locale, TraductionExperience>,
        }));
    }

    static async existe(id: string): Promise<boolean> {
        return ((await sql`SELECT 1 FROM experience WHERE id = ${id}`) as unknown[]).length > 0;
    }

    /** Écrit l'expérience (création ou mise à jour) de façon atomique : une seule transaction. */
    static async enregistrer(id: string, saisie: ExperienceSaisie, creation: boolean): Promise<void> {
        const langues = LOCALES.filter((lang) => saisie.traductions[lang]?.nom?.trim());

        await sql.transaction([
            creation
                ? sql`INSERT INTO experience (id, date_debut, date_fin) VALUES (${id}, ${saisie.dateDebut}, ${saisie.dateFin})`
                : sql`UPDATE experience SET date_debut = ${saisie.dateDebut}, date_fin = ${saisie.dateFin}, updated_at = now()
                      WHERE id = ${id}`,
            ...langues.map((lang) => {
                const t = saisie.traductions[lang]!;
                return sql`INSERT INTO experience_traduction (experience_id, lang, nom, lieu, description)
                           VALUES (${id}, ${lang}, ${t.nom}, ${t.lieu}, ${t.description})
                           ON CONFLICT (experience_id, lang)
                           DO UPDATE SET nom = EXCLUDED.nom, lieu = EXCLUDED.lieu, description = EXCLUDED.description`;
            }),
            sql`DELETE FROM experience_traduction WHERE experience_id = ${id} AND NOT (lang = ANY(${langues}::text[]))`,
        ]);
    }

    static async supprimer(id: string): Promise<void> {
        await sql`DELETE FROM experience WHERE id = ${id}`;
    }
}
