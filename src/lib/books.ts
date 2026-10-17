export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
  cover: string;
  amazon: string;
  /** Ejemplares físicos disponibles */
  physical: boolean;
  /** Reseña: un párrafo por elemento. Editable aquí. */
  synopsis: string[];
};

export const BOOKS: Book[] = [
  {
    slug: "un-padre-temporal",
    title: "Un padre temporal",
    subtitle: "y otros cuentos",
    cover: "/img/libro-un-padre-temporal.webp",
    amazon: "https://www.amazon.com/dp/B07T2G16N2",
    physical: true,
    synopsis: [
      "Un padre temporal y otros cuentos reúne relatos de Angel Oliden escritos con el humor, la ironía y la ternura con que mira lo cotidiano. Son historias sobre vínculos que duran lo que duran: compañías de paso, afectos prestados y personas que, por un rato, ocupan un lugar que no era suyo.",
      "Como en la portada, donde dos personas comparten un viaje por una carretera abierta, el libro invita al lector a recorrer ese camino sin prisa.",
    ],
  },
  {
    slug: "la-flor-y-el-bastardo",
    title: "La flor y el bastardo",
    cover: "/img/libro-la-flor-y-el-bastardo.webp",
    amazon: "https://www.amazon.com/dp/B0GV374Y42",
    physical: false,
    synopsis: [
      "Una sencilla flor de girasol marca un antes y un después en la vida de un personaje desquiciado, que cuenta su historia entre balbuceos literarios, metáforas extrañas y una locura que por momentos parece lucidez.",
      "Cuento breve ilustrado, publicado en 2019 en formato digital (Kindle) en el marco del XI Concurso de cuento independiente.",
    ],
  },
];
