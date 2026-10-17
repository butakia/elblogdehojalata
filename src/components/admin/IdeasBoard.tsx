"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { addIdea, deleteIdea, ideaToDraft, updateIdea } from "@/app/admin/actions";

type Idea = { id: string; title: string; text: string; date: string; updatedAt: string; storySlug?: string };

const KEY = "hj-idea-new";
const when = (iso: string) => new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });

export default function IdeasBoard({ initial }: { initial: Idea[] }) {
  const [ideas, setIdeas] = useState(initial);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const loaded = useRef(false);

  // El texto que aún no guardaste sobrevive a un cierre accidental
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw) as { title: string; text: string };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(d.title || "");
        setText(d.text || "");
      }
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      if (title || text) localStorage.setItem(KEY, JSON.stringify({ title, text }));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [title, text]);

  function add() {
    setMsg("");
    start(async () => {
      const res = await addIdea(title, text);
      if (!res.ok) return setMsg(res.error);
      setIdeas((l) => [res.idea, ...l]);
      setTitle("");
      setText("");
      try { localStorage.removeItem(KEY); } catch {}
      setMsg("Idea guardada.");
    });
  }

  return (
    <div className="ideas">
      <form className="idea-new" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la idea (opcional)" maxLength={120} />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Escribe la idea aquí: una escena, un personaje, una frase, un final posible…" />
        <div className="form-row">
          <button className="btn primary" disabled={pending}>Guardar idea</button>
          <span className="muted" role="status">{msg || (title || text ? "Lo que escribes se conserva en este dispositivo hasta que lo guardes." : "")}</span>
        </div>
      </form>

      {ideas.length === 0 ? (
        <p className="empty-note">Aún no tienes ideas guardadas.</p>
      ) : (
        <ul className="idea-list">
          {ideas.map((i) => (
            <IdeaCard key={i.id} idea={i} onGone={() => setIdeas((l) => l.filter((x) => x.id !== i.id))} onLinked={(slug) => setIdeas((l) => l.map((x) => (x.id === i.id ? { ...x, storySlug: slug } : x)))} />
          ))}
        </ul>
      )}
    </div>
  );
}

function IdeaCard({ idea, onGone, onLinked }: { idea: Idea; onGone: () => void; onLinked: (slug: string) => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(idea.title);
  const [text, setText] = useState(idea.text);
  const [state, setState] = useState<"saved" | "dirty" | "saving">("saved");
  const [pending, start] = useTransition();
  const last = useRef(JSON.stringify([idea.title, idea.text]));
  const mounted = useRef(false);

  // Autoguardado de cada idea
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const snap = JSON.stringify([title, text]);
    if (snap === last.current) return;
    setState("dirty");
    const t = setTimeout(async () => {
      setState("saving");
      const r = await updateIdea(idea.id, title, text);
      if (r.ok) { last.current = snap; setState("saved"); } else setState("dirty");
    }, 1200);
    return () => clearTimeout(t);
  }, [title, text, idea.id]);

  return (
    <li className="idea-card">
      <input className="idea-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sin título" maxLength={120} />
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={Math.min(14, Math.max(3, text.split("\n").length + 1))} />
      <div className="idea-foot">
        <small className="muted">{when(idea.date)} · {state === "saved" ? "guardada" : state === "saving" ? "guardando…" : "sin guardar…"}</small>
        <div className="row-actions">
          {idea.storySlug ? (
            <Link href={`/admin/editar/${idea.storySlug}`}>Abrir borrador</Link>
          ) : (
            <button className="linklike" disabled={pending} onClick={() => start(async () => { const r = await ideaToDraft(idea.id); if (r.ok) { onLinked(r.slug); router.push(`/admin/editar/${r.slug}`); } })}>
              Convertir en cuento
            </button>
          )}
          <button className="link-danger" disabled={pending} onClick={() => confirm("¿Eliminar esta idea?") && start(async () => { await deleteIdea(idea.id); onGone(); })}>
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}
