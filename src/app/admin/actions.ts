"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword, endSession, rateLimit, requireAdmin, startSession } from "@/lib/auth";
import { removeComment, setReply } from "@/lib/comments";
import { sanitizeHtml } from "@/lib/sanitize";
import { deriveFields, getCustomStories, saveCustomStories, slugify, type Section, type StoredStory } from "@/lib/stories";
import { allStories } from "@/lib/content";

export async function login(_prev: { error?: string }, form: FormData) {
  const ip = ((await headers()).get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!rateLimit(`login:${ip}`, 6, 10 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos." };
  if (!checkPassword(String(form.get("password") || ""))) return { error: "Clave incorrecta." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/");
}

export type SaveInput = { originalSlug?: string; title: string; html: string; cover: string | null; draft: boolean; section?: Section };

export async function saveStory(input: SaveInput): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await requireAdmin();
  const title = input.title.trim().slice(0, 120);
  const html = sanitizeHtml(input.html);
  if (!title) return { ok: false, error: "Ponle un título al cuento." };
  if (!html) return { ok: false, error: "El cuento está vacío." };
  const cover = input.cover && /^(https?:\/\/|\/)/.test(input.cover) ? input.cover : null;

  const list = await getCustomStories();
  const existing = input.originalSlug ? list.find((s) => s.slug === input.originalSlug) : undefined;
  if (input.originalSlug && !existing) return { ok: false, error: "Solo se pueden editar los cuentos subidos desde el panel." };

  let slug = existing?.slug;
  if (!slug) {
    const taken = new Set([...allStories.map((s) => s.slug), ...list.map((s) => s.slug)]);
    const base = slugify(title);
    slug = base;
    for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  }

  const story: StoredStory = {
    id: existing?.id ?? Date.now(),
    slug,
    title,
    date: existing?.date ?? new Date().toISOString(),
    html,
    cover,
    ...deriveFields(html),
    custom: true,
    section: existing ? existing.section : input.section === "textamento" ? "textamento" : undefined,
    draft: input.draft || undefined,
  };
  await saveCustomStories(existing ? list.map((s) => (s.slug === slug ? story : s)) : [story, ...list]);
  for (const p of ["/", "/cuentos", "/textamentos", `/cuentos/${slug}`, `/textamentos/${slug}`]) revalidatePath(p);
  return { ok: true, slug };
}

export async function deleteStory(slug: string) {
  await requireAdmin();
  await saveCustomStories((await getCustomStories()).filter((s) => s.slug !== slug));
  for (const p of ["/", "/cuentos", "/textamentos", "/admin"]) revalidatePath(p);
}

export async function deleteComment(slug: string, id: string) {
  await requireAdmin();
  await removeComment(slug, id);
  revalidatePath("/admin");
  revalidatePath(`/cuentos/${slug}`);
}

/** Respuesta pública del autor. Texto vacío = quitar la respuesta. */
export async function replyToComment(slug: string, id: string, text: string) {
  await requireAdmin();
  const clean = text.trim().slice(0, 1500);
  await setReply(slug, id, clean || null);
  revalidatePath("/admin");
  revalidatePath(`/cuentos/${slug}`);
}
