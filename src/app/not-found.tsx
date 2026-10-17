import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section narrow" style={{ textAlign: "center" }}>
      <h1>No encontré esta página</h1>
      <p className="lead" style={{ marginInline: "auto" }}>Puede que el enlace esté mal escrito o que el texto aún sea un borrador.</p>
      <p>
        <Link href="/" className="btn primary">Volver al inicio</Link>
      </p>
    </div>
  );
}
