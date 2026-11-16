import { cookies, headers } from "next/headers";
import { isAdmin, rateLimit } from "@/lib/auth";
import { isBot, recordVisit, requestInfo, sourceLabel } from "@/lib/visits";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) => String(v ?? "").slice(0, max);
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** Recibe las páginas vistas y el tiempo en página desde el navegador del visitante. */
export async function POST(req: Request) {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  if (isBot(ua) || (await isAdmin())) return new Response(null, { status: 204 });

  const ip = (h.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!rateLimit(`track:${ip}`, 240, 60_000)) return new Response(null, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }

  const id = clean(body.id, 40);
  if (!/^[\w-]{6,40}$/.test(id)) return new Response(null, { status: 400 });
  const t = new Date().toISOString();

  if (body.k === "d") {
    const ms = Number(body.ms);
    const sc = Number(body.sc);
    if (Number.isFinite(ms) && ms > 0) await recordVisit({ k: "d", id, t, ms: Math.round(ms), ...(Number.isFinite(sc) ? { sc: Math.max(0, Math.min(100, Math.round(sc))) } : {}) });
    return new Response(null, { status: 204 });
  }

  // Clic en «Leer más textamentos», en una tarjeta de lectura o en un textamento de la lista
  if (body.k === "c") {
    const from = clean(body.from, 200);
    const to = clean(body.to, 200);
    const vid = clean(body.vid, 40);
    const sid = clean(body.sid, 40);
    if (!from.startsWith("/textamentos") || !to.startsWith("/textamentos") || !/^[\w-]{6,40}$/.test(vid) || !/^[\w-]{6,40}$/.test(sid)) return new Response(null, { status: 204 });
    const label = ["boton", "tarjeta", "lista"].includes(String(body.label)) ? String(body.label) : "boton";
    await recordVisit({ k: "c", id, t, vid, sid, from, to, label });
    return new Response(null, { status: 204 });
  }

  const path = clean(body.path, 200);
  if (!path.startsWith("/") || /^\/(admin|api|og|_next)(\/|$)/.test(path)) return new Response(null, { status: 204 });
  const vid = clean(body.vid, 40);
  const sid = clean(body.sid, 40);
  if (!/^[\w-]{6,40}$/.test(vid) || !/^[\w-]{6,40}$/.test(sid)) return new Response(null, { status: 400 });

  let host = "";
  try {
    const r = new URL(clean(body.ref, 300));
    if (r.host && r.host !== new URL(req.url).host) host = r.host.replace(/^www\./, "");
  } catch {}
  const ref = sourceLabel(clean(body.src, 30), host);

  const name = safeDecode((await cookies()).get("hj_vn")?.value ?? "").slice(0, 40);
  await recordVisit({
    k: "v",
    id,
    t,
    vid,
    sid,
    path,
    ...requestInfo(h),
    ref,
    name,
    lang: clean(body.lang, 20),
    tz: clean(body.tz, 50),
    scr: clean(body.scr, 20),
  });
  return new Response(null, { status: 204 });
}
