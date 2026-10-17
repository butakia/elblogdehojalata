import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/content";

type Item = { slug: string; title: string; date: string; cover: string | null };

/** Fila con miniatura de la portada, título y fecha. */
export default function StoryRow({ item, base }: { item: Item; base: string }) {
  return (
    <li>
      <Link href={`${base}/${item.slug}`} className="row-thumb">
        <span className={`thumb ${item.cover ? "" : "blank"}`}>
          {item.cover ? <Image src={item.cover} alt="" width={128} height={128} sizes="64px" /> : <b aria-hidden>{item.title.slice(0, 1)}</b>}
        </span>
        <span className="info">
          <strong>{item.title}</strong>
          <span className="date">{formatDate(item.date)}</span>
        </span>
      </Link>
    </li>
  );
}
