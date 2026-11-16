import "server-only";
import { allStories } from "./content";
import { getCustomStories } from "./stories";

export const when = (iso: string) => new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(iso));

export function dur(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 1) return "—";
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m} min ${String(s % 60).padStart(2, "0")} s` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

export const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Título legible de cada dirección del sitio (para los registros del panel). */
export async function pageTitles() {
  const titles = new Map<string, string>();
  const mine = await getCustomStories();
  for (const st of [...allStories, ...mine]) {
    for (const base of ["cuentos", "microcuentos", "ensayos", "textamentos"]) titles.set(`/${base}/${st.slug}`, st.title);
  }
  const pretty = (p: string) => (p === "/" ? "Inicio" : p === "/textamentos" ? "Lista de textamentos" : titles.get(p) ?? p);
  return { titles, pretty };
}

export const READING = /^\/textamentos\/[^/]+$/;
