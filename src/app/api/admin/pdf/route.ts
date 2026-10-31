import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { storyPdf } from "@/lib/pdf";
import { getStory, slugify } from "@/lib/stories";

export const dynamic = "force-dynamic";

/** PDF de un texto (solo administrador): /api/admin/pdf?slug=el-encanto-de-los-muertos */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  const story = await getStory(slug);
  if (!story) return NextResponse.json({ error: "No existe ese texto" }, { status: 404 });

  const bytes = await storyPdf({ title: story.title, html: story.html });
  const name = slugify(story.title);
  return new Response(Buffer.from(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}.pdf"`, "Cache-Control": "no-store" },
  });
}
