// Source de vérité unique des langues supportées (utilisée par proxy.ts, les dictionnaires et la base).
export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_PAR_DEFAUT: Locale = "fr";

export function estLocale(valeur: string): valeur is Locale {
    return (LOCALES as readonly string[]).includes(valeur);
}
