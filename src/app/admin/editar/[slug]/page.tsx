import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryForm from "@/components/admin/StoryForm";
import { requireAdmin } from "@/lib/auth";
import { getCustomStories } from "@/lib/stories";

export const metadata: Metadata = { title: "Editar cuento", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Editar({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const story = (await getCustomStories()).find((s) => s.slug === slug);
  if (!story) notFound();
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>Editar cuento</h1>
      </header>
      <StoryForm section={story.section === "textamento" ? "textamento" : "cuento"} story={{ slug: story.slug, title: story.title, html: story.html, cover: story.cover, draft: !!story.draft }} />
    </div>
  );
}
