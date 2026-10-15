import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX = 12 * 1024 * 1024;

function privateHost(host: string) {
  return /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1)/i.test(host) || host.endsWith(".local");
}

/** Sube una imagen (archivo) o la importa desde un enlace; devuelve su URL final. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    let input: Buffer;
    const type = req.headers.get("content-type") || "";
    if (type.startsWith("multipart/")) {
      const file = (await req.formData()).get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
      if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
      input = Buffer.from(await file.arrayBuffer());
    } else {
      const { url } = (await req.json()) as { url?: string };
      let u: URL;
      try {
        u = new URL(String(url));
      } catch {
        return NextResponse.json({ error: "El enlace no es válido" }, { status: 400 });
      }
      if (!/^https?:$/.test(u.protocol) || privateHost(u.hostname)) return NextResponse.json({ error: "Enlace no permitido" }, { status: 400 });
      const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 hojalata-importer" }, signal: AbortSignal.timeout(15000) });
      if (!r.ok) return NextResponse.json({ error: `No se pudo descargar la imagen (${r.status})` }, { status: 400 });
      if (!(r.headers.get("content-type") || "").startsWith("image/")) return NextResponse.json({ error: "El enlace no apunta a una imagen" }, { status: 400 });
      input = Buffer.from(await r.arrayBuffer());
    }
    if (input.length > MAX) return NextResponse.json({ error: "La imagen pesa más de 12 MB" }, { status: 400 });

    const meta = await sharp(input).metadata();
    const isGif = meta.format === "gif";
    const out = isGif ? input : await sharp(input).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    const info = isGif ? meta : await sharp(out).metadata();
    const name = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}.${isGif ? "gif" : "webp"}`;

    let url: string;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      url = (await put(`hojalata/${name}`, out, { access: "public", contentType: isGif ? "image/gif" : "image/webp" })).url;
    } else if (process.env.VERCEL) {
      return NextResponse.json({ error: "Falta conectar Vercel Blob (BLOB_READ_WRITE_TOKEN) para guardar imágenes." }, { status: 500 });
    } else {
      const dir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, name), out);
      url = `/uploads/${name}`;
    }
    return NextResponse.json({ url, width: info.width, height: info.height });
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
  }
}
