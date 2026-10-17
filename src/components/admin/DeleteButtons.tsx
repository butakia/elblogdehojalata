"use client";

import { useState, useTransition } from "react";
import { deleteComment, deleteStory, replyToComment, setDraftStatus } from "@/app/admin/actions";

export function DeleteStoryButton({ slug, title }: { slug: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <button className="link-danger" disabled={pending} onClick={() => confirm(`¿Eliminar «${title}»? Se guarda una copia en la papelera, pero desaparece de la web.`) && start(() => deleteStory(slug))}>
      Eliminar
    </button>
  );
}

/** Publicar un borrador o pasar un texto publicado a borrador. */
export function PublishToggle({ slug, draft }: { slug: string; draft: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button className="linklike" disabled={pending} onClick={() => start(() => setDraftStatus(slug, !draft))}>
      {draft ? "Publicar" : "Pasar a borrador"}
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
