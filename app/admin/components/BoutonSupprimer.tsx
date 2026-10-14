"use client";

import { useState, useTransition } from "react";
import { Bouton, MessageResultat } from "@/app/admin/components/ui";
import type { ResultatAction } from "@/app/admin/actions/utils";

/** Suppression en deux temps (confirmation explicite) pour éviter les erreurs de manipulation. */
export default function BoutonSupprimer({
    id, action, libelle,
}: { id: string; action: (id: string) => Promise<ResultatAction>; libelle: string }) {
    const [confirmation, setConfirmation] = useState(false);
    const [resultat, setResultat] = useState<ResultatAction | null>(null);
    const [enCours, demarrer] = useTransition();

    if (!confirmation) {
        return <Bouton type="button" variante="secondaire" onClick={() => setConfirmation(true)}>Supprimer</Bouton>;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Supprimer « {libelle} » définitivement ?</span>
            <Bouton
                type="button"
                variante="danger"
                disabled={enCours}
                onClick={() => demarrer(async () => setResultat(await action(id)))}
            >
                {enCours ? "Suppression…" : "Confirmer"}
            </Bouton>
            <Bouton type="button" variante="secondaire" disabled={enCours} onClick={() => setConfirmation(false)}>
                Annuler
            </Bouton>
            <MessageResultat resultat={resultat && !resultat.ok ? resultat : null} />
        </div>
    );
}
