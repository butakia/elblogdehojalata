"use client";

import { useEffect, useState } from "react";

export const THEMES = [
  { id: "tinta", name: "Tinta", hint: "Papel crema y tinta sepia" },
  { id: "hojalata", name: "Hojalata", hint: "Taller nocturno de metal y ámbar" },
  { id: "cheshire", name: "Cheshire", hint: "Morado, sonrisa y fantasía" },
] as const;

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("tinta");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.dataset.theme || "tinta");
  }, []);

  function pick(id: string) {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem("hojalata-theme", id);
    } catch {}
    setTheme(id);
    setOpen(false);
  }

  return (
    <div className="theme-switcher">
      <button className="theme-fab" aria-expanded={open} aria-label="Cambiar diseño" onClick={() => setOpen(!open)}>
        <span aria-hidden>◐</span>
      </button>
      {open && (
        <div className="theme-menu" role="menu">
          <p className="eyebrow">Propuesta de diseño</p>
          {THEMES.map((t) => (
            <button key={t.id} role="menuitemradio" aria-checked={theme === t.id} className={theme === t.id ? "on" : ""} onClick={() => pick(t.id)}>
              <strong>{t.name}</strong>
              <small>{t.hint}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
