import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { indexEvents, loadVisits, placeOf } from "@/lib/visits";
import { avg, dur, pageTitles, when } from "@/lib/visitAdmin";

export const metadata: Metadata = { title: "Visitas · La República", robots: { index: false } };
export const dynamic = "force-dynamic";

const SLUG = "textamento-12-comparto-mi-columna-en-sabiendonos";
const PATH = `/textamentos/${SLUG}`;

export default async function VisitasRepublica() {
  await requireAdmin();
  const [events, { pretty }] = await Promise.all([loadVisits(), pageTitles()]);
  const ix = indexEvents(events);

  const mine = ix.views.filter((v) => v.path === PATH).sort((a, b) => b.t.localeCompare(a.t));
  const timed = mine.filter((v) => ix.timed(v.id));
  const scrolled = mine.filter((v) => ix.scroll(v.id) !== undefined);
  const clicks = ix.clicks.filter((c) => c.from === PATH);
  const gatesHere = ix.gates.filter((g) => g.to === PATH).length;

  // Recorrido de cada visita por el resto del sitio (misma sesión del navegador)
  const bySession = new Map<string, typeof ix.views>();
  for (const v of ix.views) bySession.set(v.sid, [...(bySession.get(v.sid) ?? []), v]);
  const visitsOf = new Map<string, number>();
  for (const v of mine) visitsOf.set(v.vid, (visitsOf.get(v.vid) ?? 0) + 1);

  return (
    <div className="wrap section">
      <header className="admin-head">
        <h1>Visitas · La República</h1>
        <div className="actions">
          <Link href="/admin/visitas/textamentos" className="btn">Textamentos</Link>
          <Link href="/admin" className="btn">Panel</Link>
        </div>
      </header>
      <p className="muted">
        Todo lo que se sabe de quienes abrieron «{pretty(PATH)}». Tus propias visitas (con la sesión del panel abierta) y los robots no se cuentan. Horas en Lima. La ubicación sale de la IP y es aproximada; la IP puede ser la de la empresa de internet y no la de la casa.
        El navegador no permite saber qué otras páginas de internet visitó una persona: solo se sabe de qué sitio llegó (columna «Llegó desde») y qué páginas de este blog recorrió.
      </p>

      <div className="stat-grid">
        <div><b>{mine.length}</b><span>Lecturas</span></div>
        <div><b>{new Set(mine.map((v) => v.vid)).size}</b><span>Visitantes únicos</span></div>
        <div><b>{[...visitsOf.values()].filter((n) => n > 1).length}</b><span>Volvieron a leerlo</span></div>
        <div><b>{dur(avg(timed.map((v) => ix.ms(v.id))))}</b><span>Tiempo medio leyendo</span></div>
        <div><b>{scrolled.length ? Math.round(avg(scrolled.map((v) => ix.scroll(v.id) ?? 0))) : 0}%</b><span>Hasta dónde bajan (media)</span></div>
        <div><b>{clicks.length}</b><span>Clics para seguir leyendo</span></div>
        <div><b>{gatesHere}</b><span>Intentos de contraseña aquí</span></div>
      </div>

      <section className="admin-block">
        <h2>Cada lectura <small>({mine.length})</small></h2>
        {mine.length === 0 ? <p className="empty-note">Aún nadie ha abierto este textamento.</p> : (
          <div className="table-scroll">
            <table className="visitors">
              <thead>
                <tr><th>Fecha y hora</th><th>Quién</th><th>IP y ubicación</th><th>Dispositivo</th><th>Lectura</th><th>Llegó desde</th><th>En todo el sitio</th></tr>
              </thead>
              <tbody>
                {mine.slice(0, 300).map((v) => {
                  const trail = (bySession.get(v.sid) ?? []).slice().sort((a, b) => a.t.localeCompare(b.t));
                  const total = trail.reduce((a, p) => a + ix.ms(p.id), 0);
                  const click = clicks.find((c) => c.sid === v.sid && c.t >= v.t);
                  return (
                    <tr key={v.id}>
                      <td>{when(v.t)}</td>
                      <td>{v.name || <span className="muted">Anónimo</span>}<small>{(visitsOf.get(v.vid) ?? 1) > 1 ? `Lo ha leído ${visitsOf.get(v.vid)} veces` : "Primera vez"}</small></td>
                      <td><code>{v.ip}</code><small>{placeOf(v)}{v.lat && v.lon ? ` · ${v.lat}, ${v.lon}` : ""}</small></td>
                      <td>{v.device}<small>{v.os} · {v.browser}</small><small>{[v.scr, v.lang, v.tz].filter(Boolean).join(" · ")}</small></td>
                      <td>{ix.timed(v.id) ? dur(ix.ms(v.id)) : "—"}<small>{ix.scroll(v.id) !== undefined ? `Bajó hasta el ${ix.scroll(v.id)}%` : ""}</small>{click && <small>Siguió leyendo ({click.label === "boton" ? "botón" : click.label})</small>}</td>
                      <td>{v.ref || <span className="muted">Directo</span>}</td>
                      <td className="pages">
                        <small>{trail.length} {trail.length === 1 ? "página" : "páginas"} · {dur(total)} en total</small>
                        {trail.slice(0, 8).map((p) => <span key={p.id}>{pretty(p.path)}{ix.timed(p.id) ? ` (${dur(ix.ms(p.id))})` : ""}</span>)}
                        {trail.length > 8 && <span>+{trail.length - 8} más</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
