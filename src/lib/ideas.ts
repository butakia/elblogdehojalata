import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { getJSON, setJSON, storeKind } from "./store";

export type Idea = {
  id: string;
  title: string;
  text: string;
  date: string;
  updatedAt: string;
  /** Slug del cuento (borrador) creado a partir de esta idea */
  storySlug?: string;
};

export async function getIdeas() {
  return (await getJSON<Idea[]>("ideas", [])).sort((a, b) => b.date.localeCompare(a.date));
}

export function ideasMarkdown(list: Idea[]) {
  const when = (iso: string) => new Date(iso).toISOString().slice(0, 16).replace("T", " ");
  const body = list
    .map((i) => `## ${i.title || "(sin título)"}\n_${when(i.date)}${i.storySlug ? ` · convertida en borrador: ${i.storySlug}` : ""}_\n\n${i.text}\n`)
    .join("\n---\n\n");
  return `# Ideas de cuentos (${list.length})\n\n${body}`;
}

/** Guarda y, en desarrollo local, deja un espejo legible en ideas/ideas.md. */
export async function saveIdeas(list: Idea[]) {
  await setJSON("ideas", list);
  if (storeKind === "file" && !process.env.VERCEL) {
    try {
      const dir = path.join(process.cwd(), "ideas");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, "ideas.md"), ideasMarkdown([...list].sort((a, b) => b.date.localeCompare(a.date))), "utf8");
    } catch {}
  }
}
