"use client";

import { useEffect, useState, useTransition } from "react";
import { TrashIcon } from "@heroicons/react/20/solid";
import type { ResultatAction } from "@/app/admin/actions/utils";
import BoutonAdmin from "@/app/admin/components/BoutonAdmin";

interface BoutonSupprimerProps {
    id: string;
    action: (id: string) => Promise<ResultatAction>;
    libelle?: string;
    onSupprime?: () => void;
}

/** Suppression en deux temps (confirmation explicite) pour sécuriser les opérations critiques. */
export default function BoutonSupprimer({
    id,
    action,
    onSupprime,
}: BoutonSupprimerProps) {
    const [confirmation, setConfirmation] = useState(false);
    const [resultat, setResultat] = useState<ResultatAction | null>(null);
    const [enCours, demarrer] = useTransition();

    useEffect(() => {
        if (!confirmation) return;
        const timer = setTimeout(() => {
            setConfirmation(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, [confirmation]);

    function handleClick() {
        if (!confirmation) {
            setConfirmation(true);
            return;
        }

        demarrer(async () => {
            const res = await action(id);
            setResultat(res);
            if (res.ok && onSupprime) {
                onSupprime();
            }
        });
    }

    return (
        <div className="inline-flex items-center gap-2">
            <BoutonAdmin
                type="button"
                variante="danger"
                chargement={enCours}
                icone={<TrashIcon className="w-4 h-4" />}
                texte={enCours ? "Suppression…" : confirmation ? "Confirmer" : "Supprimer"}
                onClick={handleClick}
            />
            {resultat && !resultat.ok && (
                <span className="text-xs font-sans font-medium text-red-600">
                    {resultat.message}
                </span>
            )}
        </div>
    );
}
