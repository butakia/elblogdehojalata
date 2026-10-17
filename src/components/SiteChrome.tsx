"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

const TOP = [
  { href: "/", label: "Inicio" },
  { href: "/cuentos", label: "Cuentos" },
  { href: "/libros", label: "Libros" },
  { href: "/textamentos", label: "Textamentos" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/sobre", label: "Sobre mí" },
];

const s = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const BOTTOM: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Inicio", icon: <svg {...s}><path d="M3.5 11 12 4l8.5 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5.5h4V20" /></svg> },
  { href: "/cuentos", label: "Cuentos", icon: <svg {...s}><path d="M2.5 5.5c2.8-1 6-.9 9.5 1v13c-3.5-1.9-6.7-2-9.5-1v-13Z" /><path d="M21.5 5.5c-2.8-1-6-.9-9.5 1v13c3.5-1.9 6.7-2 9.5-1v-13Z" /></svg> },
  { href: "/libros", label: "Libros", icon: <svg {...s}><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z" /><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" /><path d="M9 7.5h6" /></svg> },
  { href: "/proyectos", label: "Proyectos", icon: <svg {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" /></svg> },
  { href: "/sobre", label: "Sobre mí", icon: <svg {...s}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" /></svg> },
];

const active = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="El blog de Hojalata, inicio">
        <span className="brand-name">El blog de Hojalata</span>
      </Link>
      <nav className="top-nav" aria-label="Principal">
        {TOP.map((n) => (
          <Link key={n.href} href={n.href} aria-current={active(path, n.href) ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Navegación móvil">
      {BOTTOM.map((n) => (
        <Link key={n.href} href={n.href} aria-current={active(path, n.href) ? "page" : undefined}>
          {n.icon}
          <span>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}
