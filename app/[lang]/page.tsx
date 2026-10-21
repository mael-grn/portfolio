import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/recup-dictionnaire";
import { LOCALES, Locale, estLocale } from "@/app/lib/langues";
import { PortfolioService } from "@/app/services/PortfolioService";
import ZoomLensNav from "@/app/components/ZoomLensNav";
import HeroAboutScrolly from "@/app/components/HeroAboutScrolly";
import ExperiencesSection from "@/app/components/ExperiencesSection";
import FooterSection from "@/app/components/FooterSection";

interface Props {
    params: Promise<{ lang: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
    return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    if (!estLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return {
        title: dict.meta.titre,
        description: dict.meta.description,
    };
}

export default async function Home({ params }: Props) {
    const { lang: langue } = await params;
    if (!estLocale(langue)) notFound();
    const lang: Locale = langue;

    const [dict, portfolio] = await Promise.all([
        getDictionary(lang),
        PortfolioService.recuperer(lang),
    ]);

    const competencesAgentiques = portfolio.competences.filter(
        (c) => c.categorie === "agentique"
    );

    return (
        <main className="flex flex-col w-full min-h-screen bg-background">
            {/* Navigation latérale Zoom Lens style getartcraft.com */}
            <ZoomLensNav
                apercuLabel={dict.nav.apercu}
                aProposLabel={dict.nav.aPropos}
                visionLabel={dict.nav.vision}
                competencesLabel={dict.nav.competences}
                projetsLabel={dict.nav.projets}
                parcoursLabel={dict.nav.parcours}
            />

            {/* Séquence cinématique unifiée : Hero, Profil, Vision, Compétences et Projets (5 Actes) */}
            <HeroAboutScrolly
                heroTitre={dict.ui.hero.titre}
                heroDescription={dict.ui.hero.description}
                aboutTitre={dict.ui.moi.titre}
                aboutDescription={dict.ui.moi.description}
                devTitre={dict.dev.titre}
                devDescription={dict.dev.description}
                competencesTitre={dict.competences.titre}
                competencesBadge={dict.competences.badge}
                competencesEnSavoirPlus={dict.competences.cliquerPourEnSavoirPlus}
                competencesDict={dict.competences}
                competences={portfolio.competences}
                competencesAgentiques={competencesAgentiques}
                projetsTitre={dict.projets.titre}
                projetsEnCoursLabel={dict.projets.enCours}
                projetsDict={dict.projets}
                projets={portfolio.projets}
            />

            {/* Section 6 : Parcours chronologique et expériences */}
            <ExperiencesSection
                titre={dict.parcours.titre}
                badge={dict.parcours.badge}
                presentLabel={dict.parcours.present}
                jalonsLabel={dict.parcours.jalonsRealises}
                experiences={portfolio.experiences}
            />

            {/* Section 7 : Footer sombre compact */}
            <FooterSection
                role={dict.footer.role}
                githubLabel={dict.footer.github}
                linkedinLabel={dict.footer.linkedin}
                contactLabel={dict.footer.contact}
                adminLabel={dict.footer.admin}
                signature={dict.footer.signature}
            />
        </main>
    );
}
