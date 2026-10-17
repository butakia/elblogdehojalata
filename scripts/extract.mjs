// Convierte el volcado de la API de WordPress.com en content/*.json e imagenes locales.
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const raw = JSON.parse(fs.readFileSync("scripts/raw-posts.json", "utf8")).posts;
const imgDir = "public/img";
fs.mkdirSync(imgDir, { recursive: true });
const cache = new Map();

async function localImage(url) {
  const clean = url.split("?")[0];
  if (cache.has(clean)) return cache.get(clean);
  if (!/elblogdehojalata\.(wordpress|files\.wordpress)\.com/.test(clean)) { cache.set(clean, null); return null; }
  const name = clean.split("/").slice(-3).join("-").replace(/[^a-zA-Z0-9._-]/g, "_");
  const file = path.join(imgDir, name);
  if (!fs.existsSync(file)) {
    const res = await fetch(clean + "?w=1400");
    if (!res.ok) { console.warn("fallo", clean, res.status); cache.set(clean, null); return null; }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  cache.set(clean, "/img/" + name);
  return "/img/" + name;
}

async function clean(html) {
  const $ = cheerio.load(html, null, false);
  $("pre, script, style, .a8c-posts-list, .wp-block-spacer, iframe").remove();
  for (const el of $("img").toArray()) {
    const src = $(el).attr("data-orig-file") || $(el).attr("src");
    const local = src ? await localImage(src) : null;
    if (!local) { $(el).closest("figure").remove(); $(el).remove(); continue; }
    const alt = ($(el).attr("alt") || "").trim();
    const w = $(el).attr("width"), h = $(el).attr("height");
    $(el).attr({ src: local, alt, loading: "lazy" });
    if (w && h) $(el).attr({ width: w, height: h });
    for (const a of Object.keys(el.attribs)) if (!["src","alt","loading","width","height"].includes(a)) $(el).removeAttr(a);
  }
  $("*").each((_, el) => { for (const a of Object.keys(el.attribs || {})) if (!["href","src","alt","loading","width","height"].includes(a)) $(el).removeAttr(a); });
  $("p").each((_, el) => { if (!$(el).text().trim() && !$(el).find("img").length) $(el).remove(); });
  $("figure").each((_, el) => { if (!$(el).find("img").length) $(el).remove(); });
  $("div").each((_, el) => { $(el).replaceWith($(el).html()); });
  return $.html().replace(/<!--[\s\S]*?-->/g, "").replace(/\n{2,}/g, "\n").trim();
}

const text = (html) => cheerio.load(html, null, false).text().replace(/\s+/g, " ").trim();
const stories = [];
const pages = {};
for (const p of raw) {
  const html = await clean(p.content);
  const base = { id: p.ID, slug: p.slug, title: p.title.replace(/&#8217;/g, "’"), date: p.date, html };
  if (p.type === "page") { pages[p.slug] = base; continue; }
  const plain = text(html);
  const words = plain.split(" ").length;
  const feat = p.featured_image ? await localImage(p.featured_image) : null;
  const firstImg = feat || (html.match(/<img[^>]*src="([^"]+)"/) || [])[1] || null;
  stories.push({ ...base, cover: firstImg, excerpt: plain.slice(0, 200).replace(/\s\S*$/, "") + "…", words, minutes: Math.max(1, Math.round(words / 200)), kind: words < 450 ? "microcuento" : "cuento" });
}
stories.sort((a, b) => b.date.localeCompare(a.date));
fs.writeFileSync("content/stories.json", JSON.stringify(stories, null, 1));
fs.writeFileSync("content/pages.json", JSON.stringify(pages, null, 1));
// Imagen del blog: logo e iconos
for (const u of ["https://elblogdehojalata.wordpress.com/wp-content/uploads/2021/06/elgatokesonrie.png","https://elblogdehojalata.wordpress.com/wp-content/uploads/2021/06/cropped-portwa-1.png"]) console.log(await localImage(u));
console.log(stories.length, "cuentos;", Object.keys(pages).join(","), "; imagenes:", fs.readdirSync(imgDir).length);
