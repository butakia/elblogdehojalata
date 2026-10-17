"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveStory } from "@/app/admin/actions";
import ImageInput from "./ImageInput";
import RichEditor from "./RichEditor";

type CoverStyle = "right" | "left" | "center" | "banner";
type CoverSize = "s" | "m" | "l";
type Initial = { slug: string; title: string; html: string; cover: string | null; draft: boolean; coverStyle?: CoverStyle; coverSize?: CoverSize };

const STYLES: [CoverStyle, string][] = [["right", "Derecha"], ["left", "Izquierda"], ["center", "Centro"], ["banner", "Banner arriba"]];
const SIZES: [CoverSize, string][] = [["s", "Pequeña"], ["m", "Mediana"], ["l", "Grande"]];

export default function StoryForm({ story, section = "cuento" }: { story?: Initial; section?: "cuento" | "textamento" }) {
  const router = useRouter();
  const [title, setTitle] = useState(story?.title ?? "");
  const [html, setHtml] = useState(story?.html ?? "");
  const [cover, setCover] = useState<string | null>(story?.cover ?? null);
  const [coverStyle, setCoverStyle] = useState<CoverStyle>(story?.coverStyle ?? "right");
  const [coverSize, setCoverSize] = useState<CoverSize>(story?.coverSize ?? "m");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const base = section === "textamento" ? "/textamentos" : "/cuentos";

  function submit(draft: boolean) {
    setError("");
    start(async () => {
      const res = await saveStory({ originalSlug: story?.slug, title, html, cover, draft, section, coverStyle, coverSize });
      if (!res.ok) return setError(res.error);
      router.push(draft ? "/admin" : `${base}/${res.slug}`);
      router.refresh();
    });
  }

  return (
    <form className="story-form" onSubmit={(e) => { e.preventDefault(); submit(false); }}>
      <label>
        Título
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required className="title-input" />
      </label>
      <RichEditor initialHtml={story?.html ?? ""} onChange={setHtml} />
      <div className="field">
        <span className="label">Imagen principal <small>(opcional)</small></span>
        <ImageInput value={cover} onChange={setCover} />
        {cover && (
          <div className="cover-opts">
            <div className="row">
              <span>Posición</span>
              <div className="seg" role="group" aria-label="Posición de la imagen">
                {STYLES.map(([id, label]) => (
                  <button key={id} type="button" className={coverStyle === id ? "on" : ""} onClick={() => setCoverStyle(id)}>{label}</button>
                ))}
              </div>
            </div>
            {coverStyle !== "banner" && (
              <div className="row">
                <span>Tamaño</span>
                <div className="seg" role="group" aria-label="Tamaño de la imagen">
                  {SIZES.map(([id, label]) => (
                    <button key={id} type="button" className={coverSize === id ? "on" : ""} onClick={() => setCoverSize(id)}>{label}</button>
                  ))}
                </div>
              </div>
            )}
            <small className="muted">El texto se acomoda alrededor de la imagen, como en Word.</small>
          </div>
        )}
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="form-row sticky-actions">
        <button className="btn primary" disabled={pending}>{pending ? "Guardando…" : story ? "Guardar" : "Publicar"}</button>
        <button type="button" className="btn" disabled={pending} onClick={() => submit(true)}>Guardar borrador</button>
      </div>
    </form>
  );
}
