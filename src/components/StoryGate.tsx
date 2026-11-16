"use client";

import { useActionState } from "react";
import { unlockStory } from "@/app/acceso";
import { visitorIds } from "@/lib/trackClient";

export default function StoryGate({ next }: { next: string }) {
  const [state, action, pending] = useActionState(unlockStory, {} as { error?: string });
  // Al enviar se añade el identificador del visitante para poder contar los intentos
  const submit = (form: FormData) => {
    const ids = visitorIds();
    form.set("vid", ids.vid);
    form.set("sid", ids.sid);
    return action(form);
  };
  return (
    <form action={submit} className="comment-form gate">
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
