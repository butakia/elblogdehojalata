"use client";

import { useRef, useState } from "react";
import { importUrl, uploadFile } from "./upload";

/** Portada: arrastra, selecciona o pega un enlace. */
export default function ImageInput({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function run(job: Promise<{ url: string }>) {
    setBusy(true);
    setError("");
    try {
      onChange((await job).url);
      setLink("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-input">
      {value ? (
        <div className="cover-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Portada" />
          <button type="button" className="btn" onClick={() => onChange(null)}>Quitar portada</button>
        </div>
      ) : (
        <div
          className={`dropzone ${over ? "over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) run(uploadFile(f));
          }}
        >
          <p>{busy ? "Subiendo…" : "Arrastra una imagen aquí"}</p>
          <button type="button" className="btn" disabled={busy} onClick={() => file.current?.click()}>Seleccionar archivo</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) run(uploadFile(f)); e.target.value = ""; }} />
        </div>
      )}
      {!value && (
        <div className="link-row">
          <input type="url" placeholder="…o pega el enlace de una imagen" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (link) run(importUrl(link)); } }} />
          <button type="button" className="btn" disabled={busy || !link} onClick={() => run(importUrl(link))}>Importar</button>
        </div>
      )}
      {error && <p className="err" role="alert">{error}</p>}
    </div>
  );
}
