import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getAllComments } from "@/lib/comments";
import { getIdeas, ideasMarkdown } from "@/lib/ideas";
import { getJSON } from "@/lib/store";
import { getCustomStories } from "@/lib/stories";

export const dynamic = "force-dynamic";

/** Descarga de respaldo (solo administrador): ideas en Markdown o todo en JSON. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const type = new URL(req.url).searchParams.get("type");
  const day = new Date().toISOString().slice(0, 10);

  if (type === "ideas") {
    return new NextResponse(ideasMarkdown(await getIdeas()), {
      headers: { "Content-Type": "text/markdown; charset=utf-8", "Content-Disposition": `attachment; filename="ideas-${day}.md"` },
    });
  }

  const data = {
    exportedAt: new Date().toISOString(),
    stories: await getCustomStories(),
    ideas: await getIdeas(),
    comments: await getAllComments(),
    wip: await getJSON("wip", {}),
    trash: await getJSON("trash", []),
  };
  return new NextResponse(JSON.stringify(data, null, 1), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="respaldo-hojalata-${day}.json"` },
  });
}
