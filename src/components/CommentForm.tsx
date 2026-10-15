"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment, type CommentState } from "@/app/comentarios";

export default function CommentForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState<CommentState, FormData>(addComment, { ok: false });
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="comment-form">
      <input type="hidden" name="slug" value={slug} />
      <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden className="hp" />
      <label>
        Tu nombre <small>(opcional)</small>
        <input name="name" maxLength={40} placeholder="Visitante" autoComplete="nickname" />
      </label>
      <label>
        Tu comentario
        <textarea name="text" required minLength={2} maxLength={1500} rows={4} placeholder="Cuéntame qué te dejó este cuento…" />
      </label>
      <div className="form-row">
        <button className="btn primary" disabled={pending}>
          {pending ? "Enviando…" : "Publicar comentario"}
        </button>
        <span role="status" className={state.error ? "err" : "ok"}>
          {state.error || state.message}
        </span>
      </div>
    </form>
  );
}
