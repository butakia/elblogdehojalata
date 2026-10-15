import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "hj_admin";

/** En desarrollo la clave por defecto es "hojalata". En producción hay que definir ADMIN_PASSWORD. */
function password() {
  return process.env.ADMIN_PASSWORD ?? (process.env.NODE_ENV !== "production" ? "hojalata" : null);
}

export const adminEnabled = () => password() !== null;

function sign() {
  return crypto.createHmac("sha256", (process.env.ADMIN_SECRET || password() || "") + "|hojalata").update("admin:v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function checkPassword(input: string) {
  const p = password();
  return p !== null && safeEqual(crypto.createHash("sha256").update(input).digest("hex"), crypto.createHash("sha256").update(p).digest("hex"));
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  return !!v && safeEqual(v, sign());
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startSession() {
  (await cookies()).set(COOKIE, sign(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Limitador sencillo en memoria: máx. `max` eventos por `windowMs` para una clave. */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return false;
  }
  list.push(now);
  hits.set(key, list);
  return true;
}
