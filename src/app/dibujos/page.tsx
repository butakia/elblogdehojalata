import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import { drawings } from "@/lib/content";

export const metadata: Metadata = { title: "Cochera de los dibujos" };

export default function Dibujos() {
  return (
    <div className="wrap section">
      <header className="page-head">
        <p className="eyebrow">Cochera de los dibujos</p>
        <h1>Bocetos e ilustraciones</h1>
        <p className="lead">Aquí se refugian algunas de mis ilustraciones. Cuidado con tocar, que algunas tienen mucho polvo.</p>
      </header>
      <Gallery images={drawings} />
    </div>
  );
}
