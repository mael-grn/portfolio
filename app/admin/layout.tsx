import type { Metadata } from "next";
import { ReactNode } from "react";
import AdminNav from "@/app/admin/components/AdminNav";
import AdminMotionProvider from "@/app/admin/components/AdminMotionProvider";

export const metadata: Metadata = {
    title: "Portail Admin — Maël Garnier",
    robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminMotionProvider>
            <AdminNav />
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 pt-24 pb-12 sm:px-8 sm:pt-28">
                {children}
            </div>
        </AdminMotionProvider>
    );
}

