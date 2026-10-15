"use client";

import { useMemo, useState } from "react";
import StoryCard from "./StoryCard";
import type { Story } from "@/lib/content";

const FILTERS = [
  ["todos", "Todos"],
  ["cuento", "Cuentos"],
  ["microcuento", "Microcuentos"],
] as const;

export default function StoryBrowser({ stories }: { stories: Story[] }) {
  const [kind, setKind] = useState<string>("todos");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return stories.filter((s) => (kind === "todos" || s.kind === kind) && (!n || (s.title + " " + s.excerpt).toLowerCase().includes(n)));
  }, [stories, kind, q]);

  return (
    <>
      <div className="toolbar">
        <input type="search" placeholder="Buscar un cuento…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <div className="filters" role="group" aria-label="Filtrar">
          {FILTERS.map(([id, label]) => (
            <button key={id} className={kind === id ? "on" : ""} onClick={() => setKind(id)} aria-pressed={kind === id}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="count">
        {shown.length} {shown.length === 1 ? "texto" : "textos"}
      </p>
      <div className="grid">
        {shown.map((s, i) => (
          <StoryCard key={s.slug} story={s} priority={i < 2} />
        ))}
      </div>
      {!shown.length && <p className="empty">Nada por aquí… el gato se lo comió.</p>}
    </>
  );
}
