import type { Metadata } from "next";
import StoryView from "@/components/StoryView";
import { getStory } from "@/lib/stories";
import { shareMetadata } from "@/lib/meta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const story = await getStory((await params).slug);
  if (!story || story.draft) return { title: "Borrador", robots: { index: false } };
  return shareMetadata(story, "/textamentos");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <StoryView slug={(await params).slug} section="textamento" />;
}
