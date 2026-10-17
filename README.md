# El blog de Hojalata

Rediseño de https://elblogdehojalata.wordpress.com hecho con Next.js.

## Comandos
- `npm run dev:mobile`: servidor local (puerto 3100) abierto a tu red Wi-Fi; muestra la URL para el celular.
- `npm run build` y `npm start`: versión de producción.
- `npm run lint`: revisión del código.
- `npm run extract`: vuelve a generar `content/` e `public/img` desde `scripts/raw-posts.json`.

Secciones: Inicio, Cuentos, Libros, Sobre mí y Proyectos. Textamentos y Cocina de los ensayos solo se abren desde las tarjetas del inicio. Los libros se editan en `src/lib/books.ts` y los proyectos en `src/lib/projects.ts`.

Diseños: oscuro (por defecto) y claro (botón ◐, o `?tema=tinta`).

## Panel de administración
- Entrada: enlace "Entrar" del pie, o `/admin`. En local la clave es `hojalata` (archivo `.env.local`).
- Todo lo que escribes se **autoguarda**: en el servidor cada pocos segundos y en tu dispositivo al instante. Si algo falla, al reabrir te ofrece recuperarlo.
- Los textos nuevos nacen como **borrador** (solo los ves con la sesión de administrador). Publicas cuando quieras y puedes volver a pasarlos a borrador.
- Si editas algo ya publicado, los cambios se autoguardan aparte y la versión pública no cambia hasta que pulses "Guardar cambios".
- **Ideas**: `/admin/ideas`. En local se reflejan también en `ideas/ideas.md` (carpeta ignorada por git).
- **Respaldo**: botón "Descargar respaldo completo". Lo eliminado queda en una papelera interna.

## Publicar en Vercel (guía rápida)
Qué son las dos piezas que faltan:
- **Redis (Upstash)**: la libreta donde se guardan textos, ideas y comentarios. Sin ella, en Vercel se perderían.
- **Blob**: la carpeta donde se guardan las imágenes que subes desde el panel.

Pasos:
1. Subir esta carpeta a un repositorio de GitHub e **importarlo** en vercel.com (Framework: Next.js; no hace falta cambiar nada más).
2. En el proyecto, **Settings > Environment Variables**: crear `ADMIN_PASSWORD` con tu clave del panel.
3. **Storage > Create > Upstash for Redis** (plan gratuito) y conectarlo al proyecto. Vercel agrega `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. **Storage > Create > Blob** y conectarlo al proyecto. Vercel agrega `BLOB_READ_WRITE_TOKEN`.
5. **Deployments > Redeploy** para que tome las variables.
6. Entrar a `/admin`: en **Conexiones** deben salir tres puntos verdes.

Todas las variables posibles están en `.env.example`. Con dominio propio, define también `NEXT_PUBLIC_SITE_URL`.

## Compartir
Cada cuento, textamento y ensayo publica título, resumen breve e imagen (`/og/<slug>`, 1200x630) para WhatsApp, Facebook y similares.
