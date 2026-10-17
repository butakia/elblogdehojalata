"use client";

import { useEffect, useState } from "react";

// Tamaños de lectura en rem; el estándar (índice 2) es mediano.
const SIZES = [1.0, 1.1, 1.2, 1.35, 1.5, 1.7];
const DEFAULT = 2;

export default function ReaderTools() {
  const [progress, setProgress] = useState(0);
  const [size, setSize] = useState(DEFAULT);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("hojalata-size-v2"));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Number.isInteger(saved) && saved >= 0 && saved < SIZES.length && localStorage.getItem("hojalata-size-v2") !== null) setSize(saved);
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

  return (
    <>
      <div className="progress" aria-hidden>
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="reader-tools" role="group" aria-label="Tamaño de letra">
        <span>Letra</span>
        <button className="minus" onClick={() => setSize(Math.max(0, size - 1))} disabled={size === 0} aria-label="Achicar letra">A−</button>
        <button className="plus" onClick={() => setSize(Math.min(SIZES.length - 1, size + 1))} disabled={size === SIZES.length - 1} aria-label="Agrandar letra">A+</button>
      </div>
    </>
  );
}
