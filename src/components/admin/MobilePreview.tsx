"use client";

import { useEffect, useRef, useState } from "react";
import type { PreviewData } from "./PreviewFrame";

/** Botón "Vista previa móvil": abre un marco de celular (375 px) con el texto tal como se vería. */
export default function MobilePreview({ data }: { data: PreviewData }) {
  const [open, setOpen] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const latest = useRef(data);
  useEffect(() => {
    latest.current = data;
  });

  const send = () => frame.current?.contentWindow?.postMessage({ type: "preview", payload: latest.current }, window.location.origin);

  // El marco avisa cuando está listo y entonces recibe el contenido
  useEffect(() => {
    if (!open) return;
    ready.current = false;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "ready") return;
      ready.current = true;
      send();
    };
    window.addEventListener("message", onMessage);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cada cambio del editor se refleja en el marco
  useEffect(() => {
    if (!open || !ready.current) return;
    const t = setTimeout(send, 250);
    return () => clearTimeout(t);
  }, [open, data.title, data.html, data.cover]);

  return (
    <>
      <button type="button" className="linklike" onClick={() => setOpen(true)}>Vista previa móvil</button>
      {open && (
        <div className="phone-overlay" role="dialog" aria-modal="true" aria-label="Vista previa en el celular" onClick={() => setOpen(false)}>
          <div className="phone" onClick={(e) => e.stopPropagation()}>
            <div className="phone-bar">
              <span>Así se ve en el celular</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar vista previa">✕</button>
            </div>
            <iframe ref={frame} src="/admin/vista-previa" title="Vista previa móvil" />
          </div>
        </div>
      )}
    </>
  );
}
