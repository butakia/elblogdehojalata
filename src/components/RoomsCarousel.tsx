"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CatLoader from "./CatLoader";

type Room = { href: string; name: string };

/**
 * Tarjetas pequeñas de las habitaciones. Si no caben en el ancho disponible,
 * se desplazan solas despacio en bucle (se pausan al tocar o pasar el cursor).
 * Al entrar a una habitación aparece el cargador con la sonrisa del gato.
 */
export default function RoomsCarousel({ rooms }: { rooms: Room[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si se vuelve atrás (bfcache), ocultar el cargador
  useEffect(() => {
    const reset = () => setLoading(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  // ¿Caben todas? Si no, activar el carrusel.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const measure = () => {
      const list = el.querySelector("ul");
      const single = list ? (loop ? list.scrollWidth / 2 : list.scrollWidth) : 0;
      const cs = getComputedStyle(el);
      const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setLoop(single > avail + 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loop]);

  // Desplazamiento automático lento
  useEffect(() => {
    const el = rail.current;
    if (!el || !loop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    let paused = false;
    let resume: ReturnType<typeof setTimeout> | undefined;
    const SPEED = 22; // px por segundo

    const pause = () => { paused = true; clearTimeout(resume); };
    const later = () => { clearTimeout(resume); resume = setTimeout(() => { paused = false; pos = el.scrollLeft; }, 2200); };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!paused) {
        const half = (el.querySelector("ul")?.scrollWidth ?? 0) / 2;
        pos += SPEED * dt;
        if (half > 0 && pos >= half) pos -= half;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", later);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", later);
    el.addEventListener("focusin", pause);
    el.addEventListener("focusout", later);
    el.addEventListener("wheel", () => { pause(); later(); }, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resume);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", later);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", later);
      el.removeEventListener("focusin", pause);
      el.removeEventListener("focusout", later);
    };
  }, [loop]);

  const items = loop ? [...rooms, ...rooms] : rooms;

  return (
    <>
      <div ref={rail} className={`rooms-rail ${loop ? "loop" : ""}`}>
        <ul className="rooms">
          {items.map((r, i) => {
            const dup = i >= rooms.length;
            return (
              <li key={`${r.href}-${i}`} aria-hidden={dup || undefined}>
                <Link
                  href={r.href}
                  tabIndex={dup ? -1 : undefined}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    setLoading(true);
                  }}
                >
                  <span>{r.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {loading && <CatLoader />}
    </>
  );
}
