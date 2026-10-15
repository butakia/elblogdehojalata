import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Propuestas de diseño" };

const PROPOSALS = [
  { id: "tinta", name: "Tinta", text: "Papel crema, tinta sepia y tipografía de libro. Es la más fiel a tus dibujos: el gato y su rayado sepia mandan. Pensada para leer largo, con lectura cómoda en móvil." },
  { id: "hojalata", name: "Hojalata", text: "Taller nocturno: gris metal, ámbar de lámpara y letras claras sobre fondo oscuro. Hace lucir tus portadas oscuras y el tono gótico de cuentos como «Un ente fracasado»." },
  { id: "cheshire", name: "Cheshire", text: "Morado profundo, magenta y una sonrisa de gato en cada rincón. Más lúdica y de cuento fantástico; esquinas redondeadas y colores vivos." },
];

export default function Propuestas() {
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <p className="eyebrow">Tres caminos, mismo contenido</p>
        <h1>Propuestas de diseño</h1>
        <p className="lead">Todas usan tus {30} cuentos y tus dibujos. Pulsa para verlas en vivo; también puedes cambiar en cualquier momento con el botón ◐.</p>
      </header>
      <div className="proposals">
        {PROPOSALS.map((p) => (
          <article key={p.id} className={`proposal swatch-${p.id}`}>
            <h2>{p.name}</h2>
            <p>{p.text}</p>
            <Link className="btn" href={`/?tema=${p.id}`}>Probar «{p.name}»</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
