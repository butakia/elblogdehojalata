import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getStory } from "@/lib/stories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const W = 1200;
const H = 630;
const BG = "#15171b";

async function readCover(src: string): Promise<Buffer | null> {
  try {
    if (src.startsWith("/")) return await fs.readFile(path.join(process.cwd(), "public", src.split("?")[0]));
    const r = await fetch(src, { signal: AbortSignal.timeout(8000) });
    return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function fallback() {
  const cat = await sharp(path.join(process.cwd(), "public", "img", "gato-blanco.png")).resize({ height: 460 }).toBuffer();
  return sharp({ create: { width: W, height: H, channels: 3, background: BG } }).composite([{ input: cat, gravity: "center" }]).jpeg({ quality: 86 }).toBuffer();
}

/** Imagen 1200x630 para las vistas previas al compartir: la imagen del texto o, si no tiene, el gato. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let out: Buffer | null = null;

  if (slug !== "default") {
    const story = await getStory(slug);
    if (story && !story.draft && story.cover) {
      const src = await readCover(story.cover);
      if (src) {
        try {
          out = await sharp(src).rotate().resize(W, H, { fit: "cover", position: "attention" }).jpeg({ quality: 84 }).toBuffer();
        } catch {}
      }
    }
  }
  if (!out) out = await fallback();

  return new Response(new Uint8Array(out), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
