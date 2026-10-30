import "server-only";
import { getLog, pushLog } from "./store";

/** Evento guardado: "v" = página vista, "d" = tiempo que estuvo en esa página (ms). */
export type VisitEvent =
  | { k: "v"; id: string; t: string; vid: string; sid: string; path: string; ip: string; country: string; region: string; city: string; device: string; os: string; browser: string; ref: string; name: string }
  | { k: "d"; id: string; t: string; ms: number };

const KEY = "visits";

export const recordVisit = (e: VisitEvent) => pushLog(KEY, e, 20000);
export const loadVisits = () => getLog<VisitEvent>(KEY, 20000);

export function parseUA(ua: string) {
  const device = /iPad/i.test(ua) ? "iPad" : /iPhone|iPod/i.test(ua) ? "iPhone" : /Android/i.test(ua) ? (/Mobile/i.test(ua) ? "Android" : "Tablet Android") : "Computadora";
  const os = /Windows/i.test(ua) ? "Windows" : /Android/i.test(ua) ? "Android" : /iPhone|iPad|iPod/i.test(ua) ? "iOS" : /Mac OS X|Macintosh/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Otro";
  const browser = /Edg\//i.test(ua) ? "Edge" : /OPR\/|Opera/i.test(ua) ? "Opera" : /SamsungBrowser/i.test(ua) ? "Samsung" : /Firefox|FxiOS/i.test(ua) ? "Firefox" : /Chrome|CriOS/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : "Otro";
  return { device, os, browser };
}

/** Nombre legible del origen: primero el parámetro ?o= del enlace compartido; si no, el sitio de referencia. */
export function sourceLabel(src: string, host: string) {
  const s = src.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const named: Record<string, string> = { wa: "WhatsApp", whatsapp: "WhatsApp", fb: "Facebook", facebook: "Facebook", ig: "Instagram", instagram: "Instagram", share: "Compartido desde el celular", tw: "X (Twitter)", tg: "Telegram" };
  if (s) return named[s] ?? s;
  if (!host) return "";
  if (/(^|\.)(facebook|fb)\.com$/.test(host)) return "Facebook";
  if (/instagram\.com$/.test(host)) return "Instagram";
  if (/whatsapp\.com$|^wa\.me$/.test(host)) return "WhatsApp";
  if (/^t\.co$|twitter\.com$|^x\.com$/.test(host)) return "X (Twitter)";
  if (/google\./.test(host)) return "Google";
  if (/bing\.com$/.test(host)) return "Bing";
  if (/duckduckgo\.com$/.test(host)) return "DuckDuckGo";
  if (/wordpress\.com$/.test(host)) return "Blog en WordPress";
  return host;
}

export const isBot = (ua: string) => !ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|vercel|headless|lighthouse|curl|wget|python|node-fetch/i.test(ua);

const countryName = (code: string) => {
  if (!code) return "Desconocido";
  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

export type Visitor = {
  vid: string;
  name: string;
  ip: string;
  place: string;
  device: string;
  os: string;
  browser: string;
  first: string;
  last: string;
  views: number;
  sessions: number;
  totalMs: number;
  pages: { path: string; n: number }[];
};

export type Summary = {
  views: number;
  visitors: number;
  sessions: number;
  avgSessionMs: number;
  avgPageMs: number;
  today: number;
  week: number;
  month: number;
  topPages: { label: string; n: number; avgMs: number }[];
  devices: { label: string; n: number }[];
  oses: { label: string; n: number }[];
  browsers: { label: string; n: number }[];
  places: { label: string; n: number }[];
  refs: { label: string; n: number }[];
  perDay: { day: string; n: number }[];
  visitors_: Visitor[];
};

const count = <T,>(items: T[], key: (x: T) => string, top = 8) => {
  const m = new Map<string, number>();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, top).map(([label, n]) => ({ label, n }));
};

const limaDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date(iso));

export function summarize(events: VisitEvent[], now = new Date()): Summary {
  const views = events.filter((e): e is Extract<VisitEvent, { k: "v" }> => e.k === "v");
  const dur = new Map<string, number>();
  for (const e of events) if (e.k === "d") dur.set(e.id, Math.max(dur.get(e.id) ?? 0, Math.min(e.ms, 3_600_000)));

  const ms = (id: string) => dur.get(id) ?? 0;
  const timed = views.filter((v) => dur.has(v.id));
  const sessions = new Map<string, number>();
  for (const v of views) sessions.set(v.sid, (sessions.get(v.sid) ?? 0) + ms(v.id));

  const day = (n: number) => limaDay(new Date(now.getTime() - n * 86_400_000).toISOString());
  const today = day(0);
  const inDays = (n: number) => {
    const from = day(n - 1);
    return views.filter((v) => limaDay(v.t) >= from).length;
  };

  const place = (v: { city: string; region: string; country: string }) => [v.city, v.region, countryName(v.country)].filter((x) => x && x !== "Desconocido").join(", ") || "Desconocido";

  const pageStats = new Map<string, { n: number; ms: number; timed: number }>();
  for (const v of views) {
    const s = pageStats.get(v.path) ?? { n: 0, ms: 0, timed: 0 };
    s.n++;
    if (dur.has(v.id)) {
      s.ms += ms(v.id);
      s.timed++;
    }
    pageStats.set(v.path, s);
  }

  const byVid = new Map<string, Extract<VisitEvent, { k: "v" }>[]>();
  for (const v of views) byVid.set(v.vid, [...(byVid.get(v.vid) ?? []), v]);
  const visitors: Visitor[] = [...byVid.entries()].map(([vid, list]) => {
    const sorted = list.slice().sort((a, b) => a.t.localeCompare(b.t));
    const last = sorted[sorted.length - 1];
    const pages = new Map<string, number>();
    for (const v of sorted) pages.set(v.path, (pages.get(v.path) ?? 0) + 1);
    return {
      vid,
      name: sorted.map((v) => v.name).filter(Boolean).pop() ?? "",
      ip: last.ip,
      place: place(last),
      device: last.device,
      os: last.os,
      browser: last.browser,
      first: sorted[0].t,
      last: last.t,
      views: sorted.length,
      sessions: new Set(sorted.map((v) => v.sid)).size,
      totalMs: sorted.reduce((a, v) => a + ms(v.id), 0),
      pages: [...pages.entries()].map(([path, n]) => ({ path, n })).sort((a, b) => b.n - a.n),
    };
  });
  visitors.sort((a, b) => b.last.localeCompare(a.last));

  const perDay = Array.from({ length: 14 }, (_, i) => {
    const d = day(13 - i);
    return { day: d, n: views.filter((v) => limaDay(v.t) === d).length };
  });

  return {
    views: views.length,
    visitors: byVid.size,
    sessions: sessions.size,
    avgSessionMs: sessions.size ? [...sessions.values()].reduce((a, b) => a + b, 0) / sessions.size : 0,
    avgPageMs: timed.length ? timed.reduce((a, v) => a + ms(v.id), 0) / timed.length : 0,
    today: views.filter((v) => limaDay(v.t) === today).length,
    week: inDays(7),
    month: inDays(30),
    topPages: [...pageStats.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 12).map(([label, s]) => ({ label, n: s.n, avgMs: s.timed ? s.ms / s.timed : 0 })),
    devices: count(views, (v) => v.device),
    oses: count(views, (v) => v.os),
    browsers: count(views, (v) => v.browser),
    places: count(views, (v) => place(v)),
    refs: count(views.filter((v) => v.ref), (v) => v.ref),
    perDay,
    visitors_: visitors,
  };
}
