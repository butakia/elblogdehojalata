// Convierte imagenes a webp liviano, reescribe referencias y deriva micro.json y dibujos.json
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as cheerio from "cheerio";

const dir = "public/img";
const map = {};
for (const f of fs.readdirSync(dir)) {
  const ext = path.extname(f).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext) || f.includes("elgatokesonrie") || f.includes("cropped-portwa")) continue;
  const out = f.slice(0, -ext.length) + ".webp";
  await sharp(path.join(dir, f)).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(dir, out));
  fs.unlinkSync(path.join(dir, f));
  map["/img/" + f] = "/img/" + out;
}
for (const file of ["content/stories.json", "content/pages.json"]) {
  let s = fs.readFileSync(file, "utf8");
  for (const [a, b] of Object.entries(map)) s = s.split(a).join(b);
  fs.writeFileSync(file, s);
}
const pages = JSON.parse(fs.readFileSync("content/pages.json", "utf8"));
// microcuentos: cada h2 abre un texto
const $ = cheerio.load(pages["balcon-de-los-microcuentos"].html, null, false);
const micro = []; let intro = "", cur = null;
$.root().children().each((_, el) => {
  if (el.name === "h2") { cur = { title: $(el).text().trim(), html: "" }; micro.push(cur); }
  else if (cur) cur.html += $.html(el); else intro += $.html(el);
});
fs.writeFileSync("content/micro.json", JSON.stringify({ intro, items: micro.filter(m => m.html.trim()) }, null, 1));
const d = cheerio.load(pages["cochera-de-los-dibujos"].html, null, false);
const dibujos = d("img").toArray().map(e => ({ src: d(e).attr("src"), w: +d(e).attr("width") || 1024, h: +d(e).attr("height") || 1024 }));
fs.writeFileSync("content/dibujos.json", JSON.stringify(dibujos, null, 1));
console.log(micro.length, "microcuentos;", dibujos.length, "dibujos");
