import type { Metadata } from "next";
import StoryForm from "@/components/admin/StoryForm";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Nuevo cuento", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Nuevo() {
  await requireAdmin();
  return (
    <div className="wrap section">
      <header className="page-head">
        <h1>Nuevo cuento</h1>
      </header>
      <StoryForm />
    </div>
  );
}
