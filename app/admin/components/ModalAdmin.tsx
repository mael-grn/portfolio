"use client";

import TiroirAdmin, { TiroirAdminProps } from "@/app/admin/components/TiroirAdmin";

export type ModalAdminProps = TiroirAdminProps;

/**
 * @deprecated Utiliser TiroirAdmin à la place.
 * Maintient la compatibilité descendante en redirigeant vers le menu latéral TiroirAdmin.
 */
export default function ModalAdmin(props: TiroirAdminProps) {
    return <TiroirAdmin {...props} />;
}
