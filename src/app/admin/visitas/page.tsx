import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { allStories } from "@/lib/content";
import { getCustomStories } from "@/lib/stories";
import { loadVisits, summarize } from "@/lib/visits";

export const metadata: Metadata = { title: "Visitas", robots: { index: false } };
export const dynamic = "force-dynamic";

const when = (iso: string) => new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" }).format(new Date(iso));
const dayLabel = (d: string) => new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(d + "T12:00:00Z"));

function dur(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 1) return "—";
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m} min ${String(s % 60).padStart(2, "0")} s` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

function Bars({ rows }: { rows: { label: string; n: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (!rows.length) return <p className="empty-note">Sin datos todavía.</p>;
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="bar-label">{r.label}</span>
          <span className="bar-track"><i style={{ width: `${(r.n / max) * 100}%` }} /></span>
          <b>{r.n}</b>
        </li>
      ))}
    </ul>
  );
}

export default async function Visitas() {
  await requireAdmin();
  const [events, mine] = await Promise.all([loadVisits(), getCustomStories()]);
  const s = summarize(events);

  const titles = new Map<string, string>();
  for (const st of [...allStories, ...mine]) {
    for (const base of ["cuentos", "microcuentos", "ensayos", "textamentos"]) titles.set(`/${base}/${st.slug}`, st.title);
  }
  const pretty = (p: string) => (p === "/" ? "Inicio" : titles.get(p) ?? p);
  const max = Math.max(1, ...s.perDay.map((d) => d.n));

  return (
    <div className="wrap section">
      <header className="admin-head">
        <h1>Visitas</h1>
        <div className="actions"><Link href="/admin" className="btn">Volver al panel</Link></div>
      </header>
      <p className="muted">Tus propias visitas (con la sesión del panel abierta) y los robots no se cuentan. Horas en Lima. Registros guardados: {events.length.toLocaleString("es-PE")} (se conservan los más recientes).</p>

      <div className="stat-grid">
        <div><b>{s.today}</b><span>Hoy</span></div>
        <div><b>{s.week}</b><span>7 días</span></div>
        <div><b>{s.month}</b><span>30 días</span></div>
        <div><b>{s.views}</b><span>Páginas vistas</span></div>
        <div><b>{s.visitors}</b><span>Visitantes únicos</span></div>
        <div><b>{s.sessions}</b><span>Sesiones</span></div>
        <div><b>{dur(s.avgSessionMs)}</b><span>Tiempo medio por visita</span></div>
        <div><b>{dur(s.avgPageMs)}</b><span>Tiempo medio por página</span></div>
      </div>

      <section className="admin-block">
        <h2>Últimos 14 días</h2>
        <div className="spark" role="img" aria-label="Páginas vistas por día">
          {s.perDay.map((d) => (
            <span key={d.day} title={`${dayLabel(d.day)}: ${d.n}`}>
              <i style={{ height: `${Math.max(3, (d.n / max) * 100)}%` }} />
              <small>{dayLabel(d.day).replace(".", "")}</small>
            </span>
          ))}
        </div>
      </section>

      <div className="stat-cols">
        <section className="admin-block">
          <h2>Páginas más vistas</h2>
          {s.topPages.length === 0 ? <p className="empty-note">Sin datos todavía.</p> : (
            <ul className="bars">
              {s.topPages.map((p) => (
                <li key={p.label}>
                  <span className="bar-label">{pretty(p.label)}</span>
                  <span className="bar-track"><i style={{ width: `${(p.n / s.topPages[0].n) * 100}%` }} /></span>
                  <b title="vistas · tiempo medio">{p.n} · {dur(p.avgMs)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="admin-block"><h2>Dispositivos</h2><Bars rows={s.devices} /></section>
        <section className="admin-block"><h2>Sistemas</h2><Bars rows={s.oses} /></section>
        <section className="admin-block"><h2>Navegadores</h2><Bars rows={s.browsers} /></section>
        <section className="admin-block"><h2>Ubicación aproximada</h2><Bars rows={s.places} /></section>
        <section className="admin-block">
          <h2>De dónde llegan</h2>
          <Bars rows={s.refs} />
          <p className="muted">WhatsApp no avisa de dónde viene el clic. Los botones "Compartir" del sitio añaden <code>?o=wa</code> al enlace y así se reconoce. Si copias un enlace a mano, agrégale <code>?o=wa</code> (WhatsApp), <code>?o=fb</code> (Facebook) o <code>?o=ig</code> (Instagram) al final.</p>
        </section>
      </div>

      <section className="admin-block">
        <h2>Visitantes <small>({s.visitors_.length})</small></h2>
        <p className="muted">El nombre solo aparece si esa persona dejó un comentario. La ubicación sale de la IP y es aproximada. La IP de una misma persona puede cambiar entre visitas.</p>
        {s.visitors_.length === 0 ? <p className="empty-note">Aún no hay visitas registradas.</p> : (
          <div className="table-scroll">
            <table className="visitors">
              <thead>
                <tr><th>Última visita</th><th>Nombre</th><th>IP</th><th>Ubicación</th><th>Dispositivo</th><th>Vistas</th><th>Tiempo total</th><th>Páginas</th></tr>
              </thead>
              <tbody>
                {s.visitors_.slice(0, 200).map((v) => (
                  <tr key={v.vid}>
                    <td>{when(v.last)}<small>Primera: {when(v.first)}</small></td>
                    <td>{v.name || <span className="muted">—</span>}</td>
                    <td><code>{v.ip}</code></td>
                    <td>{v.place}</td>
                    <td>{v.device}<small>{v.os} · {v.browser}</small></td>
                    <td>{v.views}<small>{v.sessions} {v.sessions === 1 ? "visita" : "visitas"}</small></td>
                    <td>{dur(v.totalMs)}</td>
                    <td className="pages">{v.pages.slice(0, 6).map((p) => <span key={p.path}>{pretty(p.path)}{p.n > 1 && ` ×${p.n}`}</span>)}{v.pages.length > 6 && <span>+{v.pages.length - 6} más</span>}</td>
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
