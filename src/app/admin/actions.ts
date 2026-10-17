"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { checkPassword, endSession, rateLimit, requireAdmin, startSession } from "@/lib/auth";
import { removeComment, setReply } from "@/lib/comments";
import { getIdeas, saveIdeas, type Idea } from "@/lib/ideas";
import { sanitizeHtml } from "@/lib/sanitize";
import { getJSON, setJSON } from "@/lib/store";
import { deriveFields, getCustomStories, saveCustomStories, setWip, uniqueSlug, type CoverSize, type CoverStyle, type Section, type StoredStory } from "@/lib/stories";

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

const PUBLIC_PATHS = ["/", "/cuentos", "/textamentos", "/ensayos"];
function revalidateAll(slug?: string) {
  for (const p of PUBLIC_PATHS) revalidatePath(p);
  revalidatePath("/admin");
  if (slug) for (const base of ["/cuentos", "/textamentos", "/ensayos"]) revalidatePath(`${base}/${slug}`);
}

export type SaveInput = {
  originalSlug?: string;
  title: string;
  html: string;
  cover: string | null;
  draft: boolean;
  section?: Section;
  coverStyle?: CoverStyle;
  coverSize?: CoverSize;
};

const style = (v?: string): CoverStyle => (["right", "left", "center", "banner"].includes(v ?? "") ? (v as CoverStyle) : "right");
const size = (v?: string): CoverSize => (["s", "m", "l"].includes(v ?? "") ? (v as CoverSize) : "m");
const cleanCover = (c: string | null) => (c && /^(https?:\/\/|\/)/.test(c) ? c : null);
const sectionOf = (s?: string): Section | undefined => (s === "textamento" || s === "ensayo" ? s : undefined);

/** Guardado explícito: publicar o dejar como borrador. Limpia la copia de trabajo. */
export async function saveStory(input: SaveInput): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await requireAdmin();
  const title = input.title.trim().slice(0, 120);
  const html = sanitizeHtml(input.html);
  if (!title) return { ok: false, error: "Ponle un título al texto." };
  if (!html) return { ok: false, error: "El texto está vacío." };

  const list = await getCustomStories();
  const existing = input.originalSlug ? list.find((s) => s.slug === input.originalSlug) : undefined;
  if (input.originalSlug && !existing) return { ok: false, error: "Solo se pueden editar los textos creados desde el panel." };

  let slug = existing?.slug;
  // Un borrador que nació sin título toma su dirección del título definitivo
  if (!slug || (existing?.draft && /^sin-titulo(-\d+)?$/.test(slug))) {
    slug = uniqueSlug(title, list.filter((s) => s.slug !== existing?.slug));
  }

  const story: StoredStory = {
    id: existing?.id ?? Date.now(),
    slug,
    title,
    date: existing?.date ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    html,
    cover: cleanCover(input.cover),
    ...deriveFields(html),
    custom: true,
    coverStyle: style(input.coverStyle),
    coverSize: size(input.coverSize),
    section: existing ? existing.section : sectionOf(input.section),
    draft: input.draft || undefined,
  };
  // Al publicar por primera vez, la fecha pública es la de hoy
  if (existing?.draft && !input.draft) story.date = new Date().toISOString();

  await saveCustomStories(existing ? list.map((s) => (s.slug === existing.slug ? story : s)) : [story, ...list]);
  await setWip(existing?.slug ?? slug, null);
  revalidateAll(slug);
  return { ok: true, slug };
}

export type AutosaveResult = { ok: true; slug: string | null; savedAt: string } | { ok: false; error: string };

/**
 * Autoguardado. Nunca publica nada:
 *  - texto nuevo → crea un borrador y devuelve su slug;
 *  - borrador existente → lo actualiza;
 *  - texto publicado → guarda una copia de trabajo aparte (la versión pública no cambia).
 */
export async function autosaveStory(input: SaveInput): Promise<AutosaveResult> {
  await requireAdmin();
  const savedAt = new Date().toISOString();
  const title = input.title.trim().slice(0, 120);
  const html = sanitizeHtml(input.html);
  const list = await getCustomStories();
  const existing = input.originalSlug ? list.find((s) => s.slug === input.originalSlug) : undefined;

  if (input.originalSlug && !existing) return { ok: false, error: "Este texto ya no existe." };

  if (!existing) {
    if (!title && !html) return { ok: true, slug: null, savedAt }; // nada que guardar todavía
    const slug = uniqueSlug(title || "sin título", list);
    const story: StoredStory = {
      id: Date.now(),
      slug,
      title: title || "Sin título",
      date: savedAt,
      updatedAt: savedAt,
      html: html || "<p></p>",
      cover: cleanCover(input.cover),
      ...deriveFields(html || ""),
      custom: true,
      coverStyle: style(input.coverStyle),
      coverSize: size(input.coverSize),
      section: sectionOf(input.section),
      draft: true,
    };
    await saveCustomStories([story, ...list]);
    revalidatePath("/admin");
    return { ok: true, slug, savedAt };
  }

  if (existing.draft) {
    const next: StoredStory = {
      ...existing,
      title: title || existing.title,
      html: html || "<p></p>",
      cover: cleanCover(input.cover),
      ...deriveFields(html || ""),
      coverStyle: style(input.coverStyle),
      coverSize: size(input.coverSize),
      updatedAt: savedAt,
    };
    await saveCustomStories(list.map((s) => (s.slug === existing.slug ? next : s)));
    return { ok: true, slug: existing.slug, savedAt };
  }

  await setWip(existing.slug, { title: title || existing.title, html, cover: cleanCover(input.cover), coverStyle: style(input.coverStyle), coverSize: size(input.coverSize), savedAt });
  return { ok: true, slug: existing.slug, savedAt };
}

/** Publicar un borrador o volver un texto publicado a borrador, sin tocar el contenido. */
export async function setDraftStatus(slug: string, draft: boolean) {
  await requireAdmin();
  const list = await getCustomStories();
  const s = list.find((x) => x.slug === slug);
  if (!s) return;
  if (s.draft && !draft) s.date = new Date().toISOString();
  s.draft = draft || undefined;
  s.updatedAt = new Date().toISOString();
  await saveCustomStories(list);
  revalidateAll(slug);
}

export async function discardWip(slug: string) {
  await requireAdmin();
  await setWip(slug, null);
}

/** Elimina un texto; antes guarda una copia en la papelera por si fue un error. */
export async function deleteStory(slug: string) {
  await requireAdmin();
  const list = await getCustomStories();
  const gone = list.find((s) => s.slug === slug);
  if (gone) {
    const trash = await getJSON<(StoredStory & { deletedAt: string })[]>("trash", []);
    await setJSON("trash", [{ ...gone, deletedAt: new Date().toISOString() }, ...trash].slice(0, 100));
  }
  await saveCustomStories(list.filter((s) => s.slug !== slug));
  await setWip(slug, null);
  revalidateAll(slug);
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

/* ───────── Cuaderno de ideas ───────── */

export async function addIdea(title: string, text: string): Promise<{ ok: true; idea: Idea } | { ok: false; error: string }> {
  await requireAdmin();
  const t = text.trim().slice(0, 20000);
  if (!t && !title.trim()) return { ok: false, error: "Escribe algo para guardar la idea." };
  const now = new Date().toISOString();
  const idea: Idea = { id: crypto.randomUUID(), title: title.trim().slice(0, 120), text: t, date: now, updatedAt: now };
  await saveIdeas([idea, ...(await getIdeas())]);
  revalidatePath("/admin/ideas");
  return { ok: true, idea };
}

export async function updateIdea(id: string, title: string, text: string): Promise<{ ok: boolean; savedAt?: string }> {
  await requireAdmin();
  const list = await getIdeas();
  const i = list.find((x) => x.id === id);
  if (!i) return { ok: false };
  i.title = title.trim().slice(0, 120);
  i.text = text.slice(0, 20000);
  i.updatedAt = new Date().toISOString();
  await saveIdeas(list);
  return { ok: true, savedAt: i.updatedAt };
}

export async function deleteIdea(id: string) {
  await requireAdmin();
  await saveIdeas((await getIdeas()).filter((x) => x.id !== id));
  revalidatePath("/admin/ideas");
}

/** Crea un borrador a partir de una idea y devuelve su slug para abrirlo en el editor. */
export async function ideaToDraft(id: string): Promise<{ ok: true; slug: string } | { ok: false }> {
  await requireAdmin();
  const ideas = await getIdeas();
  const idea = ideas.find((x) => x.id === id);
  if (!idea) return { ok: false };
  const list = await getCustomStories();
  const now = new Date().toISOString();
  const html = sanitizeHtml(idea.text.split(/\n{2,}/).map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`).join("")) || "<p></p>";
  const slug = uniqueSlug(idea.title || "sin título", list);
  const story: StoredStory = {
    id: Date.now(), slug, title: idea.title || "Sin título", date: now, updatedAt: now, html, cover: null,
    ...deriveFields(html), custom: true, coverStyle: "right", coverSize: "m", draft: true,
  };
  await saveCustomStories([story, ...list]);
  idea.storySlug = slug;
  await saveIdeas(ideas);
  revalidatePath("/admin");
  revalidatePath("/admin/ideas");
  return { ok: true, slug };
}
