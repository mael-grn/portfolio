import type { NextConfig } from "next";

// En-têtes de sécurité appliqués à toutes les routes.
// (Pas de Content-Security-Policy stricte pour l'instant : elle nécessite un nonce par requête avec Next.js.)
const entetesSecurite = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        return [
            { source: "/:path*", headers: entetesSecurite },
            // L'administration ne doit être ni indexée ni mise en cache.
            {
                source: "/admin/:path*",
                headers: [
                    { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
                    { key: "Cache-Control", value: "no-store" },
                ],
            },
        ];
    },
    experimental: {
        // Téléversement d'images via Server Actions (4 Mo max par image, validé côté serveur ; Vercel limite la requête à 4,5 Mo).
        serverActions: { bodySizeLimit: "10mb" },
    },
};

export default nextConfig;
