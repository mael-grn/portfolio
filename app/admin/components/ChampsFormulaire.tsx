"use client";

import {
    ReactNode,
    useState,
    useRef,
    useEffect,
    ChangeEvent,
    InputHTMLAttributes,
    TextareaHTMLAttributes,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    ChevronDownIcon,
    CheckIcon,
    ArrowUpTrayIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
} from "@heroicons/react/20/solid";
import { televerserMediaAction } from "@/app/admin/actions/medias";
import { LoaderAdmin } from "@/app/admin/components/BoutonAdmin";
import { DossierMedia } from "@/app/lib/media";

interface ErreurProps {
    erreur?: string;
}

/** Composant d'erreur animé avec Framer Motion. */
function MessageErreurAnime({ erreur }: ErreurProps) {
    return (
        <AnimatePresence>
            {erreur && (
                <motion.span
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs font-sans font-medium text-red-600 block mt-1"
                >
                    {erreur}
                </motion.span>
            )}
        </AnimatePresence>
    );
}

/* =========================================================================
   1. ChampSaisie (Input texte, date, nombre, couleur...)
   ========================================================================= */

export interface ChampSaisieProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    label: string;
    erreur?: string;
    icone?: ReactNode;
    description?: string;
}

export function ChampSaisie({
    label,
    erreur,
    icone,
    description,
    className = "",
    type = "text",
    ...props
}: ChampSaisieProps) {
    const [estActif, setEstActif] = useState(false);

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="flex items-center justify-between text-sm font-sans font-medium text-foreground">
                <span>{label}</span>
                {props.required && (
                    <span className="text-[11px] font-mono text-primary/80 uppercase tracking-wider">
                        Requis
                    </span>
                )}
            </label>

            {description && (
                <span className="text-xs font-sans text-muted-rock">{description}</span>
            )}

            <motion.div
                animate={{
                    borderColor: erreur
                        ? "#dc2626"
                        : estActif
                        ? "#385c7a"
                        : "rgba(0, 0, 0, 0.15)",
                    boxShadow: estActif
                        ? "0 0 0 3px rgba(56, 92, 122, 0.15)"
                        : "0 1px 2px rgba(0, 0, 0, 0.03)",
                }}
                whileHover={{
                    borderColor: erreur
                        ? "#dc2626"
                        : estActif
                        ? "#385c7a"
                        : "rgba(0, 0, 0, 0.28)",
                }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex items-center w-full rounded-[10px] bg-white border overflow-hidden ${
                    type === "color" ? "p-1.5" : "px-3.5 py-2.5"
                } ${className}`}
            >
                {icone && <div className="mr-2 text-foreground/50 shrink-0">{icone}</div>}

                <input
                    type={type}
                    onFocus={() => setEstActif(true)}
                    onBlur={() => setEstActif(false)}
                    className={`w-full bg-transparent text-sm font-sans text-foreground placeholder:text-foreground/35 focus:outline-none ${
                        type === "color" ? "h-9 cursor-pointer rounded-[6px]" : ""
                    }`}
                    {...props}
                />
            </motion.div>

            <MessageErreurAnime erreur={erreur} />
        </div>
    );
}

/* =========================================================================
   2. ChampZoneTexte (Textarea multiline)
   ========================================================================= */

export interface ChampZoneTexteProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    erreur?: string;
    description?: string;
}

export function ChampZoneTexte({
    label,
    erreur,
    description,
    className = "",
    rows = 4,
    ...props
}: ChampZoneTexteProps) {
    const [estActif, setEstActif] = useState(false);

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="flex items-center justify-between text-sm font-sans font-medium text-foreground">
                <span>{label}</span>
                {props.required && (
                    <span className="text-[11px] font-mono text-primary/80 uppercase tracking-wider">
                        Requis
                    </span>
                )}
            </label>

            {description && (
                <span className="text-xs font-sans text-muted-rock">{description}</span>
            )}

            <motion.div
                animate={{
                    borderColor: erreur
                        ? "#dc2626"
                        : estActif
                        ? "#385c7a"
                        : "rgba(0, 0, 0, 0.15)",
                    boxShadow: estActif
                        ? "0 0 0 3px rgba(56, 92, 122, 0.15)"
                        : "0 1px 2px rgba(0, 0, 0, 0.03)",
                }}
                whileHover={{
                    borderColor: erreur
                        ? "#dc2626"
                        : estActif
                        ? "#385c7a"
                        : "rgba(0, 0, 0, 0.28)",
                }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex w-full rounded-[10px] bg-white border px-3.5 py-2.5 overflow-hidden ${className}`}
            >
                <textarea
                    rows={rows}
                    onFocus={() => setEstActif(true)}
                    onBlur={() => setEstActif(false)}
                    className="w-full bg-transparent text-sm font-sans text-foreground placeholder:text-foreground/35 focus:outline-none resize-y"
                    {...props}
                />
            </motion.div>

            <MessageErreurAnime erreur={erreur} />
        </div>
    );
}

/* =========================================================================
   3. ChampSelection (Menu déroulant / Custom Dropdown animé)
   ========================================================================= */

export interface OptionSelection {
    valeur: string | number;
    libelle: string;
}

export interface ChampSelectionProps {
    label: string;
    name: string;
    options: OptionSelection[];
    valeurParDefaut?: string | number;
    valeur?: string | number;
    onChanger?: (valeur: string | number) => void;
    erreur?: string;
    description?: string;
    className?: string;
}

export function ChampSelection({
    label,
    name,
    options,
    valeurParDefaut,
    valeur: valeurProp,
    onChanger,
    erreur,
    description,
    className = "",
}: ChampSelectionProps) {
    const [valeurInterne, setValeurInterne] = useState<string | number>(
        valeurParDefaut ?? options[0]?.valeur ?? ""
    );
    const [ouvert, setOuvert] = useState(false);
    const conteneurRef = useRef<HTMLDivElement>(null);
    const listeRef = useRef<HTMLDivElement>(null);

    const hauteurEstimee = Math.min(Math.max(options.length * 40 + 12, 42), 260);
    const [hauteurListe, setHauteurListe] = useState<number>(hauteurEstimee);

    const valeurSelectionnee = valeurProp !== undefined ? valeurProp : valeurInterne;

    // Mesure dynamique et précise de la hauteur réelle de la liste des options
    useEffect(() => {
        const el = listeRef.current;
        if (!el) return;

        const majHauteur = () => {
            const h = el.scrollHeight;
            if (h > 0) {
                setHauteurListe(h);
            }
        };

        majHauteur();

        const observer = new ResizeObserver(() => {
            majHauteur();
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, [options]);

    // Fermeture propre au clic extérieur
    useEffect(() => {
        function handlePointerDown(e: MouseEvent) {
            if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
                setOuvert(false);
            }
        }
        if (ouvert) {
            document.addEventListener("mousedown", handlePointerDown);
        }
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, [ouvert]);

    // Fermeture via la touche Échap
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setOuvert(false);
            }
        }
        if (ouvert) {
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [ouvert]);

    const optionCourante = options.find((o) => String(o.valeur) === String(valeurSelectionnee));
    const hauteurCible = Math.min(Math.max(hauteurListe, 42), 260);

    function choisirOption(val: string | number) {
        if (valeurProp === undefined) {
            setValeurInterne(val);
        }
        setOuvert(false);
        onChanger?.(val);
    }

    return (
        <div ref={conteneurRef} className={`flex flex-col gap-1.5 w-full ${className}`}>
            {/* Input caché garantissant la compatibilité intégrale avec FormData / Server Actions */}
            <input type="hidden" name={name} value={valeurSelectionnee} />

            <label className="text-sm font-sans font-medium text-foreground select-none">
                {label}
            </label>

            {description && (
                <span className="text-xs font-sans text-muted-rock">{description}</span>
            )}

            {/* Le conteneur du dropdown qui se déploie lui-même dans le flux (in-flow, zéro outline) */}
            <motion.div
                animate={{
                    height: ouvert ? hauteurCible : 42,
                    borderColor: erreur
                        ? "#dc2626"
                        : ouvert
                        ? "#385c7a"
                        : "rgba(0, 0, 0, 0.15)",
                    boxShadow: ouvert
                        ? "0 6px 20px -2px rgba(43, 69, 91, 0.12), 0 0 0 1px rgba(56, 92, 122, 0.2)"
                        : "0 1px 2px rgba(0, 0, 0, 0.03)",
                }}
                whileHover={{
                    borderColor: erreur
                        ? "#dc2626"
                        : ouvert
                        ? "#385c7a"
                        : "rgba(0, 0, 0, 0.28)",
                }}
                transition={{
                    height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                    borderColor: { duration: 0.18 },
                    boxShadow: { duration: 0.2 },
                }}
                className="relative w-full rounded-[12px] bg-white border overflow-hidden select-none"
            >
                {/* 1. État compact fermé : affiche l'option courante avec chevron */}
                <motion.button
                    type="button"
                    onClick={() => setOuvert(true)}
                    tabIndex={ouvert ? -1 : 0}
                    animate={{
                        opacity: ouvert ? 0 : 1,
                        pointerEvents: ouvert ? "none" : "auto",
                    }}
                    transition={{
                        opacity: { duration: 0.15, delay: ouvert ? 0 : 0.1 },
                    }}
                    className="absolute top-0 left-0 right-0 h-[42px] px-3.5 flex items-center justify-between text-left text-sm font-sans text-foreground cursor-pointer focus:outline-none"
                >
                    <span className="truncate font-medium text-foreground">
                        {optionCourante ? optionCourante.libelle : "Sélectionner..."}
                    </span>

                    <motion.div
                        animate={{ rotate: ouvert ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="ml-2 text-foreground/50 shrink-0"
                    >
                        <ChevronDownIcon className="w-4 h-4" />
                    </motion.div>
                </motion.button>

                {/* 2. État étendu ouvert : le conteneur s'étend et révèle directement la liste des options */}
                <motion.div
                    ref={listeRef}
                    animate={{
                        opacity: ouvert ? 1 : 0,
                        pointerEvents: ouvert ? "auto" : "none",
                    }}
                    transition={{
                        opacity: { duration: 0.2, delay: ouvert ? 0.06 : 0 },
                    }}
                    className="w-full p-1.5 flex flex-col gap-1 max-h-64 overflow-y-auto bg-white"
                >
                    {options.map((opt) => {
                        const estSelectionne = String(opt.valeur) === String(valeurSelectionnee);
                        return (
                            <motion.button
                                key={opt.valeur}
                                type="button"
                                onClick={() => choisirOption(opt.valeur)}
                                tabIndex={ouvert ? 0 : -1}
                                whileHover={
                                    estSelectionne
                                        ? {}
                                        : { backgroundColor: "rgba(56, 92, 122, 0.08)", x: 2 }
                                }
                                whileTap={{ scale: 0.985 }}
                                transition={{ duration: 0.12 }}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-[8px] text-sm font-sans text-left cursor-pointer focus:outline-none ${
                                    estSelectionne
                                        ? "bg-[#2b455b] text-white font-semibold shadow-xs"
                                        : "text-foreground/80"
                                }`}
                            >
                                <span className="truncate">{opt.libelle}</span>
                                {estSelectionne && (
                                    <CheckIcon className="w-4 h-4 text-white shrink-0 ml-2" />
                                )}
                            </motion.button>
                        );
                    })}
                </motion.div>
            </motion.div>

            <MessageErreurAnime erreur={erreur} />
        </div>
    );
}

/* =========================================================================
   4. ChampImage (Téléversement direct d'image avec prévisualisation et loader)
   ========================================================================= */

export interface ChampImageProps {
    label: string;
    name: string;
    dossier?: DossierMedia;
    referenceInitiale?: string | null;
    urlInitiale?: string | null;
    onTeleversementChange?: (enCours: boolean) => void;
    onChangerChemin?: (chemin: string | null) => void;
    erreur?: string;
    description?: string;
    className?: string;
}

export function ChampImage({
    label,
    name,
    dossier = "competences",
    referenceInitiale,
    urlInitiale,
    onTeleversementChange,
    onChangerChemin,
    erreur,
    description,
    className = "",
}: ChampImageProps) {
    const [prevRef, setPrevRef] = useState(referenceInitiale);
    const [chemin, setChemin] = useState<string | null>(referenceInitiale ?? null);
    const [urlAffichee, setUrlAffichee] = useState<string | null>(urlInitiale ?? null);
    const [nomFichier, setNomFichier] = useState<string | null>(() => {
        if (referenceInitiale) {
            return referenceInitiale.split("/").pop() ?? referenceInitiale;
        }
        return null;
    });
    const [enTeleversement, setEnTeleversement] = useState(false);
    const [erreurUpload, setErreurUpload] = useState<string | null>(null);
    const [estEnSurvol, setEstEnSurvol] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Synchronisation déterministe lors du changement de référence sans effet en cascade
    if (referenceInitiale !== prevRef) {
        setPrevRef(referenceInitiale);
        setChemin(referenceInitiale ?? null);
        setUrlAffichee(urlInitiale ?? null);
        setNomFichier(referenceInitiale ? referenceInitiale.split("/").pop() ?? referenceInitiale : null);
    }

    async function traiterFichier(fichier: File) {
        setErreurUpload(null);

        // Prévisualisation locale immédiate dans l'input
        const urlTemp = URL.createObjectURL(fichier);
        setUrlAffichee(urlTemp);
        setNomFichier(fichier.name);
        setEnTeleversement(true);
        onTeleversementChange?.(true);

        try {
            const formData = new FormData();
            formData.append("fichier", fichier);
            formData.append("dossier", dossier);

            const res = await televerserMediaAction(formData);
            if (res.succes && res.chemin) {
                setChemin(res.chemin);
                if (res.url) setUrlAffichee(res.url);
                if (res.nomFichier) setNomFichier(res.nomFichier);
                onChangerChemin?.(res.chemin);
            } else {
                setErreurUpload(res.erreur ?? "Erreur lors du téléversement.");
                setChemin(referenceInitiale ?? null);
                setUrlAffichee(urlInitiale ?? null);
                setNomFichier(referenceInitiale ? referenceInitiale.split("/").pop() ?? referenceInitiale : null);
            }
        } catch (err) {
            console.error("Erreur téléversement:", err);
            setErreurUpload("Échec de la communication avec le serveur.");
            setChemin(referenceInitiale ?? null);
            setUrlAffichee(urlInitiale ?? null);
            setNomFichier(referenceInitiale ? referenceInitiale.split("/").pop() ?? referenceInitiale : null);
        } finally {
            setEnTeleversement(false);
            onTeleversementChange?.(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const fichier = e.target.files?.[0];
        if (fichier) traiterFichier(fichier);
    }

    function supprimerImage() {
        setChemin(null);
        setUrlAffichee(null);
        setNomFichier(null);
        setErreurUpload(null);
        onChangerChemin?.(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    // Détection si l'image actuelle diffère de la référence sauvegardée en base
    const estDifferentDeReference = chemin !== (referenceInitiale ?? null);
    const estSuppressionPrevue = Boolean(referenceInitiale && !chemin);

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {/* Input caché garantissant la transmission du chemin d'accès lors de la soumission du formulaire */}
            <input type="hidden" name={name} value={chemin ?? ""} />

            <label className="text-sm font-sans font-medium text-foreground select-none">
                {label}
            </label>

            {description && (
                <span className="text-xs font-sans text-muted-rock">{description}</span>
            )}

            {/* Input fichier masqué déclenché au clic */}
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleChange}
                disabled={enTeleversement}
                className="sr-only"
            />

            {/* Conteneur de l'input d'image */}
            {urlAffichee ? (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setEstEnSurvol(true);
                    }}
                    onDragLeave={() => setEstEnSurvol(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setEstEnSurvol(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) traiterFichier(f);
                    }}
                    className={`relative flex items-center justify-between gap-3 w-full rounded-[12px] bg-white border p-3 select-none ${
                        estEnSurvol ? "border-primary bg-primary/5" : "border-hairline/70"
                    }`}
                >
                    <div className="flex items-center gap-3.5 min-w-0">
                        {/* Vignette de l'image avec opacité et loader en superposition */}
                        <div className="relative w-14 h-14 rounded-[10px] bg-foreground/[0.04] border border-hairline/40 flex items-center justify-center overflow-hidden shrink-0">
                            {/* L'image elle-même avec baisse d'opacité pendant l'importation */}
                            <motion.div
                                animate={{
                                    opacity: enTeleversement ? 0.35 : 1,
                                    scale: enTeleversement ? 0.92 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                                className="relative w-full h-full flex items-center justify-center p-1.5"
                            >
                                <Image
                                    src={urlAffichee}
                                    alt={nomFichier ?? "Image importée"}
                                    fill
                                    unoptimized
                                    className="object-contain p-1"
                                />
                            </motion.div>

                            {/* Loader Framer Motion centré au-dessus de l'image pendant le téléversement */}
                            <AnimatePresence>
                                {enTeleversement && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]"
                                    >
                                        <LoaderAdmin taille="w-6 h-6" couleur="text-[#2b455b]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Informations textuelles */}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-sans font-medium text-foreground truncate max-w-xs sm:max-w-sm">
                                {nomFichier}
                            </span>
                            <span className="text-xs font-sans text-muted-rock flex items-center gap-1.5 mt-0.5">
                                {enTeleversement ? (
                                    <span className="text-[#385c7a] font-medium">
                                        Importation en cours vers le stockage...
                                    </span>
                                ) : (
                                    <span>
                                        {estDifferentDeReference
                                            ? "Image importée (non enregistrée)"
                                            : "Image enregistrée"}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Actions de remplacement ou suppression */}
                    {!enTeleversement && (
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="px-3 py-1.5 text-xs font-sans font-medium rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground/85 border border-hairline/40 cursor-pointer"
                            >
                                Remplacer
                            </button>
                            <button
                                type="button"
                                onClick={supprimerImage}
                                className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/15 text-red-600 border border-red-500/20 cursor-pointer"
                                title="Supprimer cette image"
                                aria-label="Supprimer cette image"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <motion.div
                    whileHover={{
                        borderColor: "rgba(56, 92, 122, 0.45)",
                        backgroundColor: "rgba(56, 92, 122, 0.02)",
                    }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setEstEnSurvol(true);
                    }}
                    onDragLeave={() => setEstEnSurvol(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setEstEnSurvol(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) traiterFichier(f);
                    }}
                    className={`relative flex items-center justify-between gap-3 w-full rounded-[12px] bg-white border border-dashed px-4 py-3 cursor-pointer select-none ${
                        estEnSurvol ? "border-primary bg-primary/5" : "border-hairline/70"
                    }`}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#2b455b]/10 text-[#2b455b] flex items-center justify-center shrink-0">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-sans font-medium text-foreground/80 truncate">
                                Choisir ou glisser une image...
                            </span>
                            <span className="text-xs font-sans text-muted-rock">
                                PNG, JPEG, WebP, GIF ou SVG (4 Mo max)
                            </span>
                        </div>
                    </div>

                    <span className="text-xs font-sans font-medium px-3 py-1.5 rounded-full bg-foreground/5 text-foreground/75 border border-hairline/40 shrink-0">
                        Parcourir
                    </span>
                </motion.div>
            )}

            {/* Avertissement rouge en cas de divergence avec la référence enregistrée */}
            <AnimatePresence>
                {estDifferentDeReference && !enTeleversement && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-red-500/10 border border-red-500/25 text-xs font-sans font-medium text-red-600 mt-1"
                    >
                        <ExclamationTriangleIcon className="w-4 h-4 shrink-0 text-red-500" />
                        <span>
                            {estSuppressionPrevue
                                ? "L'image actuelle sera définitivement supprimée lors de l'enregistrement."
                                : "Image différente de la référence enregistrée. Cliquez sur le bouton d'action pour valider le changement et supprimer l'ancienne."}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <MessageErreurAnime erreur={erreurUpload ?? erreur} />
        </div>
    );
}

/* =========================================================================
   5. ChampFichier (Saisie de fichier stylisée avec prévisualisation)
   ========================================================================= */

export interface ChampFichierProps {
    label: string;
    name: string;
    accept?: string;
    erreur?: string;
    description?: string;
    multiple?: boolean;
    className?: string;
}

export function ChampFichier({
    label,
    name,
    accept,
    erreur,
    description,
    multiple = false,
    className = "",
}: ChampFichierProps) {
    const [nomFichier, setNomFichier] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const fichiers = e.target.files;
        if (!fichiers || fichiers.length === 0) {
            setNomFichier(null);
            return;
        }
        if (fichiers.length === 1) {
            setNomFichier(fichiers[0].name);
        } else {
            setNomFichier(`${fichiers.length} fichiers sélectionnés`);
        }
    }

    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            <label className="text-sm font-sans font-medium text-foreground select-none">
                {label}
            </label>

            {description && (
                <span className="text-xs font-sans text-muted-rock">{description}</span>
            )}

            <motion.div
                whileHover={{ borderColor: "rgba(56, 92, 122, 0.45)", backgroundColor: "rgba(56, 92, 122, 0.02)" }}
                whileTap={{ scale: 0.995 }}
                onClick={() => inputRef.current?.click()}
                className="relative flex items-center justify-between gap-3 w-full rounded-[10px] bg-white border border-dashed border-hairline/70 px-4 py-3 cursor-pointer select-none"
            >
                <input
                    ref={inputRef}
                    type="file"
                    name={name}
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="sr-only"
                />

                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#2b455b]/10 text-[#2b455b] flex items-center justify-center shrink-0">
                        <ArrowUpTrayIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-sans text-foreground/80 truncate">
                        {nomFichier ?? (multiple ? "Choisir des fichiers..." : "Choisir un fichier...")}
                    </span>
                </div>

                <span className="text-xs font-sans font-medium px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/75 border border-hairline/40 shrink-0">
                    Parcourir
                </span>
            </motion.div>

            <MessageErreurAnime erreur={erreur} />
        </div>
    );
}
