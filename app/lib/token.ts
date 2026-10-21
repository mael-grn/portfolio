import { jwtVerify } from "jose";
import { sql } from "@/app/lib/db";

/**
 * Gestionnaire de jetons JWT partagés avec la plateforme globale https://account.maelg.fr.
 */
export class TokenUtil {
    private static getSecret(): Uint8Array {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("Variable d'environnement JWT_SECRET manquante.");
        }
        return new TextEncoder().encode(secret);
    }

    /**
     * Vérifie la validité cryptographique et l'expiration du jeton JWT.
     */
    static async verifyToken(token: string): Promise<boolean> {
        try {
            await jwtVerify(token, TokenUtil.getSecret());
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Récupère l'identifiant utilisateur chiffré dans le jeton.
     */
    static async getIdFromToken(token: string): Promise<string | number | null> {
        try {
            const { payload } = await jwtVerify(token, TokenUtil.getSecret());
            if (payload.id === undefined || payload.id === null) return null;
            return payload.id as string | number;
        } catch {
            return null;
        }
    }

    /**
     * Vérifie si l'identifiant extrait du jeton est explicitement autorisé en base de données.
     */
    static async isAuthorized(id: string | number): Promise<boolean> {
        try {
            const rows = (await sql`
                SELECT id FROM authorized WHERE id = ${String(id)} LIMIT 1
            `) as unknown[];
            return rows.length > 0;
        } catch (erreur) {
            console.error("Erreur lors de la vérification de l'autorisation :", erreur);
            return false;
        }
    }

    /**
     * Récupère les informations d'un administrateur autorisé par son identifiant.
     */
    static async getAdmin(id: string | number): Promise<{ id: string; nom: string } | null> {
        try {
            const rows = (await sql`
                SELECT id, nom FROM authorized WHERE id = ${String(id)} LIMIT 1
            `) as { id: string; nom: string | null }[];
            if (rows.length === 0) return null;
            return {
                id: rows[0].id,
                nom: rows[0].nom || "Maël",
            };
        } catch {
            return null;
        }
    }
}
