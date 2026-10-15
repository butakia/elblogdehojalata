"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as { error?: string });
  return (
    <form action={action} className="comment-form">
      <label>
        Clave
        <input type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      <div className="form-row">
        <button className="btn primary" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
        <span role="alert" className="err">{state.error}</span>
      </div>
    </form>
  );
}
