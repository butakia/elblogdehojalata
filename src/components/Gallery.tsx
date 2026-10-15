"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Img = { src: string; w: number; h: number };

export default function Gallery({ images }: { images: Img[] }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, images.length]);

  return (
    <>
      <div className="masonry">
        {images.map((im, i) => (
          <button key={im.src} className="tile" onClick={() => setOpen(i)} aria-label={`Ver dibujo ${i + 1}`}>
            <Image src={im.src} alt={`Dibujo ${i + 1}`} width={im.w} height={im.h} sizes="(max-width: 640px) 50vw, 33vw" />
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <Image src={images[open].src} alt={`Dibujo ${open + 1}`} width={images[open].w} height={images[open].h} sizes="100vw" priority />
          <button className="lb-close" aria-label="Cerrar">✕</button>
          <button className="lb-prev" aria-label="Anterior" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + images.length) % images.length); }}>‹</button>
          <button className="lb-next" aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % images.length); }}>›</button>
        </div>
      )}
    </>
  );
}
