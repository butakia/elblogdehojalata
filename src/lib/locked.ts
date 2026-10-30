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
]);

export const isLockedSlug = (slug: string) => LOCKED_SLUGS.has(slug);
