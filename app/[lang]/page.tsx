import Image from "next/image";
import {getDictionary, Locale} from "@/app/recup-dictionnaire";
import Services from "@/app/services";
import Anm from "@/app/components/Animator3000";
import DynBg from "@/app/components/DynamicBackground";
import Competences from "@/app/components/Competences";
import LayoutContainer from "@/app/components/LayoutContainer";
import ResizeGroup from "@/app/components/ResizeGroup";

interface Props {
    params: Promise<{ lang: Locale }>;
}

export default async function Home({params}: Props) {
    const {lang} = await params;
    const dict = await getDictionary(lang);

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

            <div id={"code"} className={"sm:px-16 py-5 sm:py-16 mt-32 px-4 w-full flex flex-col gap-10 sm:gap-16"}>
                <Anm>
                    <h1 className={"text-background text-4xl sm:text-7xl"}>{dict.competences.titre}</h1>
                </Anm>
                <ResizeGroup>
                    <Competences titre={dict.competences.web.titre} elements={dict.competences.web.liste}/>
                    <Competences titre={dict.competences.programmation.titre} elements={dict.competences.programmation.liste}/>
                    <Competences titre={dict.competences.bdd.titre} elements={dict.competences.bdd.liste}/>
                    <Competences titre={dict.competences.deploiement.titre} elements={dict.competences.deploiement.liste}/>

                </ResizeGroup>

            </div>

            <div id={"code"} className={"sm:px-16 py-5 sm:py-16 mt-32 px-4 w-full flex flex-col gap-10 sm:gap-16"}>
                <Anm>
                    <h1 className={"text-background text-4xl sm:text-7xl"}>{dict.competences.titre}</h1>
                </Anm>
                <ResizeGroup>
                    <Competences titre={dict.competences.web.titre} elements={dict.competences.web.liste}/>
                    <Competences titre={dict.competences.programmation.titre} elements={dict.competences.programmation.liste}/>
                    <Competences titre={dict.competences.bdd.titre} elements={dict.competences.bdd.liste}/>
                    <Competences titre={dict.competences.deploiement.titre} elements={dict.competences.deploiement.liste}/>

                </ResizeGroup>

            </div>

        </main>
    );
}
