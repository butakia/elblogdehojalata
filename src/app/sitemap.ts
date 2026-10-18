import type { MetadataRoute } from "next";
import { getCustomStories, getStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : `http://localhost:${process.env.PORT ?? 3100}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site();
  const pages = ["", "/cuentos", "/libros", "/ensayos", "/proyectos", "/sobre"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));
  const stories = (await getStories()).map((s) => ({ url: `${base}/cuentos/${s.slug}`, lastModified: s.date, priority: 0.6 }));
  const others = (await getCustomStories())
    .filter((s) => !s.draft && s.section === "ensayo")
    .map((s) => ({ url: `${base}/${s.section === "ensayo" ? "ensayos" : "textamentos"}/${s.slug}`, lastModified: s.updatedAt ?? s.date, priority: 0.5 }));
  return [...pages, ...stories, ...others];
}
