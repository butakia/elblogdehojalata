"use client";

import { useActionState } from "react";
import { unlockStory } from "@/app/acceso";

export default function StoryGate({ next }: { next: string }) {
  const [state, action, pending] = useActionState(unlockStory, {} as { error?: string });
  return (
    <form action={action} className="comment-form gate">
      <input type="hidden" name="next" value={next} />
      <label>
        Contraseña
        <input type="text" name="password" required autoFocus autoComplete="off" inputMode="numeric" placeholder="00-00-00" spellCheck={false} />
      </label>
      <div className="form-row">
        <button className="btn primary" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
        <span role="alert" className="err">{state.error}</span>
      </div>
    </form>
  );
}
