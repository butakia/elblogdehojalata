# El blog de Hojalata

Rediseño de https://elblogdehojalata.wordpress.com (Next.js, 100 % estático).

- `npm run dev` — localhost:3000
- `npm run dev:mobile` — expone el servidor en la red local (puerto 3100) y muestra la URL para el celular
- `npm run start:mobile` — build de producción en la red local
- `npm run extract` — vuelve a generar `content/` e `public/img` desde `scripts/raw-posts.json`

Diseños: Tinta y Hojalata (botón ◐, o `?tema=hojalata`). Secciones: Inicio, Cuentos, Libros, Sobre mí. Los libros se editan en `src/lib/books.ts`.

## Vercel
Importar la carpeta en vercel.com (framework Next.js, sin variables de entorno).

## Admin, comentarios y almacenamiento
- Panel: `/admin` (enlace "Entrar" en el pie). En local la clave es `hojalata` (archivo `.env.local`).
- Comentarios y cuentos nuevos se guardan en `.data/store.json` en local.
- Imágenes subidas en local van a `public/uploads/`.

### En Vercel (para que lo subido sea permanente)
1. Variables de entorno: `ADMIN_PASSWORD` (tu clave) y opcionalmente `ADMIN_SECRET`.
2. Storage → conectar **Upstash Redis** (crea `UPSTASH_REDIS_REST_URL` / `_TOKEN`; también sirven `KV_REST_API_*`).
3. Storage → crear un **Blob** (crea `BLOB_READ_WRITE_TOKEN`) para las imágenes.

## Escribir desde el panel
- Todo lo que escribes se **autoguarda** (en el servidor cada pocos segundos y en tu dispositivo al instante). Si algo falla, al reabrir te ofrece recuperarlo.
- Los textos nuevos nacen como **borrador** (solo visibles con la sesión de administrador). Publica cuando quieras; puedes volver a pasarlos a borrador.
- Si editas algo ya publicado, los cambios se autoguardan aparte y la versión pública no cambia hasta que pulses "Guardar cambios".
- **Ideas**: `/admin/ideas`. En local se refleja también en `ideas/ideas.md` (carpeta ignorada por git) para poder leerlas y trabajarlas juntos.
- **Respaldo**: botón "Descargar respaldo completo" en el panel. Lo eliminado queda en una papelera.

## Compartir
Cada cuento, textamento y ensayo publica su título, un resumen breve y su imagen (`/og/<slug>`, 1200x630) para WhatsApp, Facebook, etc. En producción define `NEXT_PUBLIC_SITE_URL` si usas un dominio propio.
