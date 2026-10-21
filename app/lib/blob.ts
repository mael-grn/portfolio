import "server-only";
import { del, put } from "@vercel/blob";
import { DossierMedia, estCheminMedia } from "@/app/lib/media";

export const TAILLE_MAX_IMAGE = 4 * 1024 * 1024; // 4 Mo (limite des fonctions serverless : 4,5 Mo)

type TypeImage = { extension: string; contentType: string };

/** Détecte le vrai type du fichier via ses premiers octets (le type MIME envoyé par le client n'est pas fiable). */
function detecterType(octets: Uint8Array): TypeImage | null {
    const debut = (taille: number) => Array.from(octets.slice(0, taille));
    const [a, b, c, d] = debut(4);
    if (a === 0x89 && b === 0x50 && c === 0x4e && d === 0x47) return { extension: "png", contentType: "image/png" };
    if (a === 0xff && b === 0xd8 && c === 0xff) return { extension: "jpg", contentType: "image/jpeg" };
    if (a === 0x47 && b === 0x49 && c === 0x46) return { extension: "gif", contentType: "image/gif" };
    const texte = new TextDecoder().decode(octets.slice(0, 12));
    if (texte.startsWith("RIFF") && new TextDecoder().decode(octets.slice(8, 12)) === "WEBP") {
        return { extension: "webp", contentType: "image/webp" };
    }
    return null;
}

function estSvgSain(octets: Uint8Array): boolean {
    const texte = new TextDecoder().decode(octets);
    if (!/<svg[\s>]/i.test(texte)) return false;
    // Un SVG peut embarquer du script : on refuse les constructions dangereuses (défense en profondeur,
    // la route /medias applique en plus une CSP « sandbox » et nosniff).
    return !/<script|javascript:|\son\w+\s*=|<foreignObject|<iframe|<embed|<object/i.test(texte);
}

function nettoyerNom(nom: string): string {
    const base = nom.replace(/\.[^.]*$/, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
}

export class ImageInvalideError extends Error {}

/** Valide puis téléverse une image dans le Blob privé. Retourne le chemin (pathname) à stocker en base. */
export async function televerserImage(fichier: File, dossier: DossierMedia): Promise<string> {
    if (fichier.size === 0) throw new ImageInvalideError("Fichier vide.");
    if (fichier.size > TAILLE_MAX_IMAGE) throw new ImageInvalideError("Image trop lourde (4 Mo maximum).");

    const octets = new Uint8Array(await fichier.arrayBuffer());
    let type = detecterType(octets);
    if (!type && fichier.name.toLowerCase().endsWith(".svg") && estSvgSain(octets)) {
        type = { extension: "svg", contentType: "image/svg+xml" };
    }
    if (!type) throw new ImageInvalideError("Format non supporté (PNG, JPEG, WebP, GIF ou SVG).");

    const { pathname } = await put(`${dossier}/${nettoyerNom(fichier.name)}.${type.extension}`, Buffer.from(octets), {
        access: "private",
        contentType: type.contentType,
        addRandomSuffix: true,
        cacheControlMaxAge: 31536000,
    });
    return pathname;
}

/** Supprime des images du Blob (échecs ignorés : une image orpheline n'est pas bloquante). */
export async function supprimerImages(chemins: string[]): Promise<void> {
    const valides = chemins.filter(estCheminMedia);
    if (valides.length === 0) return;
    try {
        await del(valides);
    } catch (erreur) {
        console.error("Suppression d'images Blob impossible :", erreur);
    }
}
