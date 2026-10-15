import Link from "next/link";
import { LOGO } from "@/lib/content";

export const ROOMS = [
  { href: "/cuentos", name: "Salón de los cuentos", text: "Los textos que alojo celosamente." },
  { href: "/microcuentos", name: "Balcón de los microcuentos", text: "Lecturas breves, para no tomar asiento." },
  { href: "/dibujos", name: "Cochera de los dibujos", text: "Bocetos e ilustraciones, con algo de polvo." },
  { href: "/contacto", name: "Cuarto de contacto", text: "Críticas, sugerencias y gritos." },
];

/** La casa de hojalata: cada puerta o ventana lleva a una habitación. */
export default function House() {
  return (
    <svg className="house" viewBox="0 0 600 540" role="img" aria-label="Una casa de hojalata con balcón, cochera, puerta de salón y un gato asomado en el ático">
      <defs>
        <clipPath id="roofclip"><polygon points="40,215 300,45 560,215" /></clipPath>
        <clipPath id="atticclip"><circle cx="300" cy="150" r="36" /></clipPath>
      </defs>
      <rect x="0" y="498" width="600" height="3" className="h-ground" />
      <rect x="415" y="62" width="42" height="95" className="h-wall" />
      <rect x="408" y="54" width="56" height="12" className="h-roof" />
      <g clipPath="url(#roofclip)">
        <polygon points="40,215 300,45 560,215" className="h-roof" />
        {Array.from({ length: 29 }, (_, i) => <line key={i} x1={40 + i * 18} y1="40" x2={40 + i * 18} y2="220" className="h-rib" />)}
      </g>
      <polygon points="40,215 300,45 560,215" className="h-outline" />
      <Link href="/sobre" aria-label="Sobre la casa y el gato">
        <circle cx="300" cy="150" r="40" className="h-wall" />
        <image href={LOGO} x="260" y="110" width="80" height="80" clipPath="url(#atticclip)" preserveAspectRatio="xMidYMid slice" />
        <circle cx="300" cy="150" r="38" className="h-outline" />
        <title>Sobre la casa</title>
      </Link>
      <rect x="80" y="215" width="440" height="285" className="h-wall h-outline" />
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1={98 + i * 18} y1="218" x2={98 + i * 18} y2="496" className="h-rib" />)}

      <Link href="/microcuentos" className="room" aria-label="Balcón de los microcuentos">
        <rect x="118" y="240" width="140" height="92" className="h-room" />
        <line x1="188" y1="240" x2="188" y2="332" className="h-outline" />
        <line x1="118" y1="286" x2="258" y2="286" className="h-outline" />
        <rect x="102" y="332" width="172" height="10" className="h-roof h-outline" />
        {[112, 136, 160, 184, 208, 232, 256].map((x) => <line key={x} x1={x} y1="342" x2={x} y2="368" className="h-outline" />)}
        <line x1="102" y1="368" x2="274" y2="368" className="h-outline" />
        <title>Balcón de los microcuentos</title>
      </Link>

      <Link href="/contacto" className="room" aria-label="Cuarto de contacto">
        <rect x="350" y="240" width="130" height="92" className="h-room" />
        <path d="M368 262 h94 v50 h-94 z M368 262 l47 30 l47 -30" className="h-outline h-none" />
        <title>Cuarto de contacto</title>
      </Link>

      <Link href="/dibujos" className="room" aria-label="Cochera de los dibujos">
        <rect x="100" y="390" width="180" height="108" className="h-room" />
        {[410, 430, 450, 470].map((y) => <line key={y} x1="100" y1={y} x2="280" y2={y} className="h-outline" />)}
        <title>Cochera de los dibujos</title>
      </Link>

      <Link href="/cuentos" className="room" aria-label="Salón de los cuentos">
        <path d="M330 498 v-95 a40 40 0 0 1 80 0 v95 z" className="h-room" />
        <circle cx="396" cy="450" r="4" className="h-knob" />
        <title>Salón de los cuentos</title>
      </Link>

      <rect x="440" y="410" width="60" height="50" className="h-wall h-outline" />
      <line x1="470" y1="410" x2="470" y2="460" className="h-outline" />
    </svg>
  );
}
