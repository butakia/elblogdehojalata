import type { Metadata } from "next";
import StoryBrowser from "@/components/StoryBrowser";
import { getStories } from "@/lib/stories";

export const metadata: Metadata = { title: "Cuentos" };
export const dynamic = "force-dynamic";

export default async function Cuentos() {
  const stories = await getStories({ withMicro: true });
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>Cuentos</h1>
        <p className="lead">{stories.length} textos entre cuentos y microcuentos.</p>
      </header>
      <StoryBrowser stories={stories} />
    </div>
  );
}
