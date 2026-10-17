import type { Metadata } from "next";
import StoryForm from "@/components/admin/StoryForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Nueva publicación", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Nuevo({ searchParams }: { searchParams: Promise<{ seccion?: string }> }) {
  await requireAdmin();
  const section = (await searchParams).seccion === "textamento" ? "textamento" : "cuento";
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>{section === "textamento" ? "Nuevo textamento" : "Nuevo cuento"}</h1>
      </header>
      <StoryForm section={section} />
    </div>
  );
}
