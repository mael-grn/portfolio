// Importe les données historiques (dictionnaires + images de /public) dans Neon et Blob.
// Usage : pnpm db:seed          (refuse si la base contient déjà des compétences)
//         pnpm db:seed --force  (vide les tables puis réimporte)
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL manquante (fichier .env).");
const sql = neon(url);

const lireJson = (p) => JSON.parse(readFileSync(new URL(`../app/dictionnaires/${p}`, import.meta.url), "utf8"));
const fr = lireJson("fr.json");

const [{ n }] = await sql`SELECT count(*)::int AS n FROM competence`;
if (n > 0 && !process.argv.includes("--force")) {
    console.log("La base contient déjà des données : utiliser --force pour les remplacer.");
    process.exit(0);
}
if (process.argv.includes("--force")) {
    await sql.transaction([
        sql`DELETE FROM projet`,
        sql`DELETE FROM experience`,
        sql`DELETE FROM competence`,
    ]);
}

const TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
async function televerser(cheminPublic, dossier) {
    const fichier = new URL(`../public/${cheminPublic}`, import.meta.url);
    const { pathname } = await put(`${dossier}/${cheminPublic.split("/").pop()}`, readFileSync(fichier), {
        access: "private",
        contentType: TYPES[extname(cheminPublic).toLowerCase()],
        addRandomSuffix: true,
    });
    return pathname;
}

const iso = (d) => (d ? d.split("/").reverse().join("-") : null);

// --- Compétences ---
const categories = ["programmation", "web", "bdd", "deploiement", "equipe"];
const idParNom = new Map();
for (const categorie of categories) {
    const liste = fr.competences[categorie]?.liste ?? [];
    for (const [ordre, c] of liste.entries()) {
        const logo = await televerser(`illustrations/${c.chemin_logo}`, "competences");
        const [{ id }] = await sql`
            INSERT INTO competence (nom, categorie, logo_chemin, maitrise, ordre)
            VALUES (${c.nom}, ${categorie}, ${logo}, ${c.maitrise}, ${ordre})
            RETURNING id`;
        idParNom.set(c.nom.toLowerCase().replace(/[^a-z0-9]/g, ""), id);
    }
}

// --- Projets ---
for (const [ordre, p] of fr.projets.liste.entries()) {
    const [{ id }] = await sql`
        INSERT INTO projet (date_debut, date_fin, taille, couleur, ordre)
        VALUES (${iso(p.dateDebut)}, ${iso(p.dateFin)}, 4, '#2A5269', ${ordre})
        RETURNING id`;
    await sql`INSERT INTO projet_traduction (projet_id, lang, nom, description) VALUES (${id}, 'fr', ${p.nom}, ${p.description})`;
    for (const nom of p.competences) {
        const cid = idParNom.get(nom.toLowerCase().replace(/[^a-z0-9]/g, ""));
        if (cid) await sql`INSERT INTO projet_competence (projet_id, competence_id) VALUES (${id}, ${cid}) ON CONFLICT DO NOTHING`;
        else console.warn(`Compétence introuvable pour le projet « ${p.nom} » : ${nom}`);
    }
    for (const [i, image] of p.images.entries()) {
        const chemin = await televerser(image, "projets");
        await sql`INSERT INTO projet_image (projet_id, chemin, ordre) VALUES (${id}, ${chemin}, ${i})`;
    }
}

// --- Expériences (doublons du placeholder ignorés) ---
const vus = new Set();
for (const e of fr.parcours.liste) {
    const cle = JSON.stringify(e);
    if (vus.has(cle)) continue;
    vus.add(cle);
    const [{ id }] = await sql`
        INSERT INTO experience (date_debut, date_fin) VALUES (${iso(e.dateDebut)}, ${iso(e.dateFin)}) RETURNING id`;
    await sql`
        INSERT INTO experience_traduction (experience_id, lang, nom, lieu, description)
        VALUES (${id}, 'fr', ${e.nom}, ${e.lieu}, ${e.description})`;
}

console.log("Import terminé.");
