import stories from "../../content/stories.json";

export type Story = {
  id: number;
  slug: string;
  title: string;
  date: string;
  html: string;
  cover: string | null;
  excerpt: string;
  words: number;
  minutes: number;
  kind: string;
  /** Si se define, se muestra este número de lecturas en vez del simulado. */
  views?: number;
};

export const allStories = stories as unknown as Story[];

export const LOGO = "/img/2021-06-elgatoblanco.webp";
export const AUTHOR = "Angel Oliden";
export const AUTHOR_PHOTO = "/img/autor-angel-oliden.webp";
export const INSTAGRAM = "elhombrede_hojalata";
export const CONTACT_EMAIL = "omaroliden1@gmail.com";

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(new Date(iso));
}

/** Quita del cuerpo la imagen que ya se muestra como portada. */
export function bodyWithoutCover(html: string, cover: string | null) {
  if (!cover) return html;
  const esc = cover.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(new RegExp(`<figure>\\s*<img[^>]*src="${esc}"[^>]*>\\s*</figure>`), "");
}
