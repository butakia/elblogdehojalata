import Link from "next/link";

type Room = { href: string; name: string };

/** Las habitaciones de la casa: opciones fijas, a la vista, sin carrusel. */
export default function Rooms({ rooms }: { rooms: Room[] }) {
  return (
    <ul className="room-grid">
      {rooms.map((r) => (
        <li key={r.href}>
          <Link href={r.href}>
            <span>{r.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
