import { Locale } from "@/app/lib/langues";

/** Formate une date ISO (`AAAA-MM-JJ`) en « mois année » dans la langue demandée (déterministe : serveur = client). */
export function formaterDate(iso: string, lang: Locale): string {
    return new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}
