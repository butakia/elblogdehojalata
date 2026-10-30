import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { isAdmin } from "./auth";

/**
 * Candado de los cuentos con contraseña (ver locked.ts).
 * La contraseña no se guarda en texto plano: solo su huella. Es numérica y se comparan solo los dígitos,
 * así "04-03-21", "04/03/21" y "040321" valen lo mismo. Se puede cambiar con la variable STORY_PASSWORD.
 */
const COOKIE = "hj_lk";
const SALT = "hojalata-cuentos:";
const DEFAULT_HASH = "091eacd8cd52078f5e1f47acf23ce67c150435c97a2324950540790d2ebc6176";

const hash = (s: string) => crypto.createHash("sha256").update(SALT + s.replace(/\D/g, "")).digest("hex");
const expected = () => (process.env.STORY_PASSWORD ? hash(process.env.STORY_PASSWORD) : DEFAULT_HASH);

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const token = () =>
  crypto.createHmac("sha256", (process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev") + "|gate2").update(expected()).digest("hex");

export const checkGatePassword = (input: string) => /\d/.test(input) && safeEqual(hash(input), expected());

/** ¿Puede leer los cuentos con contraseña? El administrador siempre; los demás, tras escribirla. */
export async function isUnlocked() {
  if (await isAdmin()) return true;
  const v = (await cookies()).get(COOKIE)?.value;
  return !!v && safeEqual(v, token());
}

export async function grantAccess() {
  (await cookies()).set(COOKIE, token(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
