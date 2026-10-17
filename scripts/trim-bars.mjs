// Detecta y recorta franjas negras (letterbox) en las portadas. Uso: node scripts/trim-bars.mjs [--apply]
import fs from "node:fs";
import sharp from "sharp";

const apply = process.argv.includes("--apply");
const stories = JSON.parse(fs.readFileSync("content/stories.json", "utf8"));
const covers = [...new Set(stories.map((s) => s.cover).filter(Boolean))];
const MAXV = 22; // brillo máximo permitido dentro de una franja (negro casi puro)

for (const c of covers) {
  const file = "public" + c;
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const rowMax = (y) => { let m = 0; for (let x = 0; x < W; x++) m = Math.max(m, data[y * W + x]); return m; };
  const colMax = (x) => { let m = 0; for (let y = 0; y < H; y++) m = Math.max(m, data[y * W + x]); return m; };
  let top = 0, bottom = H - 1, left = 0, right = W - 1;
  while (top < H / 3 && rowMax(top) <= MAXV) top++;
  while (bottom > H * 2 / 3 && rowMax(bottom) <= MAXV) bottom--;
  while (left < W / 3 && colMax(left) <= MAXV) left++;
  while (right > W * 2 / 3 && colMax(right) <= MAXV) right--;
  const cutH = top + (H - 1 - bottom), cutW = left + (W - 1 - right);
  const significant = cutH >= H * 0.03 || cutW >= W * 0.03;
  console.log(`${significant ? "RECORTAR" : "ok      "} ${c} ${W}x${H} -> arriba ${top}, abajo ${H - 1 - bottom}, izq ${left}, der ${W - 1 - right}`);
  if (significant && apply) {
    const buf = await sharp(file).extract({ left, top, width: right - left + 1, height: bottom - top + 1 }).webp({ quality: 82 }).toBuffer();
    fs.writeFileSync(file, buf);
  }
}
