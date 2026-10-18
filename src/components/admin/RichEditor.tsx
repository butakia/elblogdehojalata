"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { importUrl, uploadFile } from "./upload";

export type EditorHandle = { insertFigure: (url: string, atStart?: boolean) => void };

type Props = { initialHtml: string; onChange: (html: string) => void; ref?: React.Ref<EditorHandle> };
type Align = "left" | "center" | "right";
type Size = "s" | "m" | "l";
type FigState = { align: Align; size: Size | null; width: number };

const ALIGNS: [Align, string][] = [["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]];
const SIZES: [Size, string][] = [["s", "Pequeña"], ["m", "Mediana"], ["l", "Grande"]];
const SIZE_WIDTH: Record<Size, number> = { s: 30, m: 42, l: 58 };

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function figureState(fig: HTMLElement): FigState {
  const c = fig.classList;
  const align: Align = c.contains("img-left") ? "left" : c.contains("img-center") ? "center" : "right";
  const custom = /width:\s*(\d+(?:\.\d+)?)%/.exec(fig.getAttribute("style") || "")?.[1];
  const size: Size | null = custom ? null : c.contains("img-s") ? "s" : c.contains("img-l") ? "l" : "m";
  return { align, size, width: custom ? Math.round(Number(custom)) : SIZE_WIDTH[size ?? "m"] };
}

export default function RichEditor({ initialHtml, onChange, ref }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const saved = useRef<Range | null>(null);
  const fig = useRef<HTMLElement | null>(null);
  const dragFig = useRef<HTMLElement | null>(null);
  const [words, setWords] = useState(0);
  const [status, setStatus] = useState("");
  const [over, setOver] = useState(false);
  const [img, setImg] = useState<FigState | null>(null);

  useEffect(() => {
    if (!box.current) return;
    box.current.innerHTML = initialHtml;
    document.execCommand("defaultParagraphSeparator", false, "p");
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    insertFigure(url: string, atStart = false) {
      const el = box.current;
      if (!el) return;
      const f = document.createElement("figure");
      f.className = "img-right img-m";
      const im = document.createElement("img");
      im.src = url;
      im.alt = "";
      f.appendChild(im);
      if (atStart) el.insertBefore(f, el.firstChild);
      else el.appendChild(f);
      sync();
      selectFigure(f);
    },
  }));

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

  // ── imagen seleccionada: posición, tamaño y lugar dentro del texto, estilo Word ──
  function selectFigure(f: HTMLElement | null) {
    box.current?.querySelectorAll("figure.selected").forEach((e) => e.classList.remove("selected"));
    fig.current = f;
    if (f) {
      f.classList.add("selected");
      setImg(figureState(f));
    } else setImg(null);
  }

  function refresh() {
    if (fig.current) setImg(figureState(fig.current));
    sync();
  }

  function setAlign(a: Align) {
    const f = fig.current;
    if (!f) return;
    f.classList.remove("img-left", "img-right", "img-center");
    f.classList.add(`img-${a}`);
    refresh();
  }

  function setSize(s: Size) {
    const f = fig.current;
    if (!f) return;
    f.removeAttribute("style");
    f.classList.remove("img-s", "img-m", "img-l");
    f.classList.add(`img-${s}`);
    refresh();
  }

  function setWidth(w: number) {
    const f = fig.current;
    if (!f) return;
    f.classList.remove("img-s", "img-m", "img-l");
    f.style.width = `${w}%`;
    refresh();
  }

  function removeFigure() {
    fig.current?.remove();
    selectFigure(null);
    sync();
  }

  // El bloque de nivel superior que contiene un nodo
  function topBlock(n: Node | null): HTMLElement | null {
    const root = box.current;
    let el = n instanceof HTMLElement ? n : n?.parentElement ?? null;
    while (el && el.parentElement !== root) el = el.parentElement;
    return el && root && el.parentElement === root ? el : null;
  }

  function moveBy(dir: -1 | 1) {
    const f = fig.current;
    const b = topBlock(f);
    if (!f || !b || !box.current) return;
    const y = window.scrollY;
    if (dir < 0) {
      const prev = b.previousElementSibling;
      if (prev) box.current.insertBefore(b, prev);
    } else {
      const next = b.nextElementSibling;
      if (next) box.current.insertBefore(next, b);
    }
    refresh();
    keepInView(f, y);
  }

  /** Evita que la página salte al mover una imagen: conserva el scroll y solo corrige si la imagen sale de la pantalla. */
  function keepInView(f: HTMLElement, y: number) {
    window.scrollTo({ top: y });
    requestAnimationFrame(() => {
      window.scrollTo({ top: y });
      const r = f.getBoundingClientRect();
      const top = 130; // barras fijas de arriba
      if (r.top < top) window.scrollBy({ top: r.top - top - 20 });
      else if (r.bottom > window.innerHeight - 90) window.scrollBy({ top: r.bottom - window.innerHeight + 110 });
    });
  }

  /** Pone la imagen justo en el punto indicado, partiendo el párrafo en dos si hace falta (como anclarla en Word). */
  function placeAt(f: HTMLElement, range: Range | null) {
    const root = box.current;
    if (!root || !range) return false;
    const block = topBlock(range.startContainer);
    if (!block || block === f) return false;
    const y = window.scrollY;
    const textBlock = /^(P|H2|H3|BLOCKQUOTE)$/.test(block.tagName);
    // Si la imagen vive dentro del mismo bloque que se va a partir, primero se saca
    const holder = topBlock(f) ?? f;
    if (holder === block) return false;
    holder.remove();
    if (!textBlock) {
      root.insertBefore(f, block);
    } else {
      const tail = document.createRange();
      tail.setStart(range.startContainer, range.startOffset);
      tail.setEnd(block, block.childNodes.length);
      const frag = tail.extractContents();
      const hasTail = (frag.textContent || "").trim().length > 0 || !!frag.querySelector?.("img");
      const headEmpty = (block.textContent || "").trim().length === 0 && !block.querySelector("img");
      if (headEmpty) {
        // el punto estaba al inicio del bloque: la imagen va antes y el texto se queda entero
        block.appendChild(frag);
        root.insertBefore(f, block);
      } else {
        root.insertBefore(f, block.nextSibling);
        if (hasTail) {
          const rest = document.createElement(block.tagName);
          const st = block.getAttribute("style");
          if (st) rest.setAttribute("style", st);
          rest.appendChild(frag);
          root.insertBefore(rest, f.nextSibling);
        }
      }
    }
    selectFigure(f);
    sync();
    keepInView(f, y);
    return true;
  }

  function dropTarget(x: number, y: number) {
    const r = document.caretRangeFromPoint?.(x, y);
    const b = topBlock(r?.startContainer ?? null);
    if (!b) return null;
    const rect = b.getBoundingClientRect();
    return { block: b, after: y > rect.top + rect.height / 2 };
  }

  function clearDropMarks() {
    box.current?.querySelectorAll(".drop-before, .drop-after").forEach((e) => e.classList.remove("drop-before", "drop-after"));
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
          <label className="slider">
            <span>{img.width}%</span>
            <input type="range" min={15} max={100} step={5} value={img.width} onChange={(e) => setWidth(Number(e.target.value))} aria-label="Ancho de la imagen" />
          </label>
          <div className="group" role="group" aria-label="Mover">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => moveBy(-1)} title="Subir un bloque">↑ Subir</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => moveBy(1)} title="Bajar un bloque">↓ Bajar</button>
            <button type="button" className="here" onMouseDown={(e) => e.preventDefault()} onClick={() => fig.current && placeAt(fig.current, saved.current) } title="Haz clic en el texto donde la quieres y pulsa aquí">⤓ Mover aquí</button>
          </div>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selectFigure(null)}>Cerrar</button>
          <button type="button" className="danger" onMouseDown={(e) => e.preventDefault()} onClick={removeFigure}>Quitar</button>
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
        onClick={(e) => {
          const f = (e.target as HTMLElement).closest("figure") as HTMLElement | null;
          if (f) selectFigure(f);
          else remember();
        }}
        onDragStart={(e) => {
          const f = (e.target as HTMLElement).closest("figure") as HTMLElement | null;
          if (f && box.current?.contains(f)) {
            dragFig.current = f;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", "imagen");
            selectFigure(f);
          }
        }}
        onDragEnd={() => {
          dragFig.current = null;
          clearDropMarks();
        }}
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
        onDragOver={(e) => {
          if (dragFig.current) {
            e.preventDefault();
            const t = dropTarget(e.clientX, e.clientY);
            clearDropMarks();
            if (t && t.block !== dragFig.current) t.block.classList.add(t.after ? "drop-after" : "drop-before");
          } else if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          setOver(false);
          // Mover una imagen ya puesta a otro lugar del texto
          if (dragFig.current) {
            e.preventDefault();
            const f = dragFig.current;
            const r = document.caretRangeFromPoint?.(e.clientX, e.clientY) ?? null;
            clearDropMarks();
            dragFig.current = null;
            if (!placeAt(f, r)) {
              const t = dropTarget(e.clientX, e.clientY);
              if (t && box.current && t.block !== f) {
                const holder = topBlock(f) ?? f;
                box.current.insertBefore(holder, t.after ? t.block.nextSibling : t.block);
                selectFigure(f);
                sync();
              }
            }
            return;
          }
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
        <span role="status">{status || (img ? "Haz clic en el texto donde la quieres y pulsa «Mover aquí», o arrástrala. En el celular siempre se ve grande." : "Toca una imagen para moverla y cambiar su tamaño")}</span>
      </div>
    </div>
  );
}
