import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { isAdmin } from "./auth";

/**
 * Candado sencillo para la sección Textamentos.
 * La contraseña no se guarda en texto plano: solo su huella. Se puede cambiar definiendo
 * la variable TEXTAMENTOS_PASSWORD en el servidor (tiene prioridad sobre la de fábrica).
 */
const COOKIE = "hj_tx";
const SALT = "hojalata-textamentos:";
const DEFAULT_HASH = "8c88f8835892043c2aa7933e91b5630cf075cf2a6fdc2c3e6e46b18ef7b9c660";

// Se ignoran mayúsculas y espacios: "El Blog de Hojalata 123" y "elblogdehojalata123" son equivalentes
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const hash = (s: string) => crypto.createHash("sha256").update(SALT + normalize(s)).digest("hex");
const expected = () => (process.env.TEXTAMENTOS_PASSWORD ? hash(process.env.TEXTAMENTOS_PASSWORD) : DEFAULT_HASH);

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const token = () =>
  crypto.createHmac("sha256", (process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev") + "|gate").update(expected()).digest("hex");

export const checkGatePassword = (input: string) => safeEqual(hash(input), expected());

/** ¿Puede ver Textamentos? El administrador siempre; los demás, tras escribir la contraseña. */
export async function isUnlocked() {
  if (await isAdmin()) return true;
  const v = (await cookies()).get(COOKIE)?.value;
  return !!v && safeEqual(v, token());
}

export async function grantAccess() {
  (await cookies()).set(COOKIE, token(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
