"use client";

import { useState } from "react";

const common = { width: 22, height: 22, viewBox: "0 0 24 24", "aria-hidden": true } as const;

const WhatsAppLogo = () => (
  <svg {...common} fill="none">
    <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M9 8.3c.2-.4.5-.4.8-.3l.9 1.9c.1.3 0 .5-.2.7l-.6.7c.6 1.2 1.6 2.2 2.8 2.8l.7-.7c.2-.2.5-.2.7-.1l1.9.9c.3.1.3.5.1.8-.5 1-1.6 1.5-2.7 1.2-3-.8-5.1-2.9-5.9-5.8-.2-.9.1-1.6.7-2.1Z" fill="currentColor" />
  </svg>
);

const FacebookLogo = () => (
  <svg {...common} fill="currentColor">
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H7.6v3h2.5V21h3.4Z" />
  </svg>
);

const InstagramLogo = () => (
  <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7">
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

/** Botones para compartir el texto en WhatsApp, Facebook e Instagram. */
export default function ShareButtons({ title }: { title: string }) {
  const [msg, setMsg] = useState("");
  const here = () => `${window.location.origin}${window.location.pathname}`;
  const open = (u: string) => window.open(u, "_blank", "noopener,noreferrer");

  async function instagram() {
    const url = here();
    // En el celular se abre el menú de compartir del sistema, donde aparece Instagram
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch {
        /* el usuario canceló */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Enlace copiado. Pégalo en tu historia o mensaje de Instagram.");
    } catch {
      setMsg(url);
    }
    open("https://www.instagram.com/");
  }

  return (
    <div className="share" aria-label="Compartir">
      <span className="share-label">Compartir en</span>
      <div className="share-row">
        <button type="button" className="share-btn wa" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${here()}`)}`)} aria-label="Compartir en WhatsApp">
          <WhatsAppLogo />
          <span>WhatsApp</span>
        </button>
        <button type="button" className="share-btn fb" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(here())}`)} aria-label="Compartir en Facebook">
          <FacebookLogo />
          <span>Facebook</span>
        </button>
        <button type="button" className="share-btn ig" onClick={instagram} aria-label="Compartir en Instagram">
          <InstagramLogo />
          <span>Instagram</span>
        </button>
      </div>
      {msg && <p className="share-msg" role="status">{msg}</p>}
    </div>
  );
}
