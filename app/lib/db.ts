import "server-only";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
    throw new Error("DATABASE_URL manquante : voir le fichier .env.");
}

/**
 * Client Neon HTTP (adapté au serverless, une requête = un aller-retour).
 * Toujours utiliser la forme « tagged template » (sql`... ${valeur}`) : les valeurs sont paramétrées,
 * ce qui protège contre l'injection SQL. Ne jamais concaténer de texte utilisateur dans la requête.
 */
export const sql = neon(url);
