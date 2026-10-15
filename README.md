# El blog de Hojalata

Rediseño de https://elblogdehojalata.wordpress.com (Next.js, 100 % estático).

- `npm run dev` — localhost:3000
- `npm run dev:mobile` — expone el servidor en la red local (puerto 3100) y muestra la URL para el celular
- `npm run start:mobile` — build de producción en la red local
- `npm run extract` — vuelve a generar `content/` e `public/img` desde `scripts/raw-posts.json`

Diseños: Tinta, Hojalata y Cheshire (botón ◐, o `?tema=hojalata`).

## Vercel
Importar la carpeta en vercel.com (framework Next.js, sin variables de entorno).
