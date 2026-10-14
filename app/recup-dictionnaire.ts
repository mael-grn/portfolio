// src/app/recup-dictionnaire.ts
import 'server-only';
import type fr from '@/app/dictionnaires/fr.json';
import {LOCALE_PAR_DEFAUT, Locale} from '@/app/lib/langues';

// Type dérivé automatiquement de la structure du JSON
export type Dictionary = typeof fr;

// Typé `Record<Locale, ...>` : le compilateur vérifie que chaque langue a exactement les mêmes clés que fr.json.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    fr: () => import('@/app/dictionnaires/fr.json').then((module) => module.default),
    en: () => import('@/app/dictionnaires/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    const loadDictionary = dictionaries[locale] ?? dictionaries[LOCALE_PAR_DEFAUT];
    return loadDictionary();
};
