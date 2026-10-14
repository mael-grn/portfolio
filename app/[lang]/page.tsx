import Image from "next/image";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {getDictionary} from "@/app/recup-dictionnaire";
import {LOCALES, Locale, estLocale} from "@/app/lib/langues";
import {PortfolioService} from "@/app/services/PortfolioService";
import Anm from "@/app/components/Animator3000";
import DynBg from "@/app/components/DynamicBackground";
import Competences from "@/app/components/Competences";
import ResizeGroup from "@/app/components/ResizeGroup";
import {Bubble, BubbleContainer} from "@/app/components/BubbleAnimaned";
import ProjectComp from "@/app/components/ProjectComp";
import {CategorieCompetence} from "@/app/modeles/Competence";
import Timeline from "@/app/components/TimeLine";

interface Props {
    params: Promise<{ lang: string }>;
}

// Page 100 % statique : générée au build pour chaque langue, régénérée à la demande après une modification
// dans /admin (revalidatePath). Aucune requête vers la base à chaque visite. Langue inconnue => 404.
export const dynamicParams = false;

export function generateStaticParams() {
    return LOCALES.map((lang) => ({lang}));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {lang} = await params;
    if (!estLocale(lang)) return {};
    const dict = await getDictionary(lang);
    return {title: dict.meta.titre, description: dict.meta.description};
}

// Ordre d'affichage des catégories de compétences ; les catégories vides ne sont pas affichées.
const ORDRE_CATEGORIES: CategorieCompetence[] = ["web", "programmation", "bdd", "deploiement", "equipe"];

export default async function Home({params}: Props) {
    const {lang: langue} = await params;
    if (!estLocale(langue)) notFound();
    const lang: Locale = langue;

    const [dict, portfolio] = await Promise.all([getDictionary(lang), PortfolioService.recuperer(lang)]);
    const libellesProjet = {details: dict.projets.details, present: dict.parcours.present};

    return (
        <main className={"flex flex-col max-w-full"}>
            <DynBg/>
            <div id={"intro"} className={"sm:px-16 px-4 justify-end pb-28 w-full flex flex-col gap-6 min-h-screen h-screen"}>
                <Anm>
                    <h1 className={"text-5xl sm:text-9xl  font-bold sm:max-w-2/3 "}>{dict.ui.hero.titre}</h1>
                </Anm>
                <Anm delay={0.2}>
                    <p className={"sm:text-xl sm:max-w-1/2 "}>{dict.ui.hero.description}</p>
                </Anm>
            </div>

            <div id={"content"} className={"sm:px-16 py-5 sm:py-16 px-4 w-full flex sm:flex-row flex-col items-center justify-center gap-16"}>

                <div>
                    <Anm scale={0}>
                        <Image alt={"profile"} src={"/me.png"} width={500} height={500} className={" rounded-full"} />
                    </Anm>
                </div>
                <div className={"flex flex-col gap-6"}>
                    <Anm  delay={0.1}>
                        <h1 className={"sm:text-7xl text-4xl font-bold"}>{dict.ui.moi.titre}</h1>
                    </Anm>

                    <Anm  delay={0.2}>
                        <p className={"text-xl"}>{dict.ui.moi.description}</p>
                    </Anm>
                </div>

            </div>

            <div id={"code"} className={"sm:px-16 py-5 sm:py-16 mt-32 px-4 w-full flex flex-col gap-10 sm:gap-32"}>
                <Anm delay={0.1}>
                    <h2 className={"text-background sm:text-5xl text-2xl text-center font-bold"}>{dict.dev.titre}</h2>
                </Anm>

                <div className={"flex gap-12 justify-center sm:flex-row flex-col items-center w-full"}>

                    <Anm scale={0} y={0}>
                        <BubbleContainer className={"w-72 h-72"}>
                            <Bubble size={100}>
                                <Image
                                    src={"/gemini.webp"}
                                    alt={"gemini"}
                                    width={100}
                                    height={100}
                                    className={"pointer-events-none select-none rounded-full object-cover"}
                                />
                            </Bubble>
                            <Bubble size={100}>
                                <Image
                                    src={"/claude.webp"}
                                    alt={"claude"}
                                    width={100}
                                    height={100}
                                    className={"pointer-events-none select-none rounded-full object-cover"}
                                />
                            </Bubble>
                            <Bubble size={100}>
                                <Image
                                    src={"/chatgpt.jpg"}
                                    alt={"gpt"}
                                    width={100}
                                    height={100}
                                    className={"pointer-events-none select-none rounded-full object-cover"}
                                />
                            </Bubble>
                        </BubbleContainer>
                    </Anm>

                    <Anm y={0} scale={0} delay={0.2}>
                        <code className={"text-9xl"}>
                            +
                        </code>
                    </Anm>


                    <Anm scale={0} y={0} delay={0.2}>
                        <Image alt={"profile"} src={"/me.png"} width={500} height={500} className={"object-contain w-72 h-72 rounded-full"} />
                    </Anm>
                </div>
            </div>

            <div id={"code"} className={"sm:px-16 py-5 sm:py-16 mt-32 px-4 w-full flex flex-col gap-6"}>
                <Anm>
                    <h1 className={"text-background text-2xl sm:text-5xl"}>{dict.competences.titre}</h1>
                </Anm>
                <div className={"flex flex-col gap-0 p-2 rounded-lg bg-foreground"}>
                    <ResizeGroup>
                        {ORDRE_CATEGORIES.map((categorie) => {
                            const elements = portfolio.competences.filter((c) => c.categorie === categorie);
                            return elements.length > 0 && (
                                <Competences key={categorie} titre={dict.competences.categories[categorie]} elements={elements}/>
                            );
                        })}
                    </ResizeGroup>
                </div>
            </div>

            <div id={"code"} className={"sm:px-16 py-5 sm:py-16 mt-32 px-4 w-full flex flex-col gap-6"}>
                <Anm>
                    <h1 className={"text-background text-2xl sm:text-5xl"}>{dict.projets.titre}</h1>
                </Anm>

            <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-3 z-10"}>
                {portfolio.projets.map((projet, index) => (
                    <div key={projet.id} className={`grid ${projet.taille === 4 ? "lg:col-span-2" : projet.taille === 3 ? "sm:col-span-2" : ""}`}>
                        <ProjectComp p={projet} lang={lang} labels={libellesProjet} delay={(index % 3) * 0.1}/>
                    </div>
                ))}
            </div>

            </div>

            <div id={"code"} className={"sm:px-16 py-5 sm:py-16 mt-32 px-4 w-full flex flex-col gap-6"}>
                <Anm>
                    <h1 className={"text-background text-2xl sm:text-5xl"}>{dict.parcours.titre}</h1>
                </Anm>

                <Timeline elements={portfolio.experiences} lang={lang} presentLabel={dict.parcours.present}/>

            </div>

        </main>
    );
}
