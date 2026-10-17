import type { Metadata } from "next";
import StoryView from "@/components/StoryView";
import { getStory } from "@/lib/stories";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const story = await getStory((await params).slug);
  if (!story) return {};
  return { title: story.title, description: story.excerpt, openGraph: { title: story.title, description: story.excerpt, images: story.cover ? [story.cover] : undefined } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <StoryView slug={(await params).slug} section="ensayo" />;
}
