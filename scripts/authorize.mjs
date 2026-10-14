// Script utilitaire pour gérer les utilisateurs autorisés dans la table Neon `authorized`.
// Usage :
//   pnpm db:authorize list
//   pnpm db:authorize add <id> [nom]
//   pnpm db:authorize remove <id>

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL manquante dans le fichier .env.");
const sql = neon(url);

const [action, id, ...reste] = process.argv.slice(2);
const nom = reste.join(" ") || null;

switch (action) {
    case "list": {
        const lignes = await sql`SELECT id, nom, created_at FROM authorized ORDER BY created_at DESC`;
        if (lignes.length === 0) {
            console.log("Aucun utilisateur autorisé actuellement.");
        } else {
            console.log(`Utilisateurs autorisés (${lignes.length}) :`);
            for (const u of lignes) {
                console.log(` - ID: ${u.id}${u.nom ? ` (${u.nom})` : ""} - Ajouté le : ${new Date(u.created_at).toLocaleString()}`);
            }
        }
        break;
    }
    case "add": {
        if (!id) {
            console.error("Erreur : l'ID est requis. Exemple : pnpm db:authorize add 42 'Maël'");
            process.exit(1);
        }
        await sql`
            INSERT INTO authorized (id, nom)
            VALUES (${String(id)}, ${nom})
            ON CONFLICT (id) DO UPDATE SET nom = EXCLUDED.nom
        `;
        console.log(`Utilisateur ID ${id} (${nom ?? "sans nom"}) ajouté aux autorisations.`);
        break;
    }
    case "remove": {
        if (!id) {
            console.error("Erreur : l'ID est requis. Exemple : pnpm db:authorize remove 42");
            process.exit(1);
        }
        const resultat = await sql`DELETE FROM authorized WHERE id = ${String(id)} RETURNING id`;
        if (resultat.length > 0) {
            console.log(`Utilisateur ID ${id} retiré des autorisations.`);
        } else {
            console.log(`ID ${id} non trouvé dans les autorisations.`);
        }
        break;
    }
    default:
        console.log("Usage :");
        console.log("  pnpm db:authorize list");
        console.log("  pnpm db:authorize add <id> [nom]");
        console.log("  pnpm db:authorize remove <id>");
        break;
}
