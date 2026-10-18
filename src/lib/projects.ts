export type Project = {
  slug: string;
  name: string;
  /** Un párrafo por elemento. */
  description: string[];
  link?: { label: string; href: string };
};

export const PROJECTS: Project[] = [
  {
    slug: "buscamundos",
    name: "Buscamundos",
    description: [
      "Además de escribir, me gusta mucho la geografía. Por eso estoy trabajando en desarrollar un juego gratuito: un quiz de banderas, capitales y países.",
    ],
    link: { label: "Jugar ahora", href: "https://buscamundos.vercel.app/" },
  },
];
