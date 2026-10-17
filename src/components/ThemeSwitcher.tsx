"use client";

import { useEffect, useState } from "react";

export const THEMES = [
  { id: "hojalata", name: "Oscuro", hint: "Metal y ámbar" },
  { id: "tinta", name: "Claro", hint: "Papel crema y tinta" },
] as const;

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("hojalata");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.dataset.theme || "hojalata");
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
          <p>Diseño</p>
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
