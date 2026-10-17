"use client";

import { useState, useTransition } from "react";
import { deleteComment, deleteStory, replyToComment } from "@/app/admin/actions";

export function DeleteStoryButton({ slug, title }: { slug: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <button className="link-danger" disabled={pending} onClick={() => confirm(`¿Eliminar «${title}»? No se puede deshacer.`) && start(() => deleteStory(slug))}>
      Eliminar
    </button>
  );
}

type Props = { slug: string; id: string; reply?: { text: string } };

/** Responder como autor / editar respuesta / eliminar comentario. */
export function CommentActions({ slug, id, reply }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(reply?.text ?? "");
  const [pending, start] = useTransition();

  return (
    <>
      <div className="row-actions">
        <button className="linklike" onClick={() => setOpen(!open)}>{reply ? "Editar respuesta" : "Responder"}</button>
        <button className="link-danger" disabled={pending} onClick={() => confirm("¿Eliminar este comentario?") && start(() => deleteComment(slug, id))}>
          Eliminar
        </button>
      </div>
      {open && (
        <form
          className="reply-form"
          style={{ gridColumn: "1 / -1" }}
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              await replyToComment(slug, id, text);
              setOpen(false);
            });
          }}
        >
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1500} placeholder="Tu respuesta aparecerá públicamente como «Angel Oliden (autor)»" autoFocus />
          <div className="form-row">
            <button className="btn primary" disabled={pending}>{pending ? "Guardando…" : "Publicar respuesta"}</button>
            {reply && (
              <button type="button" className="link-danger" disabled={pending} onClick={() => start(async () => { await replyToComment(slug, id, ""); setText(""); setOpen(false); })}>
                Quitar respuesta
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
}
