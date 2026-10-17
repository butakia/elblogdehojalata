export type Project = {
  slug: string;
  name: string;
  status: string;
  /** Un párrafo por elemento. */
  description: string[];
  tags?: string;
  link?: { label: string; href: string };
};

export const PROJECTS: Project[] = [
  {
    slug: "buscamundos",
    name: "Buscamundos",
    status: "En desarrollo",
    description: ["Buscamundos es un juego de geografía que estoy desarrollando."],
    tags: "Juego · Geografía",
  },
];
