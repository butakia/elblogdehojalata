// Agrega un cuento al contenido base (content/stories.json) a partir de un .txt (un párrafo por línea).
import fs from "node:fs";
const [, , file, slug, title, views] = process.argv;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const paras = fs.readFileSync(file, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const html = paras.map((p) => "<p>" + esc(p) + "</p>").join("\n");
const plain = paras.join(" ").replace(/\s+/g, " ");
const words = plain.split(" ").length;
const list = JSON.parse(fs.readFileSync("content/stories.json", "utf8"));
if (list.some((s) => s.slug === slug)) { console.log("ya existe", slug); process.exit(1); }
const story = {
  id: Date.now(),
  slug,
  title,
  date: new Date().toISOString(),
  html,
  cover: null,
  excerpt: plain.slice(0, 200).replace(/\s\S*$/, "") + "…",
  words,
  minutes: Math.max(1, Math.round(words / 200)),
  kind: words < 450 ? "microcuento" : "cuento",
};
if (views) story.views = Number(views);
list.unshift(story);
fs.writeFileSync("content/stories.json", JSON.stringify(list, null, 1));
console.log("agregado:", slug, words, "palabras,", story.minutes, "min");
