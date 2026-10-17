"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LOGO } from "@/lib/content";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/cuentos", label: "Cuentos" },
  { href: "/libros", label: "Libros" },
  { href: "/textamentos", label: "Textamentos" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/sobre", label: "Sobre mí" },
];

const active = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

export function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="El blog de Hojalata, inicio">
        <Image src={LOGO} alt="" width={40} height={40} className="brand-cat" priority />
        <span className="brand-name">El blog de Hojalata</span>
      </Link>
      <nav className="top-nav" aria-label="Principal">
        {NAV.map((n) => (
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
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={active(path, n.href) ? "page" : undefined}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
