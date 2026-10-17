/** Círculo de carga con la sonrisa del gato de Cheshire. */
export default function CatLoader() {
  return (
    <div className="cat-loader" role="status" aria-live="polite" aria-label="Cargando">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <g className="ring">
          <circle cx="50" cy="50" r="44" strokeWidth="2.2" strokeDasharray="70 207" style={{ stroke: "var(--accent)" }} />
        </g>
        <circle cx="50" cy="50" r="44" strokeWidth="0.8" opacity="0.25" />
        <g className="grin" strokeWidth="2.4">
          {/* sonrisa */}
          <path d="M22 47 C30 72 70 72 78 47" />
          <path d="M22 47 C19 44 19 41 22 40" />
          <path d="M78 47 C81 44 81 41 78 40" />
          {/* dientes */}
          <path d="M31 55 L34 62 M39 59 L41 67 M47 62 L48 70 M53 62 L52 70 M61 59 L59 67 M69 55 L66 62" strokeWidth="2" />
          {/* ojos entornados */}
          <path d="M32 33 Q37 29 42 33 M58 33 Q63 29 68 33" strokeWidth="2.2" />
        </g>
      </svg>
    </div>
  );
}
