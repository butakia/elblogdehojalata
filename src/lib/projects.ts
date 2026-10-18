export type Project = {
  slug: string;
  name: string;
  status: string;
  /** Frase corta bajo el nombre. */
  tagline?: string;
  /** Un párrafo por elemento. */
  description: string[];
  /** Puntos destacados (por ejemplo, modos de juego). */
  highlights?: string[];
  link?: { label: string; href: string };
};

export const PROJECTS: Project[] = [
  {
    slug: "buscamundos",
    name: "Buscamundos",
    status: "Juego gratuito",
    tagline: "Aprende el mundo jugando.",
    description: [
      "Además de escribir, otra de las cosas que más me gusta es la geografía. Por eso decidí crear un juego gratuito: un quiz de banderas, capitales y países para aprender y divertirse.",
    ],
    highlights: ["Capitales", "Banderas", "Quiz geográfico", "Modo mixto", "Capitales y banderas escritas", "Salas con amigos y ranking"],
    link: { label: "Jugar ahora", href: "https://buscamundos.vercel.app/" },
  },
];
