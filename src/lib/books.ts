export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
  cover: string;
  amazon: string;
  /** Ejemplares físicos disponibles */
  physical: boolean;
  format: string;
  /** Un párrafo por elemento. EDITAR aquí con la sinopsis oficial. */
  synopsis: string[];
  details: [string, string][];
};

export const BOOKS: Book[] = [
  {
    slug: "un-padre-temporal",
    title: "Un padre temporal",
    subtitle: "y otros cuentos",
    cover: "/img/libro-un-padre-temporal.webp",
    amazon: "https://www.amazon.com/dp/B07T2G16N2",
    physical: true,
    format: "Libro impreso y digital",
    synopsis: [
      "Colección de cuentos de Angel Oliden.",
      "[Pendiente: reemplaza este texto por la sinopsis oficial del libro en src/lib/books.ts]",
    ],
    details: [["Autor", "Angel Oliden"]],
  },
  {
    slug: "la-flor-y-el-bastardo",
    title: "La flor y el bastardo",
    cover: "/img/libro-la-flor-y-el-bastardo.webp",
    amazon: "https://www.amazon.com/dp/B0GV374Y42",
    physical: false,
    format: "Libro digital (Kindle)",
    synopsis: [
      "Cuento de Angel Omar Oliden Pacherrez, publicado en el marco del XI Concurso de cuento independiente.",
      "[Pendiente: reemplaza este texto por la sinopsis oficial del libro en src/lib/books.ts]",
    ],
    details: [
      ["Autor", "Angel Omar Oliden Pacherrez"],
      ["Ilustración", "Cunya Jimenez, V.A."],
    ],
  },
];
