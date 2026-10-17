import type { Metadata } from "next";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = { title: "Proyectos" };

export default function Proyectos() {
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <h1>Proyectos</h1>
        <p className="lead">Lo que estoy construyendo además de escribir.</p>
      </header>
      <div className="projects">
        {PROJECTS.map((p) => (
          <article key={p.slug} className="project" id={p.slug}>
            <h2>{p.name}</h2>
            <span className="status">{p.status}</span>
            {p.description.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            {p.link && (
              <p>
                <a href={p.link.href} className="btn primary" target="_blank" rel="noopener noreferrer">{p.link.label}</a>
              </p>
            )}
            {p.tags && <p className="tags">{p.tags}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
