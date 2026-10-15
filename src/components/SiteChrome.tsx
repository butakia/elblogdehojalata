"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LOGO } from "@/lib/content";

const NAV = [
  { href: "/cuentos", label: "Cuentos", icon: "❡" },
  { href: "/microcuentos", label: "Micro", icon: "·" },
  { href: "/dibujos", label: "Dibujos", icon: "✎" },
  { href: "/sobre", label: "Sobre mí", icon: "☺" },
  { href: "/contacto", label: "Contacto", icon: "✉" },
];

const active = (path: string, href: string) => path === href || path.startsWith(href + "/");

export function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="El blog de Hojalata, inicio">
        <Image src={LOGO} alt="" width={44} height={44} className="brand-cat" priority />
        <span className="brand-text">
          <span className="brand-name">El blog de Hojalata</span>
          <span className="brand-tag">y el gato que sonríe en la copa del abeto del relato</span>
        </span>
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
      <Link href="/" aria-current={path === "/" ? "page" : undefined}>
        <span aria-hidden>⌂</span>Inicio
      </Link>
      {NAV.slice(0, 3).map((n) => (
        <Link key={n.href} href={n.href} aria-current={active(path, n.href) ? "page" : undefined}>
          <span aria-hidden>{n.icon}</span>
          {n.label}
        </Link>
      ))}
      <Link href="/sobre" aria-current={active(path, "/sobre") || active(path, "/contacto") ? "page" : undefined}>
        <span aria-hidden>☺</span>Yo
      </Link>
    </nav>
  );
}
