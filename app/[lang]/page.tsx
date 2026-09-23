import Image from "next/image";
import {getDictionary, Locale} from "@/app/recup-dictionnaire";
import Services from "@/app/services";
import Anm from "@/app/components/Animator3000";
import DynBg from "@/app/components/DynamicBackground";

interface Props {
    params: Promise<{ lang: Locale }>;
}

export default async function Home({params}: Props) {
    const {lang} = await params;
    const dict = await getDictionary(lang);
    const competences = Services.enrichirCompetences(dict.competences)

    return (
        <main className={"flex flex-col max-w-full overflow-x-hidden"}>
            <DynBg/>
            <div id={"intro"} className={"sm:px-16 px-4 justify-center w-full flex flex-col gap-6 min-h-screen h-screen"}>
                <Anm>
                    <h1 className={"text-5xl sm:text-9xl  font-bold sm:max-w-2/3 "}>{dict.ui.hero.titre}</h1>
                </Anm>
                <Anm delay={0.2}>
                    <p className={"sm:text-xl sm:max-w-1/2 "}>{dict.ui.hero.description}</p>
                </Anm>
            </div>

            <div id={"content"} className={"sm:px-16 px-4 w-full flex items-center justify-center gap-16 min-h-screen h-screen"}>

                <div>
                    <Anm>
                        <Image alt={"profile"} src={"/me.png"} width={500} height={500} className={"rounded-full"} />
                    </Anm>
                </div>
                <div className={"flex flex-col gap-6"}>
                    <Anm  delay={0.1}>
                        <h1 className={"text-7xl font-bold"}>{dict.ui.moi.titre}</h1>
                    </Anm>
                    <Anm  delay={0.2}>
                        <p className={"text-xl"}>{dict.ui.moi.description}</p>
                    </Anm>
                </div>

            </div>

            <div id={"code"} className={"sm:px-16 px-4 w-full flex flex-col gap-6 min-h-screen h-screen"}>
                <h1>{dict.ui.hero.titre}</h1>
            </div>

        </main>
    );
}
