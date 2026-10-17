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

const s = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const BOTTOM: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Inicio", icon: <svg {...s}><path d="M3.6 11.2 L12.1 3.9 L20.4 11.4" /><path d="M5.8 9.8 C5.7 13.5 5.9 17 5.6 20.2 L18.4 20.1 C18.2 16.8 18.3 13 18.2 9.9" /><path d="M10.2 20 L10.4 14.6 L13.8 14.5 L13.9 20" /></svg> },
  { href: "/cuentos", label: "Cuentos", icon: <svg {...s}><path d="M2.8 5.6 C6 4.8 9.2 5.3 12 7 C14.8 5.3 18 4.8 21.2 5.6 L21 18.6 C18 17.9 14.8 18.4 12 20 C9.2 18.4 6 17.9 3 18.6 Z" /><path d="M12 7 L12.1 19.8" /></svg> },
  { href: "/libros", label: "Libros", icon: <svg {...s}><path d="M6 3.6 L18.2 4 L17.6 18.4 L5.8 18 Z" /><path d="M5.8 18 C5.2 19.6 6.6 20.6 8 20.4 L17.9 20.7" /><path d="M9.2 8 L14.8 8.2" /></svg> },
  { href: "/proyectos", label: "Proyectos", icon: <svg {...s}><path d="M12 3.2 C16.9 3.1 20.9 7.1 20.8 12 C20.7 16.9 16.8 20.9 11.9 20.8 C7.1 20.7 3.2 16.8 3.3 11.9 C3.4 7.1 7.2 3.3 12 3.2 Z" /><path d="M3.6 12.3 C8 11.6 15.6 12.8 20.6 11.9" /><path d="M12 3.4 C9.6 6.4 9.2 10.2 9.4 12.6 C9.6 15.6 10.4 18.4 12.2 20.7" /></svg> },
  { href: "/sobre", label: "Sobre mí", icon: <svg {...s}><path d="M12 4.2 C13.9 4.1 15.4 5.6 15.3 7.6 C15.2 9.5 13.8 10.9 12 10.9 C10.2 10.8 8.8 9.4 8.8 7.5 C8.8 5.6 10.2 4.2 12 4.2 Z" /><path d="M5.2 20.4 C5.7 16.9 8.5 14.9 12 14.9 C15.5 15 18.3 17 18.8 20.3" /></svg> },
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
