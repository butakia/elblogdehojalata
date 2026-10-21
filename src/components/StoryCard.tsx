import Link from "next/link";
import Image from "next/image";
import { formatDate, type Story } from "@/lib/content";

export type CardStory = Story & { section?: string };

export default function StoryCard({ story, priority = false }: { story: CardStory; priority?: boolean }) {
  return (
    <article className="card">
      <Link href={`${story.section === "microcuento" ? "/microcuentos" : "/cuentos"}/${story.slug}`} className="card-link">
        <div className={`card-cover ${story.cover ? "" : "no-cover"}`}>
          {story.cover ? (
            <Image src={story.cover} alt="" fill sizes="(max-width: 620px) 92vw, (max-width: 960px) 46vw, 340px" priority={priority} />
          ) : (
            <span aria-hidden>{story.title.slice(0, 1)}</span>
          )}
        </div>
        <div className="card-body">
          <h3>{story.title}</h3>
          <p className="meta">
            {story.kind === "microcuento" && <span className="tag">Microcuento</span>}
            {story.minutes} min{story.section !== "microcuento" && <> · {formatDate(story.date)}</>}
          </p>
          <p className="excerpt">{story.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
