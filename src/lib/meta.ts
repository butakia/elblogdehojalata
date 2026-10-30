import type { Metadata } from "next";
import { isLockedSlug } from "./locked";

export const SITE_NAME = "El blog de Hojalata";

/** Texto para vistas previas: sin rayas largas, en una línea y con largo razonable. */
export function cleanForMeta(text: string, max = 160) {
  const t = text
    .replace(/[—–‒―]/g, " ")
    .replace(/[«»"“”]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim()
    .replace(/^[,.;:\s-]+/, "");
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s\S*$/, "").replace(/[,;:.\s]+$/, "") + "…";
}

type Shareable = { slug: string; title: string; excerpt: string };

/** Título, resumen e imagen del texto al compartir el enlace (WhatsApp, Facebook, etc.). */
export function shareMetadata(story: Shareable, base: string): Metadata {
  const locked = isLockedSlug(story.slug);
  const description = locked ? "Cuento con contraseña." : cleanForMeta(story.excerpt) || SITE_NAME;
  const image = { url: locked ? "/og/default" : `/og/${story.slug}`, width: 1200, height: 630, alt: story.title };
  return {
    title: story.title,
    description,
    alternates: { canonical: `${base}/${story.slug}` },
    openGraph: { type: "article", siteName: SITE_NAME, locale: "es_PE", title: story.title, description, url: `${base}/${story.slug}`, images: [image] },
    twitter: { card: "summary_large_image", title: story.title, description, images: [image.url] },
  };
}
