import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { adminEnabled, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Login() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <h1>Entrar al panel</h1>
      </header>
      {adminEnabled() ? <LoginForm /> : <p className="lead">El panel está desactivado: define la variable ADMIN_PASSWORD en el servidor.</p>}
    </div>
  );
}
