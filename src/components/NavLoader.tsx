"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CatLoader from "./CatLoader";

const MIN_MS = 500; // la sonrisa se ve al menos este tiempo, aunque la página cargue al instante
const GUARD_MS = 10_000; // por si una navegación nunca termina

/**
 * Cargador global: al hacer clic en cualquier enlace interno aparece el círculo con la sonrisa del gato
 * y desaparece cuando la nueva página está lista.
 */
export default function NavLoader() {
  const path = usePathname();
  const [show, setShow] = useState(false);
  const visible = useRef(false);
  const shownAt = useRef(0);
  const guard = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // La página cambió: ocultar el cargador (respetando el tiempo mínimo)
  useEffect(() => {
    if (!visible.current) return;
    const wait = Math.max(0, MIN_MS - (Date.now() - shownAt.current));
    const t = setTimeout(() => {
      visible.current = false;
      setShow(false);
    }, wait);
    return () => clearTimeout(t);
  }, [path]);

  useEffect(() => {
    const hide = () => {
      visible.current = false;
      setShow(false);
    };
    // En fase de captura: Next llama a preventDefault en sus enlaces y no debe impedir ver el cargador
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // misma página o ancla
      visible.current = true;
      shownAt.current = Date.now();
      setShow(true);
      clearTimeout(guard.current);
      guard.current = setTimeout(hide, GUARD_MS);
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", hide); // al volver atrás desde la caché del navegador
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", hide);
      clearTimeout(guard.current);
    };
  }, []);

  return show ? <CatLoader /> : null;
}
