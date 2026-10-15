"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { addCommentTo } from "@/lib/comments";
import { getStory } from "@/lib/stories";
import { rateLimit } from "@/lib/auth";

export type CommentState = { ok: boolean; error?: string; message?: string };

export async function addComment(_prev: CommentState, form: FormData): Promise<CommentState> {
  const slug = String(form.get("slug") || "");
  const name = String(form.get("name") || "").trim().replace(/\s+/g, " ").slice(0, 40) || "Visitante";
  const text = String(form.get("text") || "").trim().slice(0, 1500);

  if (String(form.get("web") || "")) return { ok: true }; // señuelo para bots
  if (text.length < 2) return { ok: false, error: "Escribe algo antes de enviar." };
  if ((text.match(/https?:\/\//gi) || []).length > 1) return { ok: false, error: "Por favor, no más de un enlace." };
  if (!(await getStory(slug))) return { ok: false, error: "Ese cuento ya no existe." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!rateLimit(`c:${ip}`, 3, 60_000) || !rateLimit(`ch:${ip}`, 12, 3_600_000)) {
    return { ok: false, error: "Vas muy rápido. Espera un momento e inténtalo otra vez." };
  }

  await addCommentTo(slug, { id: crypto.randomUUID(), name, text, date: new Date().toISOString() });
  revalidatePath(`/cuentos/${slug}`);
  return { ok: true, message: "¡Gracias! Tu comentario ya está publicado." };
}
