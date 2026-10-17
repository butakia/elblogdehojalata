import sharp from "sharp";
import { getStory } from "@/lib/stories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const W = 1200;
const H = 630;
const BG = "#15171b";

/** Lee una imagen: rutas del propio sitio por HTTP (en Vercel los archivos públicos no están en disco) o URL externa. */
async function readImage(src: string, origin: string): Promise<Buffer | null> {
  try {
    const url = src.startsWith("/") ? new URL(src, origin).toString() : src;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function fallback(origin: string) {
  const cat = await readImage("/img/gato-blanco.png", origin);
  const base = sharp({ create: { width: W, height: H, channels: 3, background: BG } });
  if (!cat) return base.jpeg({ quality: 86 }).toBuffer();
  const resized = await sharp(cat).resize({ height: 460 }).toBuffer();
  return base.composite([{ input: resized, gravity: "center" }]).jpeg({ quality: 86 }).toBuffer();
}

/** Imagen 1200x630 para las vistas previas al compartir: la imagen del texto o, si no tiene, el gato. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const origin = new URL(req.url).origin;
  let out: Buffer | null = null;

  if (slug !== "default") {
    const story = await getStory(slug);
    if (story && !story.draft && story.cover) {
      const src = await readImage(story.cover, origin);
      if (src) {
        try {
          out = await sharp(src).rotate().resize(W, H, { fit: "cover", position: "attention" }).jpeg({ quality: 84 }).toBuffer();
        } catch {}
      }
    }
  }
  if (!out) out = await fallback(origin);

  return new Response(new Uint8Array(out), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
