import { cookies, headers } from "next/headers";
import { isAdmin, rateLimit } from "@/lib/auth";
import { isBot, parseUA, recordVisit, sourceLabel } from "@/lib/visits";

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
    if (Number.isFinite(ms) && ms > 0) await recordVisit({ k: "d", id, t, ms: Math.round(ms) });
    return new Response(null, { status: 204 });
  }

  const path = clean(body.path, 200);
  if (!path.startsWith("/") || /^\/(admin|api|og|_next)(\/|$)/.test(path)) return new Response(null, { status: 204 });
  const vid = clean(body.vid, 40);
  const sid = clean(body.sid, 40);
  if (!/^[\w-]{6,40}$/.test(vid) || !/^[\w-]{6,40}$/.test(sid)) return new Response(null, { status: 400 });

  let ref = "";
  try {
    const r = new URL(clean(body.ref, 300));
    if (r.host && r.host !== new URL(req.url).host) ref = r.host.replace(/^www\./, "");
  } catch {}

  const name = safeDecode((await cookies()).get("hj_vn")?.value ?? "").slice(0, 40);
  await recordVisit({
    k: "v",
    id,
    t,
    vid,
    sid,
    path,
    ip,
    country: clean(h.get("x-vercel-ip-country"), 3),
    region: safeDecode(clean(h.get("x-vercel-ip-country-region"), 40)),
    city: safeDecode(clean(h.get("x-vercel-ip-city"), 60)),
    ...parseUA(ua),
    ref,
    name,
  });
  return new Response(null, { status: 204 });
}
