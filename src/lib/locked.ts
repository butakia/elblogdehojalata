/** Cuentos que se ven en las listas pero piden contraseña para leerse (muy personales o aún sin pulir). */
export const LOCKED_SLUGS = new Set([
  "cementerio",
  "el-zorro-polar-y-la-princesa",
  "un-gran-hombre-recordado-por-un-pequeno-escritor",
  "la-historia-del-sandwich-de-atun-narrada-para-ninos-creativos",
  "vivir-con-lazarillo",
  "los-dedos-del-senor-ventura",
  "la-dona",
  "el-cabello-de-las-monjas",
  "picozapato-y-la-bruja-de-cristal",
  "piuranos",
  "el-hombre-con-el-corazon-mas-ruidoso-del-mundo",
  "el-encanto-de-los-muertos",
  "la-mototaxi",
  // Textamentos #1 al #10: se ven en la lista, pero piden contraseña
  "textamento-1-el-senor-de-oyotun",
  "textamento-2-me-dolio-perderla",
  "textamento-3-los-malditos-gringos",
  "textamento-4-mi-primer-pe",
  "textamento-5-la-politica-y-la-psicologia",
  "textamento-6-cuanto-de-mi-hay-en-manual-de-suicidio",
  "textamento-7-respuesta-a-ataratxia-piura",
  "textamento-8-dias-perros-y-la-camara-peruana-del-libro",
  "textamento-9-que-tiene-de-bueno-argentina",
  "textamento-10-potencia-extranjera-y-la-palabra-serrano",
]);

export const isLockedSlug = (slug: string) => LOCKED_SLUGS.has(slug);
