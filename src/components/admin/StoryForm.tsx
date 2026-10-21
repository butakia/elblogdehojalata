"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { autosaveStory, discardWip, saveStory } from "@/app/admin/actions";
import ImageInput from "./ImageInput";
import MobilePreview from "./MobilePreview";
import RichEditor, { type EditorHandle } from "./RichEditor";

type CoverStyle = "right" | "left" | "center" | "banner";
type CoverSize = "s" | "m" | "l";
type Section = "cuento" | "textamento" | "ensayo" | "microcuento";
type Kind = "cuento" | "microcuento";
type Content = { title: string; html: string; cover: string | null; coverStyle: CoverStyle; coverSize: CoverSize; kind?: Kind };
type Initial = Content & { slug: string; draft: boolean; updatedAt?: string };
type Wip = Content & { savedAt: string };

const BASES: Record<Section, string> = { cuento: "/cuentos", textamento: "/textamentos", ensayo: "/ensayos", microcuento: "/microcuentos" };

// Comparación por texto visible (el HTML del editor y el guardado pueden diferir en detalles)
const textOf = (c: Content) => JSON.stringify([c.title.trim(), c.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(), c.cover, c.coverStyle, c.coverSize, c.kind ?? null]);
const snap = (c: Content) => JSON.stringify([c.title, c.html, c.cover, c.coverStyle, c.coverSize, c.kind ?? null]);
const hhmm = (d: Date | string) => new Date(d).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
const localKey = (slug: string | null, section: Section) => `hj-draft:${slug ?? `new-${section}`}`;

type Banner = { source: "device" | "server"; at: string; content: Content } | null;

export default function StoryForm({ story, wip, section = "cuento" }: { story?: Initial; wip?: Wip | null; section?: Section }) {
  const router = useRouter();
  const editor = useRef<EditorHandle>(null);
  const [title, setTitle] = useState(story?.title ?? "");
  const [html, setHtml] = useState(story?.html ?? "");
  const [initialHtml, setInitialHtml] = useState(story?.html ?? "");
  const [editorKey, setEditorKey] = useState(0);
  const [cover, setCover] = useState<string | null>(story?.cover ?? null);
  // Las imágenes del texto viven dentro del texto; la imagen principal se muestra como banner y miniatura
  const [coverStyle, setCoverStyle] = useState<CoverStyle>(story?.coverStyle ?? "banner");
  const [coverSize, setCoverSize] = useState<CoverSize>(story?.coverSize ?? "m");
  const [kind, setKind] = useState<Kind>(section === "microcuento" ? "microcuento" : "cuento");
  const [slug, setSlug] = useState<string | null>(story?.slug ?? null);
  const [isDraft, setIsDraft] = useState(story ? story.draft : true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "dirty" | "saving" | "saved" | "offline"; at?: string }>(
    story?.updatedAt ? { kind: "saved", at: story.updatedAt } : { kind: "idle" },
  );
  const [banner, setBanner] = useState<Banner>(null);
  const [pending, start] = useTransition();

  // Cuento normal o microcuento (los microcuentos van al Balcón); textamentos y ensayos no cambian
  const fixed = section === "textamento" || section === "ensayo";
  const effSection: Section = fixed ? section : kind;
  const content: Content = { title, html, cover, coverStyle, coverSize, kind: fixed ? undefined : kind };
  const sectionRef = useRef<Section>(effSection);
  const current = snap(content);

  const slugRef = useRef<string | null>(story?.slug ?? null);
  const latest = useRef<Content>(content);
  const lastSaved = useRef<string>(snap({ title: story?.title ?? "", html: story?.html ?? "", cover: story?.cover ?? null, coverStyle: story?.coverStyle ?? "banner", coverSize: story?.coverSize ?? "m", kind: fixed ? undefined : section === "microcuento" ? "microcuento" : "cuento" }));
  const inFlight = useRef(false);
  const again = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retry = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(false);
  const firstSync = useRef(false);
  // El editor normaliza el HTML al abrir: tomarlo como base para no guardar sin cambios reales
  const onEditor = (h: string) => {
    if (!firstSync.current) {
      firstSync.current = true;
      lastSaved.current = snap({ ...latest.current, html: h });
    }
    setHtml(h);
  };
  useEffect(() => {
    latest.current = content;
    sectionRef.current = effSection;
  });

  // ── Recuperación al abrir: copia del dispositivo o copia de trabajo del servidor ──
  useEffect(() => {
    const base = Date.parse(story?.updatedAt ?? "") || 0;
    const initialContent: Content = { title: story?.title ?? "", html: story?.html ?? "", cover: story?.cover ?? null, coverStyle: story?.coverStyle ?? "banner", coverSize: story?.coverSize ?? "m", kind: fixed ? undefined : section === "microcuento" ? "microcuento" : "cuento" };
    let found: Banner = null;
    try {
      const raw = localStorage.getItem(localKey(story?.slug ?? null, section));
      if (raw) {
        const d = JSON.parse(raw) as { t: number; c: Content };
        if (d?.c && textOf(d.c) !== textOf(initialContent) && d.t > base + 1000 && (d.c.html || d.c.title)) found = { source: "device", at: new Date(d.t).toISOString(), content: d.c };
      }
    } catch {}
    if (wip && textOf(wip) !== textOf(initialContent) && (!found || Date.parse(wip.savedAt) >= Date.parse(found.at))) found = { source: "server", at: wip.savedAt, content: wip };
    if (found) setBanner(found);
    mounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function restore(c: Content) {
    firstSync.current = true;
    setTitle(c.title);
    setHtml(c.html);
    setInitialHtml(c.html);
    setCover(c.cover);
    setCoverStyle(c.coverStyle);
    setCoverSize(c.coverSize);
    if (c.kind) setKind(c.kind);
    setEditorKey((k) => k + 1);
    setBanner(null);
    setStatus({ kind: "dirty" });
  }

  async function dismiss() {
    if (banner?.source === "server" && slugRef.current) await discardWip(slugRef.current);
    try { localStorage.removeItem(localKey(slugRef.current, section)); } catch {}
    setBanner(null);
  }

  // ── Autoguardado en el servidor (cola de una sola vuelta) ──
  const runSave = useCallback(async function run(): Promise<void> {
    if (inFlight.current) { again.current = true; return; }
    const c = latest.current;
    const mine = snap(c);
    if (mine === lastSaved.current) return;
    inFlight.current = true;
    setStatus((s) => ({ ...s, kind: "saving" }));
    try {
      const res = await autosaveStory({ originalSlug: slugRef.current ?? undefined, title: c.title, html: c.html, cover: c.cover, coverStyle: c.coverStyle, coverSize: c.coverSize, draft: true, section: sectionRef.current });
      if (!res.ok) throw new Error(res.error);
      if (res.slug && res.slug !== slugRef.current) {
        try { localStorage.removeItem(localKey(null, section)); } catch {}
        slugRef.current = res.slug;
        setSlug(res.slug);
        window.history.replaceState(null, "", `/admin/editar/${res.slug}`);
      }
      lastSaved.current = mine;
      if (snap(latest.current) === mine) { try { localStorage.removeItem(localKey(slugRef.current, section)); } catch {} }
      setStatus({ kind: snap(latest.current) === mine ? "saved" : "dirty", at: res.savedAt });
    } catch {
      setStatus((s) => ({ ...s, kind: "offline" }));
      clearTimeout(retry.current);
      retry.current = setTimeout(run, 8000);
    } finally {
      inFlight.current = false;
      if (again.current) { again.current = false; run(); }
    }
  }, [section]);

  // Cambios → copia local inmediata + autoguardado en el servidor
  useEffect(() => {
    if (!mounted.current) return;
    if (current === lastSaved.current) return;
    setStatus((s) => (s.kind === "saving" || s.kind === "offline" ? s : { ...s, kind: "dirty" }));
    const t1 = setTimeout(() => {
      try { localStorage.setItem(localKey(slugRef.current, section), JSON.stringify({ t: Date.now(), c: latest.current })); } catch {}
    }, 300);
    clearTimeout(timer.current);
    timer.current = setTimeout(runSave, 2500);
    return () => clearTimeout(t1);
  }, [current, runSave, section]);

  // Guardado periódico y al salir de la pestaña
  useEffect(() => {
    const every = setInterval(() => { if (snap(latest.current) !== lastSaved.current) runSave(); }, 12000);
    const hide = () => { if (document.visibilityState === "hidden" && snap(latest.current) !== lastSaved.current) { try { localStorage.setItem(localKey(slugRef.current, section), JSON.stringify({ t: Date.now(), c: latest.current })); } catch {} runSave(); } };
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (snap(latest.current) !== lastSaved.current) {
        try { localStorage.setItem(localKey(slugRef.current, section), JSON.stringify({ t: Date.now(), c: latest.current })); } catch {}
        e.preventDefault();
      }
    };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      clearInterval(every);
      clearTimeout(timer.current);
      clearTimeout(retry.current);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [runSave, section]);

  // ── Guardado explícito ──
  function submit(asDraft: boolean, go: "stay" | "view") {
    setError("");
    setNote("");
    clearTimeout(timer.current);
    start(async () => {
      const res = await saveStory({ originalSlug: slugRef.current ?? undefined, title, html, cover, draft: asDraft, section: effSection, coverStyle, coverSize });
      if (!res.ok) return setError(res.error);
      try { localStorage.removeItem(localKey(slugRef.current, section)); localStorage.removeItem(localKey(null, section)); } catch {}
      lastSaved.current = snap(latest.current);
      slugRef.current = res.slug;
      setSlug(res.slug);
      setIsDraft(asDraft);
      setStatus({ kind: "saved", at: new Date().toISOString() });
      window.history.replaceState(null, "", `/admin/editar/${res.slug}`);
      if (go === "view" && !asDraft) {
        router.push(`${BASES[effSection]}/${res.slug}`);
        router.refresh();
      } else {
        setNote(asDraft ? "Guardado como borrador. Solo tú puedes verlo." : "Cambios guardados.");
        router.refresh();
      }
    });
  }

  const published = !!story && !isDraft;
  const label = { idle: "Todavía sin cambios", dirty: "Cambios sin guardar…", saving: "Guardando…", saved: status.at ? `Guardado automáticamente a las ${hhmm(status.at)}` : "Guardado", offline: "Sin conexión: guardado en este dispositivo, reintentando…" }[status.kind];

  return (
    <form className="story-form" onSubmit={(e) => { e.preventDefault(); submit(false, "view"); }}>
      {banner && (
        <div className="recover" role="alert">
          <p>
            <strong>{banner.source === "server" ? "Encontré cambios autoguardados sin publicar" : "Encontré una versión más reciente guardada en este dispositivo"}</strong> ({new Date(banner.at).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}).
          </p>
          <div className="form-row">
            <button type="button" className="btn primary small" onClick={() => restore(banner.content)}>Recuperar</button>
            <button type="button" className="btn small" onClick={dismiss}>Descartar</button>
          </div>
        </div>
      )}
      <div className="status-line">
        <span className={`chip-status ${published ? "pub" : "draft"}`}>{published ? "Publicado" : "Borrador · solo tú lo ves"}</span>
        <span className="status-links">
          <MobilePreview data={{ title, html, cover }} />
          {slug && <Link href="/admin" className="muted">← Panel</Link>}
        </span>
      </div>
      {!fixed && (
        <div className="kind-pick" role="group" aria-label="Tipo de texto">
          <span>Tipo</span>
          <div className="seg">
            <button type="button" className={kind === "cuento" ? "on" : ""} onClick={() => setKind("cuento")}>Cuento</button>
            <button type="button" className={kind === "microcuento" ? "on" : ""} onClick={() => setKind("microcuento")}>Microcuento</button>
          </div>
          <small className="muted">{kind === "microcuento" ? "Se publicará en el Balcón de los microcuentos." : "Se publicará en el Salón de los cuentos."}</small>
        </div>
      )}
      <label>
        Título
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className="title-input" placeholder="Sin título" />
      </label>
      <RichEditor key={editorKey} ref={editor} initialHtml={initialHtml} onChange={onEditor} />
      <div className="field">
        <span className="label">Imagen principal <small>(banner de arriba y miniatura)</small></span>
        <ImageInput value={cover} onChange={setCover} />
        {cover && (
          <div className="cover-opts">
            <button type="button" className="btn small" onClick={() => editor.current?.insertFigure(cover, true)}>
              Insertar también dentro del texto
            </button>
            <small className="muted">Las imágenes dentro del texto se mueven, se agrandan y se achican directamente en el editor.</small>
          </div>
        )}
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      {note && <p className="ok" role="status">{note}</p>}
      <div className="sticky-actions">
        <p className={`autosave ${status.kind}`} role="status"><i aria-hidden />{label}</p>
        <div className="form-row">
          {published ? (
            <>
              <button type="button" className="btn primary" disabled={pending} onClick={() => submit(false, "stay")}>{pending ? "Guardando…" : "Guardar cambios"}</button>
              <button type="button" className="btn" disabled={pending} onClick={() => submit(true, "stay")}>Pasar a borrador</button>
              {slug && <Link className="btn" href={`${BASES[effSection]}/${slug}`}>Ver publicado</Link>}
            </>
          ) : (
            <>
              <button className="btn primary" disabled={pending}>{pending ? "Guardando…" : "Publicar"}</button>
              <button type="button" className="btn" disabled={pending} onClick={() => submit(true, "stay")}>Guardar borrador</button>
              {slug && <Link className="btn" href={`${BASES[effSection]}/${slug}`}>Vista previa</Link>}
            </>
          )}
        </div>
      </div>
    </form>
  );
}
