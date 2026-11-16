import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { indexEvents, loadVisits, placeOf } from "@/lib/visits";
import { READING, avg, dur, pageTitles, when } from "@/lib/visitAdmin";

export const metadata: Metadata = { title: "Visitas · Textamentos", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VisitasTextamentos() {
  await requireAdmin();
  const [events, { pretty }] = await Promise.all([loadVisits(), pageTitles()]);
  const ix = indexEvents(events);

  const views = ix.views.filter((v) => READING.test(v.path)).sort((a, b) => b.t.localeCompare(a.t));
  const listViews = ix.views.filter((v) => v.path === "/textamentos").length;
  const clicks = ix.clicks;
  const gates = ix.gates.filter((g) => g.to.startsWith("/textamentos"));
  const byKind = (l: string) => clicks.filter((c) => c.label === l).length;
  const moreClicks = byKind("boton") + byKind("tarjeta");
  const timed = views.filter((v) => ix.timed(v.id));

  // Resumen por textamento
  const slugs = new Set<string>([...views.map((v) => v.path), ...clicks.filter((c) => READING.test(c.to)).map((c) => c.to), ...gates.map((g) => g.to)]);
  const rows = [...slugs].map((p) => {
    const vs = views.filter((v) => v.path === p);
    const t = vs.filter((v) => ix.timed(v.id));
    const g = gates.filter((x) => x.to === p);
    return {
      path: p,
      clicks: clicks.filter((c) => c.to === p).length,
      views: vs.length,
      visitors: new Set(vs.map((v) => v.vid)).size,
      avgMs: avg(t.map((v) => ix.ms(v.id))),
      wrong: g.filter((x) => !x.ok).length,
      right: g.filter((x) => x.ok).length,
    };
  }).sort((a, b) => b.clicks + b.views - (a.clicks + a.views));

  const dest = new Map<string, number>();
  for (const c of clicks.filter((c) => c.label === "tarjeta")) dest.set(c.to, (dest.get(c.to) ?? 0) + 1);

  return (
    <div className="wrap section">
      <header className="admin-head">
        <h1>Visitas · Textamentos</h1>
        <div className="actions">
          <Link href="/admin/visitas/republica" className="btn">La República</Link>
          <Link href="/admin/visitas" className="btn">Todas las visitas</Link>
          <Link href="/admin" className="btn">Panel</Link>
        </div>
      </header>
      <p className="muted">Tus propias visitas (con la sesión del panel abierta) y los robots no se cuentan. Horas en Lima. La ubicación sale de la IP y es aproximada. De las contraseñas solo se anota si acertaron, nunca lo que escribieron.</p>

      <div className="stat-grid">
        <div><b>{views.length}</b><span>Lecturas abiertas</span></div>
        <div><b>{new Set(views.map((v) => v.vid)).size}</b><span>Visitantes únicos</span></div>
        <div><b>{dur(avg(timed.map((v) => ix.ms(v.id))))}</b><span>Tiempo medio leyendo</span></div>
        <div><b>{listViews}</b><span>Visitas a la lista</span></div>
        <div><b>{byKind("lista")}</b><span>Clics desde la lista</span></div>
        <div><b>{moreClicks}</b><span>Clics en «Leer más»</span></div>
        <div><b>{views.length ? Math.round((moreClicks / views.length) * 100) : 0}%</b><span>Siguen leyendo al terminar</span></div>
        <div><b>{gates.length}</b><span>Intentos de contraseña</span></div>
      </div>

      <section className="admin-block">
        <h2>Por textamento</h2>
        {rows.length === 0 ? <p className="empty-note">Aún no hay datos.</p> : (
          <div className="table-scroll">
            <table className="visitors">
              <thead><tr><th>Textamento</th><th>Clics</th><th>Lecturas</th><th>Visitantes</th><th>Tiempo medio</th><th>Contraseña: fallos</th><th>Contraseña: aciertos</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.path}>
                    <td>{pretty(r.path)}</td><td>{r.clicks}</td><td>{r.views}</td><td>{r.visitors}</td><td>{dur(r.avgMs)}</td><td>{r.wrong}</td><td>{r.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="muted">«Clics» cuenta cada vez que alguien tocó ese textamento en la lista o en una tarjeta de «Sigue leyendo». «Lecturas» son las veces que se abrió la página (incluye enlaces directos).</p>
      </section>

      <section className="admin-block">
        <h2>Botón «Leer más textamentos»</h2>
        <p>Botón: <b>{byKind("boton")}</b> clics · Tarjetas con título: <b>{byKind("tarjeta")}</b> clics</p>
        {dest.size > 0 && (
          <ul className="bars">
            {[...dest.entries()].sort((a, b) => b[1] - a[1]).map(([p, n], _i, all) => (
              <li key={p}><span className="bar-label">{pretty(p)}</span><span className="bar-track"><i style={{ width: `${(n / all[0][1]) * 100}%` }} /></span><b>{n}</b></li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-block">
        <h2>Intentos de contraseña <small>({gates.length})</small></h2>
        {gates.length === 0 ? <p className="empty-note">Nadie ha intentado abrir un textamento bloqueado.</p> : (
          <div className="table-scroll">
            <table className="visitors">
              <thead><tr><th>Fecha y hora</th><th>Textamento</th><th>Resultado</th><th>IP</th><th>Ubicación</th><th>Dispositivo</th></tr></thead>
              <tbody>
                {gates.slice().sort((a, b) => b.t.localeCompare(a.t)).slice(0, 200).map((g) => (
                  <tr key={g.id}>
                    <td>{when(g.t)}</td>
                    <td>{pretty(g.to)}</td>
                    <td>{g.ok ? "Acertó" : g.limited ? "Bloqueado por demasiados intentos" : "Falló"}</td>
                    <td><code>{g.ip}</code></td>
                    <td>{placeOf(g)}</td>
                    <td>{g.device}<small>{g.os} · {g.browser}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-block">
        <h2>Registro de lecturas <small>({views.length})</small></h2>
        {views.length === 0 ? <p className="empty-note">Aún no hay lecturas registradas.</p> : (
          <div className="table-scroll">
            <table className="visitors">
              <thead><tr><th>Fecha y hora</th><th>Textamento</th><th>Nombre</th><th>IP</th><th>Ubicación</th><th>Dispositivo</th><th>Tiempo</th><th>Bajó hasta</th><th>Llegó desde</th></tr></thead>
              <tbody>
                {views.slice(0, 300).map((v) => (
                  <tr key={v.id}>
                    <td>{when(v.t)}</td>
                    <td>{pretty(v.path)}</td>
                    <td>{v.name || <span className="muted">—</span>}</td>
                    <td><code>{v.ip}</code></td>
                    <td>{placeOf(v)}</td>
                    <td>{v.device}<small>{v.os} · {v.browser}</small></td>
                    <td>{ix.timed(v.id) ? dur(ix.ms(v.id)) : "—"}</td>
                    <td>{ix.scroll(v.id) !== undefined ? `${ix.scroll(v.id)}%` : "—"}</td>
                    <td>{v.ref || <span className="muted">Directo</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
