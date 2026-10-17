export type Uploaded = { url: string; width?: number; height?: number };

async function send(init: RequestInit): Promise<Uploaded> {
  const res = await fetch("/api/admin/upload", { method: "POST", ...init });
  const json = await res.json().catch(() => ({}));
  if (res.status === 413) throw new Error("La imagen pesa demasiado. Prueba con una más pequeña.");
  if (!res.ok) throw new Error(json.error || "No se pudo subir la imagen");
  return json;
}

const LIMIT = 1.8 * 1024 * 1024; // Vercel acepta cuerpos de hasta ~4,5 MB; mantenemos margen

/** Reduce fotos grandes antes de subirlas (máx. 2000 px, WebP). Los GIF se envían tal cual. */
async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif" || file.size <= LIMIT) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    for (const q of [0.86, 0.74, 0.6]) {
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", q));
      if (blob && blob.size <= LIMIT) return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
    }
  } catch {
    /* si el navegador no puede reducirla, se envía original */
  }
  return file;
}

export async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", await shrink(file));
  return send({ body: fd });
}

export function importUrl(url: string) {
  return send({ headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
}
