"use client";

import { useEffect, useState } from "react";

export default function ReaderTools() {
  const [progress, setProgress] = useState(0);
  const [size, setSize] = useState(0);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("hojalata-size"));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setSize(saved);
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
    document.documentElement.style.setProperty("--read-scale", String(1 + size * 0.1));
    try {
      localStorage.setItem("hojalata-size", String(size));
    } catch {}
  }, [size]);

  return (
    <>
      <div className="progress" aria-hidden>
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className="reader-tools" role="group" aria-label="Tamaño de letra">
        <button onClick={() => setSize(Math.max(-2, size - 1))} aria-label="Letra más pequeña">A−</button>
        <button onClick={() => setSize(Math.min(4, size + 1))} aria-label="Letra más grande">A+</button>
      </div>
    </>
  );
}
