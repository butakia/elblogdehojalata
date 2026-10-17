"use client";

import { useEffect, useRef, useState } from "react";
import { importUrl, uploadFile } from "./upload";

type Props = { initialHtml: string; onChange: (html: string) => void };
type Align = "left" | "center" | "right";
type Size = "s" | "m" | "l";

const ALIGNS: [Align, string][] = [["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]];
const SIZES: [Size, string][] = [["s", "Pequeña"], ["m", "Mediana"], ["l", "Grande"]];

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function figureState(fig: HTMLElement): { align: Align; size: Size } {
  const c = fig.classList;
  const align: Align = c.contains("img-left") ? "left" : c.contains("img-center") ? "center" : "right";
  const size: Size = c.contains("img-s") ? "s" : c.contains("img-l") ? "l" : "m";
  return { align, size };
}

export default function RichEditor({ initialHtml, onChange }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const saved = useRef<Range | null>(null);
  const fig = useRef<HTMLElement | null>(null);
  const [words, setWords] = useState(0);
  const [status, setStatus] = useState("");
  const [over, setOver] = useState(false);
  const [img, setImg] = useState<{ align: Align; size: Size } | null>(null);

  useEffect(() => {
    if (!box.current) return;
    box.current.innerHTML = initialHtml;
    document.execCommand("defaultParagraphSeparator", false, "p");
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    const el = box.current;
    if (!el) return;
    onChange(el.innerHTML);
    const t = el.innerText.trim();
    setWords(t ? t.split(/\s+/).length : 0);
  }

  function remember() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && box.current?.contains(sel.anchorNode)) saved.current = sel.getRangeAt(0).cloneRange();
  }

  function restore() {
    box.current?.focus();
    const sel = window.getSelection();
    if (saved.current && sel) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
  }

  function cmd(name: string, value?: string) {
    restore();
    document.execCommand(name, false, value);
    sync();
  }

  function addLink() {
    restore();
    const url = prompt("Dirección del enlace (https://…)");
    if (url && /^(https?:\/\/|mailto:)/i.test(url.trim())) cmd("createLink", url.trim());
  }

  function insertImage(url: string) {
    restore();
    document.execCommand("insertHTML", false, `<figure class="img-right img-m"><img src="${url}" alt=""></figure><p><br></p>`);
    sync();
  }

  // ── imagen seleccionada (posición y tamaño, estilo Word) ──
  function selectFigure(f: HTMLElement | null) {
    box.current?.querySelectorAll("figure.selected").forEach((e) => e.classList.remove("selected"));
    fig.current = f;
    if (f) {
      f.classList.add("selected");
      setImg(figureState(f));
    } else setImg(null);
  }

  function setAlign(a: Align) {
    const f = fig.current;
    if (!f) return;
    f.classList.remove("img-left", "img-right", "img-center");
    f.classList.add(`img-${a}`);
    if (!f.classList.contains("img-s") && !f.classList.contains("img-m") && !f.classList.contains("img-l")) f.classList.add("img-m");
    setImg(figureState(f));
    sync();
  }

  function setSize(s: Size) {
    const f = fig.current;
    if (!f) return;
    f.classList.remove("img-s", "img-m", "img-l");
    f.classList.add(`img-${s}`);
    if (!f.classList.contains("img-left") && !f.classList.contains("img-center") && !f.classList.contains("img-right")) f.classList.add("img-right");
    setImg(figureState(f));
    sync();
  }

  function removeFigure() {
    fig.current?.remove();
    selectFigure(null);
    sync();
  }

  async function handleFiles(files: File[]) {
    for (const f of files.filter((f) => f.type.startsWith("image/"))) {
      setStatus(`Subiendo ${f.name}…`);
      try {
        insertImage((await uploadFile(f)).url);
        setStatus("");
      } catch (e) {
        setStatus((e as Error).message);
      }
    }
  }

  async function imageFromLink() {
    const url = prompt("Enlace de la imagen (https://…)");
    if (!url) return;
    setStatus("Importando imagen…");
    try {
      insertImage((await importUrl(url.trim())).url);
      setStatus("");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  const tool = (label: React.ReactNode, title: string, run: () => void, strong = false) => (
    <button key={title} type="button" title={title} aria-label={title} onMouseDown={(e) => { e.preventDefault(); remember(); }} onClick={run} className={strong ? "b" : ""}>
      {label}
    </button>
  );

  return (
    <div className={`editor ${over ? "over" : ""}`}>
      <div className="editor-bar" role="toolbar" aria-label="Formato">
        {tool("N", "Negrita", () => cmd("bold"), true)}
        {tool(<i>K</i>, "Cursiva", () => cmd("italic"))}
        {tool("Título", "Subtítulo", () => cmd("formatBlock", "h2"))}
        {tool("Cita", "Cita", () => cmd("formatBlock", "blockquote"))}
        {tool("Normal", "Párrafo normal", () => cmd("formatBlock", "p"))}
        <span className="sep" />
        {tool("Izquierda", "Alinear el texto a la izquierda", () => cmd("justifyLeft"))}
        {tool("Centrar", "Centrar el texto", () => cmd("justifyCenter"))}
        {tool("Justificar", "Justificar el texto", () => cmd("justifyFull"))}
        <span className="sep" />
        {tool("Enlace", "Insertar enlace", addLink)}
        {tool("Imagen", "Subir imagen", () => { remember(); picker.current?.click(); })}
        {tool("Imagen por enlace", "Imagen desde un enlace", () => { remember(); imageFromLink(); })}
        <span className="sep" />
        {tool("↶", "Deshacer", () => cmd("undo"))}
        {tool("↷", "Rehacer", () => cmd("redo"))}
        <input ref={picker} type="file" accept="image/*" multiple hidden onChange={(e) => { handleFiles(Array.from(e.target.files || [])); e.target.value = ""; }} />
      </div>
      {img && (
        <div className="image-bar" role="toolbar" aria-label="Imagen seleccionada">
          <span className="lbl">Imagen</span>
          <div className="group" role="group" aria-label="Posición">
            {ALIGNS.map(([id, label]) => (
              <button key={id} type="button" className={img.align === id ? "on" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign(id)}>{label}</button>
            ))}
          </div>
          <div className="group" role="group" aria-label="Tamaño">
            {SIZES.map(([id, label]) => (
              <button key={id} type="button" className={img.size === id ? "on" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => setSize(id)}>{label}</button>
            ))}
          </div>
          <button type="button" className="danger" onMouseDown={(e) => e.preventDefault()} onClick={removeFigure}>Quitar imagen</button>
        </div>
      )}
      <div
        ref={box}
        className="editor-area prose"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Texto del cuento"
        data-placeholder="Escribe aquí tu cuento. También puedes arrastrar imágenes."
        onInput={sync}
        onBlur={remember}
        onKeyUp={remember}
        onMouseUp={remember}
        onClick={(e) => selectFigure((e.target as HTMLElement).closest("figure"))}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData.files);
          if (files.length) {
            e.preventDefault();
            remember();
            handleFiles(files);
            return;
          }
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          const html = text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
          document.execCommand("insertHTML", false, html);
          sync();
        }}
        onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setOver(true); } }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          setOver(false);
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          const r = document.caretRangeFromPoint?.(e.clientX, e.clientY);
          if (r) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(r);
            saved.current = r.cloneRange();
          }
          handleFiles(Array.from(e.dataTransfer.files));
        }}
      />
      <div className="editor-foot">
        <span>{words} palabras · ≈ {Math.max(1, Math.round(words / 200))} min</span>
        <span role="status">{status || (img ? "" : "Toca una imagen para cambiar su posición y tamaño")}</span>
      </div>
    </div>
  );
}
