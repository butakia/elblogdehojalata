export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
  cover: string;
  amazon?: string;
  /** Ejemplares físicos disponibles */
  physical?: boolean;
  /** Todavía no está a la venta: se muestra "Próximamente" en lugar del botón de compra */
  soon?: boolean;
  /** Reseña breve: un párrafo por elemento. Editable aquí. */
  synopsis: string[];
};

export const BOOKS: Book[] = [
  {
    slug: "un-padre-temporal",
    title: "Un padre temporal",
    subtitle: "y otros cuentos",
    cover: "/img/libro-un-padre-temporal.webp",
    amazon: "https://www.amazon.com/dp/B0GV374Y42",
    physical: true,
    synopsis: ["Cuentos de humor, ironía y ternura sobre los vínculos de paso."],
  },
  {
    slug: "la-flor-y-el-bastardo",
    title: "La flor y el bastardo",
    cover: "/img/libro-la-flor-y-el-bastardo.webp",
    amazon: "https://www.amazon.com/dp/B07T2G16N2",
    physical: false,
    synopsis: ["Una sencilla flor de girasol cambia la vida de un personaje desquiciado, que cuenta su historia entre balbuceos literarios y metáforas extrañas."],
  },
  {
    slug: "once-formas-de-arder",
    title: "Once formas de arder",
    subtitle: "Muestra de cuentos del colectivo literario Tinta en llamas",
    cover: "/img/libro-once-formas-de-arder.webp",
    soon: true,
    synopsis: ["Con cuentos de Edgard J. Rivera, Schnaider Chávez, Fernando March y Ángel Oliden."],
  },
];
