"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const rand = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function stored(storage: "local" | "session", key: string) {
  try {
    const s = storage === "local" ? window.localStorage : window.sessionStorage;
    let v = s.getItem(key);
    if (!v) {
      v = rand();
      s.setItem(key, v);
    }
    return v;
  } catch {
    return rand();
  }
}

/** Registra cada página vista y cuánto tiempo estuvo abierta (solo mientras la pestaña está visible). */
export default function Tracker() {
  const path = usePathname();

  useEffect(() => {
    if (path.startsWith("/admin")) return;
    const id = rand();
    const body = { k: "v", id, vid: stored("local", "hj-vid"), sid: stored("session", "hj-sid"), path, lang: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, scr: `${window.screen.width}x${window.screen.height}`, ref: document.referrer, src: new URLSearchParams(window.location.search).get("o") || new URLSearchParams(window.location.search).get("utm_source") || "" };
    fetch("/api/track", { method: "POST", body: JSON.stringify(body), keepalive: true }).catch(() => {});

    let total = 0;
    let since = document.visibilityState === "visible" ? Date.now() : 0;
    let sent = 0;
    let maxScroll = 0;
    const onScroll = () => {
      const room = document.documentElement.scrollHeight - window.innerHeight;
      maxScroll = Math.max(maxScroll, room > 0 ? Math.min(100, (window.scrollY / room) * 100) : 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const flush = () => {
      if (since) {
        total += Date.now() - since;
        since = document.visibilityState === "visible" ? Date.now() : 0;
      }
      if (total - sent < 1000) return;
      sent = total;
      const data = JSON.stringify({ k: "d", id, ms: total, sc: Math.round(maxScroll) });
      if (!navigator.sendBeacon?.("/api/track", data)) fetch("/api/track", { method: "POST", body: data, keepalive: true }).catch(() => {});
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
      else since = Date.now();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [path]);

  return null;
}
