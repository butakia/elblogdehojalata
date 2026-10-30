"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/auth";
import { checkGatePassword, grantAccess } from "@/lib/gate";

export async function unlockStory(_prev: { error?: string }, form: FormData) {
  const ip = ((await headers()).get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!rateLimit(`gate:${ip}`, 8, 10 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos." };
  if (!checkGatePassword(String(form.get("password") || ""))) return { error: "Contraseña incorrecta." };
  await grantAccess();
  const next = String(form.get("next") || "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
