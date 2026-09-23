import type {Metadata} from "next";
import {Syne, JetBrains_Mono, Outfit} from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";
import {NavProvider} from "@/app/context/NavContext";

const syne = Syne({
    variable: "--font-syne",
    weight: "700"
});

const jetbrains = JetBrains_Mono({
    variable: "--font-jetbrains",
    subsets: ["latin"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Maël garnier",
    description: "Mon portfolio",
};

export default function RootLayout({children}: LayoutProps<"/">) {
    return (
        <html
            lang="fr"
            className={`${syne.variable} ${jetbrains.variable} ${outfit.variable} h-full antialiased`}
        >

        <body className="min-h-screen bg-background w-full">
        <NavProvider>
            <header>
                <NavBar/>
            </header>
            {children}
        </NavProvider>

        </body>
        </html>
    );
}
