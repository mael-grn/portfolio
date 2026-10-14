// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { LOCALES, LOCALE_PAR_DEFAUT } from '@/app/lib/langues';

const locales: readonly string[] = LOCALES;
const defaultLocale: string = LOCALE_PAR_DEFAUT;

function getLocale(request: NextRequest): string {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

    try {
        return match(languages, [...locales], defaultLocale);
    } catch {
        return defaultLocale;
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Vérifie si le pathname contient déjà une langue supportée
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return NextResponse.next();

    // Détection de la langue du navigateur et redirection
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);

    return NextResponse.redirect(newUrl);
}

export const config = {
    // Ignore les routes API, l'administration, les médias, les assets statiques et les fichiers système
    matcher: ['/((?!api|admin|medias|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};