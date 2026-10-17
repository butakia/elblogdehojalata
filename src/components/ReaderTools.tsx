"use client";

import { useEffect, useRef, useState } from "react";

// Tamaños de lectura en rem; el estándar (índice 2) es mediano.
const SIZES = [1.0, 1.1, 1.2, 1.35, 1.5, 1.7];
const DEFAULT = 2;

export default function ReaderTools() {
  const [progress, setProgress] = useState(0);
  const [size, setSize] = useState(DEFAULT);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hojalata-size-v2");
      const saved = Number(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null && Number.isInteger(saved) && saved >= 0 && saved < SIZES.length) setSize(saved);
    } catch {}
    const onScroll = () => {
      const h = document.documentElement;
      setProgress(Math.min(100, (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--read-size", `${SIZES[size]}rem`);
    try {
      localStorage.setItem("hojalata-size-v2", String(size));
    } catch {}
  }, [size]);

  // Cerrar al tocar fuera o tras unos segundos sin usarlo
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const t = setTimeout(() => setOpen(false), 5000);
    document.addEventListener("pointerdown", away);
    return () => { clearTimeout(t); document.removeEventListener("pointerdown", away); };
  }, [open, size]);

  return (
    <>
      <div className="progress" aria-hidden>
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="reader-fab" ref={box}>
        <button className="toggle" aria-label="Tamaño de letra" aria-expanded={open} onClick={() => setOpen(!open)}>
          Aa
        </button>
        {open && (
          <div className="pill" role="group" aria-label="Tamaño de letra">
            <button className="minus" onClick={() => setSize(Math.max(0, size - 1))} disabled={size === 0} aria-label="Achicar letra">A−</button>
            <button className="plus" onClick={() => setSize(Math.min(SIZES.length - 1, size + 1))} disabled={size === SIZES.length - 1} aria-label="Agrandar letra">A+</button>
          </div>
        )}
      </div>
    </>
  );
}
