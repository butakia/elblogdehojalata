"use client";

import { useActionState } from "react";
import { unlockTextamentos } from "@/app/textamentos/actions";

export default function GateForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(unlockTextamentos, {} as { error?: string });
  return (
    <form action={action} className="comment-form gate">
      <input type="hidden" name="next" value={next} />
      <label>
        Contraseña
        <input type="password" name="password" required autoFocus autoComplete="off" />
      </label>
      <div className="form-row">
        <button className="btn primary" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
        <span role="alert" className="err">{state.error}</span>
      </div>
    </form>
  );
}
