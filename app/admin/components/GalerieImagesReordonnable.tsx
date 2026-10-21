"use client";

import { useState } from "react";
import Image from "next/image";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { LoaderAdmin } from "@/app/admin/components/BoutonAdmin";
import { estSvg } from "@/app/lib/media";

export interface ElementGalerieImage {
    chemin: string;
    url: string;
    enTeleversement?: boolean;
    idTemp?: string;
}

export interface GalerieImagesReordonnableProps {
    images: ElementGalerieImage[];
    onReordonner: (images: ElementGalerieImage[]) => void;
    onSupprimer: (image: ElementGalerieImage) => void;
    name?: string;
    className?: string;
}

function CarteImageProjet({
    image,
    index,
    name,
    onSupprimer,
}: {
    image: ElementGalerieImage;
    index: number;
    name: string;
    onSupprimer: (image: ElementGalerieImage) => void;
}) {
    const [estSurvole, setEstSurvole] = useState(false);
    const cle = image.idTemp ?? image.chemin;

    return (
        <Reorder.Item
            value={image}
            id={cle}
            dragListener={!image.enTeleversement}
            onMouseEnter={() => setEstSurvole(true)}
            onMouseLeave={() => setEstSurvole(false)}
            whileDrag={{
                scale: 1.02,
                boxShadow: "0 14px 32px -4px rgba(43, 69, 91, 0.28), 0 0 0 2px #385c7a",
                zIndex: 50,
            }}
            transition={{ duration: 0.2 }}
            className="group relative w-full h-36 sm:h-40 rounded-[14px] bg-white border border-hairline/70 overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-2xs"
        >
            {/* Input caché pour transmettre la présence et l'ordre des images conservées */}
            {image.chemin && !image.enTeleversement && (
                <input type="hidden" name={name} value={image.chemin} />
            )}

            {/* Conteneur image 100% transparent aux clics : toute la zone de l'image est attrapable pour le drag */}
            <div className="relative w-full h-full bg-foreground/[0.03] pointer-events-none select-none">
                <motion.div
                    animate={{
                        opacity: image.enTeleversement ? 0.35 : 1,
                        scale: image.enTeleversement ? 0.94 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full h-full pointer-events-none select-none"
                >
                    <Image
                        src={image.url}
                        alt={`Capture ${index + 1} du projet`}
                        fill
                        draggable={false}
                        unoptimized={image.chemin ? estSvg(image.chemin) : true}
                        className="object-contain p-2 pointer-events-none select-none"
                    />
                </motion.div>
            </div>

            {/* Indicateur d'ordre dynamique (#1, #2, etc.) */}
            <div className="pointer-events-none select-none absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-white font-semibold shadow-xs">
                #{index + 1}
            </div>

            {/* Loader rotatif centré pendant l'importation */}
            {image.enTeleversement && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-20 pointer-events-none select-none">
                    <LoaderAdmin taille="w-7 h-7" couleur="text-[#2b455b]" />
                </div>
            )}

            {/* Croix de suppression en haut à droite :
                - Apparaît UNIQUEMENT au survol de l'élément carte
                - Ne devient rouge qu'au survol de la croix elle-même
            */}
            <AnimatePresence>
                {estSurvole && !image.enTeleversement && (
                    <motion.button
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSupprimer(image);
                        }}
                        whileHover={{ scale: 1.15, backgroundColor: "#dc2626" }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-black/65 text-white flex items-center justify-center cursor-pointer shadow-md focus:outline-none"
                        title="Supprimer cette capture"
                        aria-label="Supprimer cette capture"
                    >
                        <XMarkIcon className="w-4 h-4 stroke-2" />
                    </motion.button>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
}

/**
 * Galerie d'images réordonnable par drag and drop fluide avec Framer Motion (Reorder.Group).
 * Toute la surface de l'image peut être attrapée pour le réordonnancement.
 * La croix de suppression n'apparaît qu'au survol de l'élément, et ne devient rouge qu'au survol de la croix.
 */
export default function GalerieImagesReordonnable({
    images,
    onReordonner,
    onSupprimer,
    name = "imagesConservees",
    className = "",
}: GalerieImagesReordonnableProps) {
    if (images.length === 0) return null;

    return (
        <Reorder.Group
            axis="y"
            values={images}
            onReorder={onReordonner}
            className={`flex flex-col gap-3 w-full ${className}`}
        >
            {images.map((image, index) => (
                <CarteImageProjet
                    key={image.idTemp ?? image.chemin}
                    image={image}
                    index={index}
                    name={name}
                    onSupprimer={onSupprimer}
                />
            ))}
        </Reorder.Group>
    );
}
