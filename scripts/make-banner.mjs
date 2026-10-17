// Convierte el dibujo del gato (trazos oscuros sobre crema) en línea limpia sobre transparente.
// Trazos (muy oscuros) = opacos; rellenos marrones = casi invisibles. Versión blanca (tema oscuro) y de tinta (tema claro).
import sharp from "sharp";

const src = "public/img/2021-06-elgatoblanco.webp";
const { data, info } = await sharp(src).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

function build(rgb) {
  const out = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    const lum = 0.299 * data[p * C] + 0.587 * data[p * C + 1] + 0.114 * data[p * C + 2];
    let a = (64 - lum) / (64 - 46);
    a = Math.max(0, Math.min(1, a));
    a = a * a * (3 - 2 * a);
    if ((x > 870 && y < 210) || (x > 925 && y < 258) || (x > 985 && y < 395)) a = 0; // bloque macizo de la cola
    out[p * 4] = rgb[0]; out[p * 4 + 1] = rgb[1]; out[p * 4 + 2] = rgb[2]; out[p * 4 + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 8 }).resize({ width: 900, withoutEnlargement: true }).png({ compressionLevel: 9 });
}

await build([244, 239, 228]).toFile("public/img/gato-blanco.png");
await build([43, 29, 18]).toFile("public/img/gato-tinta.png");
console.log("ok");
