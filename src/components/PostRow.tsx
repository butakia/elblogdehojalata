import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/content";
import TrackedLink from "@/components/TrackedLink";

type Post = { slug: string; title: string; excerpt: string; cover: string | null; date: string };

/** Fila de las listas de Balcón, Cocina y Jardín: miniatura, título y extracto. La fecha es opcional. */
export default function PostRow({ post, base, showDate = true, hideBlankThumb = false, track = false }: { post: Post; base: string; showDate?: boolean; hideBlankThumb?: boolean; track?: boolean }) {
  const Anchor = track ? TrackedLink : Link;
  return (
    <li>
      <Anchor href={`${base}/${post.slug}`} className="post-row">
        {(post.cover || !hideBlankThumb) && (
          <span className={`thumb ${post.cover ? "" : "blank"}`}>
            {post.cover ? <Image src={post.cover} alt="" width={160} height={160} sizes="80px" /> : <b aria-hidden>{post.title.slice(0, 1)}</b>}
          </span>
        )}
        <span className="post-text">
          <h2>{post.title}</h2>
          {showDate && <p className="meta">{formatDate(post.date)}</p>}
          {post.excerpt && <p className="excerpt">{post.excerpt}</p>}
        </span>
      </Anchor>
    </li>
  );
}
