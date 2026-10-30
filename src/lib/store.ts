import "server-only";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/**
 * Almacén clave → JSON.
 * - Con UPSTASH_REDIS_REST_URL/TOKEN (o KV_REST_API_*) usa Redis (producción en Vercel).
 * - Sin ellos usa un archivo local (.data/store.json) para desarrollo.
 */
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const storeKind: "redis" | "file" = url && token ? "redis" : "file";

async function redis<T = string | null>(cmd: string[]) {
  const res = await fetch(url!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result as T;
}

const file = process.env.VERCEL ? path.join(os.tmpdir(), "hojalata-store.json") : path.join(process.cwd(), ".data", "store.json");
let chain: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, unknown>) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(all, null, 1));
}

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  if (storeKind === "redis") {
    const raw = await redis(["GET", `hojalata:${key}`]);
    return raw ? (JSON.parse(raw) as T) : fallback;
  }
  const all = await readAll();
  return (all[key] as T) ?? fallback;
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  if (storeKind === "redis") {
    await redis(["SET", `hojalata:${key}`, JSON.stringify(value)]);
    return;
  }
  chain = chain.then(async () => {
    const all = await readAll();
    all[key] = value;
    await writeAll(all);
  });
  await chain;
}

/** Lee, transforma y guarda en serie (evita pisar escrituras cercanas). */
export async function updateJSON<T>(key: string, fallback: T, fn: (cur: T) => T): Promise<T> {
  const next = fn(await getJSON(key, fallback));
  await setJSON(key, next);
  return next;
}

/** Registro de eventos: agrega al inicio (lo más nuevo primero) y conserva solo los últimos `max`. */
export async function pushLog(key: string, value: unknown, max = 20000): Promise<void> {
  if (storeKind === "redis") {
    const k = `hojalata:${key}`;
    await redis(["LPUSH", k, JSON.stringify(value)]);
    if (Math.random() < 0.02) await redis(["LTRIM", k, "0", String(max - 1)]);
    return;
  }
  chain = chain.then(async () => {
    const all = await readAll();
    const list = (all[key] as unknown[] | undefined) ?? [];
    list.unshift(value);
    all[key] = list.slice(0, max);
    await writeAll(all);
  });
  await chain;
}

export async function getLog<T>(key: string, n = 10000): Promise<T[]> {
  if (storeKind === "redis") {
    const rows = await redis<string[]>(["LRANGE", `hojalata:${key}`, "0", String(n - 1)]);
    return (rows ?? []).map((r) => JSON.parse(r) as T);
  }
  const all = await readAll();
  return ((all[key] as T[] | undefined) ?? []).slice(0, n);
}
