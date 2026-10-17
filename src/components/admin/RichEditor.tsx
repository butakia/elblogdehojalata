"use client";

import { useEffect, useRef, useState } from "react";
import { importUrl, uploadFile } from "./upload";

type Props = { initialHtml: string; onChange: (html: string) => void };

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function RichEditor({ initialHtml, onChange }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const saved = useRef<Range | null>(null);
  const [words, setWords] = useState(0);
  const [status, setStatus] = useState("");
  const [over, setOver] = useState(false);

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
    document.execCommand("insertHTML", false, `<figure><img src="${url}" alt=""></figure><p><br></p>`);
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

  const Btn = ({ label, title, run, strong }: { label: React.ReactNode; title: string; run: () => void; strong?: boolean }) => (
    <button type="button" title={title} aria-label={title} onMouseDown={(e) => { e.preventDefault(); remember(); }} onClick={run} className={strong ? "b" : ""}>
      {label}
    </button>
  );

  return (
    <div className={`editor ${over ? "over" : ""}`}>
      <div className="editor-bar" role="toolbar" aria-label="Formato">
        <Btn label="N" title="Negrita" run={() => cmd("bold")} strong />
        <Btn label={<i>K</i>} title="Cursiva" run={() => cmd("italic")} />
        <Btn label="Título" title="Subtítulo" run={() => cmd("formatBlock", "h2")} />
        <Btn label="Cita" title="Cita" run={() => cmd("formatBlock", "blockquote")} />
        <Btn label="Normal" title="Párrafo normal" run={() => cmd("formatBlock", "p")} />
        <span className="sep" />
        <Btn label="Izquierda" title="Alinear a la izquierda" run={() => cmd("justifyLeft")} />
        <Btn label="Centrar" title="Centrar" run={() => cmd("justifyCenter")} />
        <Btn label="Justificar" title="Justificar el texto" run={() => cmd("justifyFull")} />
        <span className="sep" />
        <Btn label="Enlace" title="Insertar enlace" run={addLink} />
        <Btn label="Imagen" title="Subir imagen" run={() => { remember(); picker.current?.click(); }} />
        <Btn label="Imagen por enlace" title="Imagen desde un enlace" run={() => { remember(); imageFromLink(); }} />
        <span className="sep" />
        <Btn label="↶" title="Deshacer" run={() => cmd("undo")} />
        <Btn label="↷" title="Rehacer" run={() => cmd("redo")} />
        <input ref={picker} type="file" accept="image/*" multiple hidden onChange={(e) => { handleFiles(Array.from(e.target.files || [])); e.target.value = ""; }} />
      </div>
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
        <span role="status">{status}</span>
      </div>
    </div>
  );
}
