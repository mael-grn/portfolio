import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { LOCALES, LOCALE_PAR_DEFAUT } from '@/app/lib/langues';
import { TokenUtil } from '@/app/lib/token';

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

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Exclusions directes des routes d'erreur ou publiques
    if (pathname === '/no') {
        return NextResponse.next();
    }

    // 2. Sécurisation de l'espace /admin via la plateforme globale account.maelg.fr
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('token');

        const createLoginRedirect = () => {
            const loginUrl = new URL("https://account.maelg.fr/login");
            loginUrl.searchParams.set("redirect", request.nextUrl.href);
            return NextResponse.redirect(loginUrl);
        };

        // Aucun token présent
        if (!token?.value) {
            if (pathname.startsWith('/admin/api')) {
                return NextResponse.json("Non autorisé", { status: 401 });
            }
            return createLoginRedirect();
        }

        // Vérification de la signature et expiration du token JWT
        const isValid = await TokenUtil.verifyToken(token.value);
        if (!isValid) {
            if (pathname.startsWith('/admin/api')) {
                const response = NextResponse.json("Non autorisé", { status: 401 });
                response.cookies.delete('token');
                response.cookies.delete('user');
                return response;
            }

            const response = createLoginRedirect();
            response.cookies.delete('token');
            response.cookies.delete('user');
            return response;
        }

        // Vérification de l'ID utilisateur et de ses droits dans la table authorized (Neon)
        const id = await TokenUtil.getIdFromToken(token.value);
        if (id === null) {
            return NextResponse.redirect(new URL("/no", request.url));
        }

        const authorized = await TokenUtil.isAuthorized(id);
        if (!authorized) {
            return NextResponse.redirect(new URL("/no", request.url));
        }

        return NextResponse.next();
    }

    // 3. Routage i18n pour le site public
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return NextResponse.next();

    // Détection de la langue du navigateur et redirection vers /{locale}
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);

    return NextResponse.redirect(newUrl);
}

export const config = {
    // Intercepte tout sauf les fichiers statiques, médias, images optimisées et favicon
    matcher: ['/((?!_next/static|_next/image|favicon.ico|medias|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'],
};