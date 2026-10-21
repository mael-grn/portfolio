import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TokenUtil } from "@/app/lib/token";

export const URL_CONNEXION_COMPTE = "https://account.maelg.fr/login";

/**
 * Vérifie si la requête courante possède un jeton JWT valide et si son identifiant
 * est enregistré dans la table `authorized` de la base Neon.
 */
export async function adminAutorise(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return false;

        const isValid = await TokenUtil.verifyToken(token);
        if (!isValid) return false;

        const id = await TokenUtil.getIdFromToken(token);
        if (id === null) return false;

        return await TokenUtil.isAuthorized(id);
    } catch {
        return false;
    }
}

/**
 * Contrôle d'accès strict pour les Server Actions d'écriture.
 * Lance une exception immédiate si l'utilisateur n'est pas autorisé.
 */
export async function assertAdmin(): Promise<void> {
    const autorise = await adminAutorise();
    if (!autorise) {
        throw new Error("Accès non autorisé.");
    }
}

/**
 * Récupère le compte administrateur authentifié pour tracer les modifications.
 */
export async function recupererAdminCourant(): Promise<{ id: string; nom: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (token) {
            const id = await TokenUtil.getIdFromToken(token);
            if (id !== null) {
                const admin = await TokenUtil.getAdmin(id);
                if (admin) return admin;
            }
        }
    } catch {
        // En cas d'erreur de lecture
    }
    return { id: "1", nom: "Maël" };
}

/**
 * Contrôle d'accès pour les pages serveur de l'espace /admin.
 * - Si absent ou jeton invalide : redirection vers https://account.maelg.fr/login
 * - Si jeton valide mais utilisateur non autorisé en base : redirection vers /no
 */
export async function exigerAdmin(urlCible?: string): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const creerUrlConnexion = () => {
        const loginUrl = new URL(URL_CONNEXION_COMPTE);
        if (urlCible) loginUrl.searchParams.set("redirect", urlCible);
        return loginUrl.toString();
    };

    if (!token) {
        redirect(creerUrlConnexion());
    }

    const isValid = await TokenUtil.verifyToken(token);
    if (!isValid) {
        redirect(creerUrlConnexion());
    }

    const id = await TokenUtil.getIdFromToken(token);
    if (id === null) {
        redirect("/no");
    }

    const autorise = await TokenUtil.isAuthorized(id);
    if (!autorise) {
        redirect("/no");
    }
}
