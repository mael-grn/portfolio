"use client";

import { LayoutGroup } from "framer-motion";
import { ReactNode } from "react";

export default function ResizeGroup({ children }: { children: ReactNode }) {
    return <LayoutGroup>{children}</LayoutGroup>;
}