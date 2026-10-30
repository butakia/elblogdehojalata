import Link from "next/link";
import Image from "next/image";

type Item = { slug: string; title: string; excerpt: string; cover: string | null; section?: string };

/** Primera línea muy breve del texto. */
function opening(text: string, max = 72) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s\S*$/, "").replace(/[,;:.\s—-]+$/, "") + "…";
}

/** Fila con miniatura de la portada, título y fecha. */
export default function StoryRow({ item, base }: { item: Item; base: string }) {
  return (
    <li>
      <Link href={`${item.section === "microcuento" ? "/microcuentos" : base}/${item.slug}`} className="row-thumb">
        <span className={`thumb ${item.cover ? "" : "blank"}`}>
          {item.cover ? <Image src={item.cover} alt="" width={128} height={128} sizes="64px" /> : <b aria-hidden>{item.title.slice(0, 1)}</b>}
        </span>
        <span className="info">
          <strong>{item.title}</strong>
          <span className="date">{opening(item.excerpt)}</span>
        </span>
      </Link>
    </li>
  );
}
