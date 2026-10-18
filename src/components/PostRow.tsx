import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/content";

type Post = { slug: string; title: string; excerpt: string; cover: string | null; date: string };

/** Fila de las listas de Balcón, Cocina y Jardín: miniatura, título y extracto. La fecha es opcional. */
export default function PostRow({ post, base, showDate = true }: { post: Post; base: string; showDate?: boolean }) {
  return (
    <li>
      <Link href={`${base}/${post.slug}`} className="post-row">
        <span className={`thumb ${post.cover ? "" : "blank"}`}>
          {post.cover ? <Image src={post.cover} alt="" width={160} height={160} sizes="80px" /> : <b aria-hidden>{post.title.slice(0, 1)}</b>}
        </span>
        <span className="post-text">
          <h2>{post.title}</h2>
          {showDate && <p className="meta">{formatDate(post.date)}</p>}
          <p className="excerpt">{post.excerpt}</p>
        </span>
      </Link>
    </li>
  );
}
