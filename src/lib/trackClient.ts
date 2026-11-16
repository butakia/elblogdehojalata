/** Solo para el navegador: identificadores del visitante (los mismos del Tracker) y envío de clics. */
const rand = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function stored(kind: "local" | "session", key: string) {
  try {
    const s = kind === "local" ? window.localStorage : window.sessionStorage;
    let v = s.getItem(key);
    if (!v) {
      v = rand();
      s.setItem(key, v);
    }
    return v;
  } catch {
    return rand();
  }
}

export const visitorIds = () => ({ vid: stored("local", "hj-vid"), sid: stored("session", "hj-sid") });

/** Avisa de un clic en un enlace a un textamento. `label`: boton ("Leer más"), tarjeta o lista. */
export function trackClick(to: string, label: "boton" | "tarjeta" | "lista") {
  try {
    const data = JSON.stringify({ k: "c", id: rand(), ...visitorIds(), from: window.location.pathname, to, label });
    if (!navigator.sendBeacon?.("/api/track", data)) fetch("/api/track", { method: "POST", body: data, keepalive: true }).catch(() => {});
  } catch {}
}
