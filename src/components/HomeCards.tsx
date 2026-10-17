import Link from "next/link";
import type { ReactNode } from "react";

const svg = { width: 36, height: 36, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const CARDS: { href: string; title: string; text: string; icon: ReactNode }[] = [
  {
    href: "/cuentos",
    title: "Cuentos",
    text: "Cuentos y microcuentos para leer sin prisa.",
    icon: (
      <svg {...svg}>
        <path d="M2.5 5.5c2.8-1 6-.9 9.5 1v13c-3.5-1.9-6.7-2-9.5-1v-13Z" />
        <path d="M21.5 5.5c-2.8-1-6-.9-9.5 1v13c3.5-1.9 6.7-2 9.5-1v-13Z" />
      </svg>
    ),
  },
  {
    href: "/libros",
    title: "Libros",
    text: "Mis libros publicados y dónde conseguirlos.",
    icon: (
      <svg {...svg}>
        <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z" />
        <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" />
        <path d="M9 7.5h6" />
      </svg>
    ),
  },
  {
    href: "/textamentos",
    title: "Textamentos",
    text: "Pensamientos, proyectos y novedades.",
    icon: (
      <svg {...svg}>
        <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
        <path d="M14.5 6.5l3 3" />
      </svg>
    ),
  },
  {
    href: "/sobre",
    title: "Sobre mí",
    text: "Quién escribe en esta casa de hojalata.",
    icon: (
      <svg {...svg}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" />
      </svg>
    ),
  },
];

export default function HomeCards() {
  return (
    <ul className="home-cards">
      {CARDS.map((c) => (
        <li key={c.href}>
          <Link href={c.href}>
            <span className="icon">{c.icon}</span>
            <strong>{c.title}</strong>
            <span className="txt">{c.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
