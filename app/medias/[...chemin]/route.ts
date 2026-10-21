import { get } from "@vercel/blob";
import { estCheminMedia, estSvg } from "@/app/lib/media";

const EN_TETES_SECURITE = {
    "X-Content-Type-Options": "nosniff",
    // Même si un SVG est ouvert directement, aucun script ne peut s'exécuter.
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    "Cross-Origin-Resource-Policy": "same-origin",
};

/**
 * Sert les images du Blob privé. Chemin validé strictement (liste blanche), type d'image obligatoire,
 * cache navigateur/CDN immuable (les noms de fichiers contiennent un suffixe aléatoire).
 */
export async function GET(_requete: Request, { params }: { params: Promise<{ chemin: string[] }> }) {
    const { chemin: segments } = await params;
    const chemin = segments.join("/");

    if (!estCheminMedia(chemin)) return new Response("Introuvable", { status: 404 });

    const resultat = await get(chemin, { access: "private" }).catch(() => null);
    if (!resultat || resultat.statusCode !== 200) return new Response("Introuvable", { status: 404 });

    const contentType = resultat.blob.contentType;
    if (!contentType.startsWith("image/")) return new Response("Type non supporté", { status: 415 });

    return new Response(resultat.stream, {
        headers: {
            ...EN_TETES_SECURITE,
            "Content-Type": estSvg(chemin) ? "image/svg+xml" : contentType,
            "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
            ETag: resultat.blob.etag,
        },
    });
}
