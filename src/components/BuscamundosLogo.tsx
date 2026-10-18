/** Logotipo de Buscamundos: globo en una placa violeta y el nombre en dos tonos. */
export default function BuscamundosLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`bm-logo ${className}`} role="img" aria-label="Buscamundos">
      <svg viewBox="0 0 48 48" width="1em" height="1em" aria-hidden>
        <defs>
          <linearGradient id="bm-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d4dff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#bm-bg)" stroke="#a78bfa" strokeOpacity="0.55" />
        <g fill="none" stroke="#e9e2ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="12.5" />
          <path d="M24 11.5c-5 3.4-5 21.6 0 25M24 11.5c5 3.4 5 21.6 0 25" strokeWidth="1.8" />
          <path d="M11.8 21c4 1.6 8.4 1.6 12.2-.4 2.6-1.4 6.2-1.4 10.2.2" strokeWidth="1.8" />
          <path d="M12.6 29.4c3.8-1.4 7.6-1 11.4.8 3.2 1.4 6.2 1.4 9.2.2" strokeWidth="1.8" />
        </g>
      </svg>
      <span className="bm-word">
        <span className="bm-a">BUSCA</span>
        <span className="bm-b">MUNDOS</span>
      </span>
    </span>
  );
}
