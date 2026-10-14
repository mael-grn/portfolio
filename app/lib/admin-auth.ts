import "server-only";
import { notFound } from "next/navigation";

/**
 * Point UNIQUE de contrôle d'accès à l'administration.
 *
 * L'authentification n'est pas encore implémentée : en attendant, l'accès est refusé en production
 * (sauf opt-in explicite via ADMIN_ACCES_NON_PROTEGE=true, à ne jamais activer sur un site public).
 * Toutes les pages /admin et toutes les Server Actions d'écriture passent par ces fonctions :
 * il suffira d'y brancher la vraie vérification de session.
 */
export async function adminAutorise(): Promise<boolean> {
    if (process.env.NODE_ENV !== "production") return true;
    return process.env.ADMIN_ACCES_NON_PROTEGE === "true";
}

export async function assertAdmin(): Promise<void> {
    if (!(await adminAutorise())) {
        throw new Error("Accès non autorisé.");
    }
}

/** À appeler en tête de CHAQUE page /admin (un layout n'est pas ré-exécuté à chaque navigation). */
export async function exigerAdmin(): Promise<void> {
    if (!(await adminAutorise())) notFound();
}
