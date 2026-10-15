import stories from "../../content/stories.json";
import pages from "../../content/pages.json";
import micro from "../../content/micro.json";
import dibujos from "../../content/dibujos.json";

export type Story = (typeof stories)[number] & { cover: string | null };

export const allStories = stories as Story[];
export const allPages = pages as Record<string, { title: string; html: string }>;
export const microcuentos = micro as { intro: string; items: { title: string; html: string }[] };
export const drawings = dibujos as { src: string; w: number; h: number }[];

export const LOGO = "/img/2021-06-elgatoblanco.webp";
export const AUTHOR = "Angel Oliden";
export const INSTAGRAM = "elhombrede_hojalata";


export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(new Date(iso));
}

/** Quita del cuerpo la imagen que ya se muestra como portada. */
export function bodyWithoutCover(html: string, cover: string | null) {
  if (!cover) return html;
  const esc = cover.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`<figure>\\s*<img[^>]*src="${esc}"[^>]*>\\s*</figure>`), "");
}
