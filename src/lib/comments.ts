import "server-only";
import { getJSON, setJSON } from "./store";

export type Comment = { id: string; name: string; text: string; date: string };
type All = Record<string, Comment[]>;

export async function getAllComments() {
  return getJSON<All>("comments", {});
}

export async function getComments(slug: string) {
  return ((await getAllComments())[slug] ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
}

export async function addCommentTo(slug: string, c: Comment) {
  const all = await getAllComments();
  all[slug] = [...(all[slug] ?? []), c];
  await setJSON("comments", all);
}

export async function removeComment(slug: string, id: string) {
  const all = await getAllComments();
  all[slug] = (all[slug] ?? []).filter((c) => c.id !== id);
  if (!all[slug].length) delete all[slug];
  await setJSON("comments", all);
}
