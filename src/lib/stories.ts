import "server-only";
import { allStories, type Story } from "./content";
import { getJSON, setJSON } from "./store";
import { plainText } from "./sanitize";

export type Section = "cuento" | "textamento";
export type StoredStory = Story & { custom: true; draft?: boolean; section?: Section };

export async function getCustomStories() {
  return getJSON<StoredStory[]>("stories", []);
}

export async function saveCustomStories(list: StoredStory[]) {
  await setJSON("stories", list);
}

/** Cuentos importados del blog original + los publicados desde el panel. */
export async function getStories({ includeDrafts = false } = {}): Promise<Story[]> {
  const custom = (await getCustomStories()).filter((s) => (includeDrafts || !s.draft) && s.section !== "textamento");
  return [...custom, ...allStories].sort((a, b) => b.date.localeCompare(a.date));
}

/** Textamentos: el blog de pensamientos, proyectos y notas. */
export async function getPosts({ includeDrafts = false } = {}): Promise<StoredStory[]> {
  return (await getCustomStories()).filter((s) => s.section === "textamento" && (includeDrafts || !s.draft)).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getStory(slug: string) {
  const all = [...(await getCustomStories()), ...allStories] as (Story & { draft?: boolean; section?: Section })[];
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
      .slice(0, 70) || "cuento"
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
