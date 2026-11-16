"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin, rateLimit } from "@/lib/auth";
import { checkGatePassword, grantAccess } from "@/lib/gate";
import { isBot, recordVisit, requestInfo } from "@/lib/visits";

/** Anota el intento (quién, cuándo y si acertó). Lo que escribieron nunca se guarda. */
async function logAttempt(form: FormData, ok: boolean, limited: boolean) {
  try {
    const h = await headers();
    if (isBot(h.get("user-agent") ?? "") || (await isAdmin())) return;
    const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const ids = (k: string) => (/^[\w-]{6,40}$/.test(String(form.get(k) || "")) ? String(form.get(k)) : "");
    const to = String(form.get("next") || "").slice(0, 200);
    const { ip, country, region, city, device, os, browser } = requestInfo(h);
    await recordVisit({ k: "g", id, t: new Date().toISOString(), vid: ids("vid"), sid: ids("sid"), to, ok, limited, ip, country, region, city, device, os, browser });
  } catch {}
}

export async function unlockStory(_prev: { error?: string }, form: FormData) {
  const ip = ((await headers()).get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!rateLimit(`gate:${ip}`, 8, 10 * 60_000)) {
    await logAttempt(form, false, true);
    return { error: "Demasiados intentos. Espera unos minutos." };
  }
  if (!checkGatePassword(String(form.get("password") || ""))) {
    await logAttempt(form, false, false);
    return { error: "Contraseña incorrecta." };
  }
  await logAttempt(form, true, false);
  await grantAccess();
  const next = String(form.get("next") || "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}
