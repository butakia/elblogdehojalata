"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackClick } from "@/lib/trackClient";

/** Enlace de la lista de textamentos que cuenta cuántas veces se hace clic en cada uno. */
export default function TrackedLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => trackClick(href, "lista")}>
      {children}
    </Link>
  );
}
