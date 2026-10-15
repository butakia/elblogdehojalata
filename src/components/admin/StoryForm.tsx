"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveStory } from "@/app/admin/actions";
import ImageInput from "./ImageInput";
import RichEditor from "./RichEditor";

type Initial = { slug: string; title: string; html: string; cover: string | null; draft: boolean; kind: "cuento" | "microcuento" };

export default function StoryForm({ story }: { story?: Initial }) {
  const router = useRouter();
  const [title, setTitle] = useState(story?.title ?? "");
  const [html, setHtml] = useState(story?.html ?? "");
  const [cover, setCover] = useState<string | null>(story?.cover ?? null);
  const [kind, setKind] = useState<"auto" | "cuento" | "microcuento">(story ? story.kind : "auto");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(draft: boolean) {
    setError("");
    start(async () => {
      const res = await saveStory({ originalSlug: story?.slug, title, html, cover, draft, kind });
      if (!res.ok) return setError(res.error);
      router.push(draft ? "/admin" : `/cuentos/${res.slug}`);
      router.refresh();
    });
  }

  return (
    <form className="story-form" onSubmit={(e) => { e.preventDefault(); submit(false); }}>
      <label>
        Título
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder="El título de tu cuento" className="title-input" />
      </label>
      <div className="field">
        <span className="label">Portada <small>(opcional)</small></span>
        <ImageInput value={cover} onChange={setCover} />
      </div>
      <div className="field">
        <span className="label">Texto</span>
        <RichEditor initialHtml={story?.html ?? ""} onChange={setHtml} />
      </div>
      <label>
        Tipo
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="auto">Automático (según la longitud)</option>
          <option value="cuento">Cuento</option>
          <option value="microcuento">Microcuento</option>
        </select>
      </label>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="form-row sticky-actions">
        <button className="btn primary" disabled={pending}>{pending ? "Guardando…" : story ? "Guardar y ver" : "Publicar"}</button>
        <button type="button" className="btn" disabled={pending} onClick={() => submit(true)}>Guardar borrador</button>
      </div>
    </form>
  );
}
