import "server-only";
import { allStories, type Story } from "./content";
import { getJSON, setJSON } from "./store";
import { plainText } from "./sanitize";

export type Section = "cuento" | "textamento" | "ensayo" | "microcuento";
export type CoverStyle = "right" | "left" | "center" | "banner";
export type CoverSize = "s" | "m" | "l";
export type StoredStory = Story & {
  custom: true;
  draft?: boolean;
  section?: Section;
  coverStyle?: CoverStyle;
  coverSize?: CoverSize;
  updatedAt?: string;
};

/** Copia de trabajo (autoguardado) de un texto ya publicado: no toca la versión pública. */
export type Wip = { title: string; html: string; cover: string | null; coverStyle: CoverStyle; coverSize: CoverSize; savedAt: string };

export async function getCustomStories() {
  const list = await getJSON<StoredStory[]>("stories", []);
  // El extracto se recalcula siempre desde el texto: así los guardados antiguos también quedan con sus espacios
  return list.map((s) => ({ ...s, excerpt: deriveFields(s.html).excerpt }));
}

export async function saveCustomStories(list: StoredStory[]) {
  await setJSON("stories", list);
}

export async function getWip(slug: string): Promise<Wip | null> {
  return (await getJSON<Record<string, Wip>>("wip", {}))[slug] ?? null;
}

export async function setWip(slug: string, wip: Wip | null) {
  const all = await getJSON<Record<string, Wip>>("wip", {});
  if (wip) all[slug] = wip;
  else delete all[slug];
  await setJSON("wip", all);
}

/** Cuentos importados del blog original + los publicados desde el panel. */
export async function getStories({ includeDrafts = false } = {}): Promise<Story[]> {
  const all = await getCustomStories();
  const custom = all.filter((s) => (includeDrafts || !s.draft) && (!s.section || s.section === "cuento"));
  // Si un cuento original tiene copia propia (editada u oculta), manda la copia
  const overridden = new Set(all.map((s) => s.slug));
  return [...custom, ...allStories.filter((s) => !overridden.has(s.slug))].sort((a, b) => b.date.localeCompare(a.date));
}

/** Textamentos y ensayos: textos propios fuera de los cuentos. */
export async function getPosts({ includeDrafts = false, section = "textamento" }: { includeDrafts?: boolean; section?: Section } = {}): Promise<StoredStory[]> {
  return (await getCustomStories()).filter((s) => s.section === section && (includeDrafts || !s.draft)).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getStory(slug: string) {
  const all = [...(await getCustomStories()), ...allStories] as (Story & { draft?: boolean; section?: Section; coverStyle?: CoverStyle; coverSize?: CoverSize })[];
  return all.find((s) => s.slug === slug);
}

export function neighbours(list: Story[], slug: string) {
  const i = list.findIndex((s) => s.slug === slug);
  return { newer: list[i - 1], older: list[i + 1] };
}

export function slugify(title: string) {
  return (
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "sin-titulo"
  );
}

export function deriveFields(html: string) {
  const plain = plainText(html);
  const words = plain ? plain.split(" ").length : 0;
  return {
    words,
    minutes: Math.max(1, Math.round(words / 200)),
    kind: words < 450 ? "microcuento" : "cuento",
    excerpt: plain.length > 200 ? plain.slice(0, 200).replace(/\s\S*$/, "") + "…" : plain,
  };
}

export function uniqueSlug(title: string, list: StoredStory[]) {
  const taken = new Set([...allStories.map((s) => s.slug), ...list.map((s) => s.slug)]);
  const base = slugify(title);
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}
