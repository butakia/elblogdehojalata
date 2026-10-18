"use client";

import { useEffect, useState } from "react";

export type PreviewData = { title: string; html: string; cover: string | null };

/** Recibe el contenido del editor por postMessage y lo muestra con los mismos estilos de la web. */
export default function PreviewFrame() {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "preview") return;
      setData(e.data.payload as PreviewData);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!data) return <p className="empty-note" style={{ textAlign: "center", padding: "3rem 1rem" }}>Cargando vista previa…</p>;

  return (
    <article className="story">
      {data.cover && (
        <div className="story-banner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        </div>
      )}
      <header className="story-head">
        <h1>{data.title || "Sin título"}</h1>
        <p className="byline">Angel Oliden</p>
      </header>
      <div className="prose story-body" dangerouslySetInnerHTML={{ __html: data.html }} />
      <div style={{ height: "5rem" }} />
    </article>
  );
}
