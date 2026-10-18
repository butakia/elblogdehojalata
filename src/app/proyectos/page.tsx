import type { Metadata } from "next";
import BuscamundosLogo from "@/components/BuscamundosLogo";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = { title: "Proyectos" };

export default function Proyectos() {
  return (
    <div className="wrap section narrow">
      <header className="page-head">
        <h1>Proyectos</h1>
      </header>
      <div className="projects">
        {PROJECTS.map((p) => (
          <section key={p.slug} className="project-open" id={p.slug}>
            {p.slug === "buscamundos" ? <BuscamundosLogo className="project-logo" /> : <h2>{p.name}</h2>}
            {p.description.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            {p.link && (
              <p>
                <a href={p.link.href} className="btn primary" target="_blank" rel="noopener noreferrer">
                  {p.link.label} <span aria-hidden>↗</span>
                </a>
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
