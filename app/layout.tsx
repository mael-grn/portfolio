import type {Metadata} from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono, Syne, Outfit } from "next/font/google";
import "./globals.css";
import { NavProvider } from "@/app/context/NavContext";

const barlowCondensed = Barlow_Condensed({
    variable: "--font-condensed",
    weight: ["700", "800"],
    subsets: ["latin"],
});

const inter = Inter({
    variable: "--font-sans",
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
    variable: "--font-jetbrains",
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

const syne = Syne({
    variable: "--font-syne",
    weight: ["700", "800"],
    subsets: ["latin"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Maël Garnier — Ingénieur Informatique Éclairé",
    description: "Portfolio d'ingénieur logiciel et développement de systèmes haute performance.",
};

export default function RootLayout({children}: LayoutProps<"/">) {
    return (
        <html
            lang="fr"
            className={`${barlowCondensed.variable} ${inter.variable} ${jetbrains.variable} ${syne.variable} ${outfit.variable} h-full antialiased`}
        >

        <body className="min-h-screen bg-background w-full">
        <NavProvider>
            {children}
        </NavProvider>
        </body>
        </html>
    );
}
