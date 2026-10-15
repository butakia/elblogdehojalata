export type Uploaded = { url: string; width?: number; height?: number };

async function send(init: RequestInit): Promise<Uploaded> {
  const res = await fetch("/api/admin/upload", { method: "POST", ...init });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "No se pudo subir la imagen");
  return json;
}

export function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  return send({ body: fd });
}

export function importUrl(url: string) {
  return send({ headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
}
