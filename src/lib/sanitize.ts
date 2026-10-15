import "server-only";
import * as cheerio from "cheerio";

const KEEP = new Set(["p", "h2", "h3", "blockquote", "ul", "ol", "li", "strong", "em", "a", "br", "hr", "figure", "img", "figcaption"]);
const RENAME: Record<string, string> = { b: "strong", i: "em", h1: "h2", h4: "h3", h5: "h3", h6: "h3", div: "p" };

const safeUrl = (u: string) => /^(https?:\/\/|\/|mailto:)/i.test(u.trim());

/** Deja solo etiquetas y atributos seguros del editor. */
export function sanitizeHtml(input: string): string {
  const $ = cheerio.load(`<div id="r">${input}</div>`, null, false);
  $("script, style, iframe, object, embed, form, input, button, svg").remove();
  // de adentro hacia afuera
  $("#r *")
    .toArray()
    .reverse()
    .forEach((el) => {
      if (el.type !== "tag") return;
      const $el = $(el);
      let name = el.name;
      if (RENAME[name]) {
        el.name = RENAME[name];
        name = el.name;
      }
      if (!KEEP.has(name)) {
        $el.replaceWith($el.contents());
        return;
      }
      const attrs = { ...el.attribs };
      for (const a of Object.keys(attrs)) $el.removeAttr(a);
      if (name === "a" && attrs.href && safeUrl(attrs.href)) {
        $el.attr({ href: attrs.href.trim(), target: "_blank", rel: "noopener noreferrer" });
      } else if (name === "a") {
        $el.replaceWith($el.contents());
      }
      if (name === "img") {
        if (attrs.src && safeUrl(attrs.src) && !attrs.src.startsWith("mailto:")) {
          $el.attr({ src: attrs.src.trim(), alt: (attrs.alt || "").slice(0, 200), loading: "lazy" });
          if (/^\d+$/.test(attrs.width || "") && /^\d+$/.test(attrs.height || "")) $el.attr({ width: attrs.width, height: attrs.height });
        } else $el.remove();
      }
    });
  // texto suelto en la raíz → párrafos
  const root = $("#r");
  root.contents().each((_, n) => {
    if (n.type === "text" && (n as unknown as { data: string }).data.trim()) $(n).replaceWith(`<p>${$.text([n])}</p>`);
  });
  // párrafos vacíos y figuras sin imagen
  root.find("p, h2, h3, blockquote, li").each((_, el) => {
    if (!$(el).text().trim() && !$(el).find("img").length) $(el).remove();
  });
  root.find("figure").each((_, el) => {
    if (!$(el).find("img").length) $(el).remove();
  });
  return (root.html() || "").replace(/\n{2,}/g, "\n").trim();
}

export function plainText(html: string) {
  return cheerio.load(html, null, false).text().replace(/\s+/g, " ").trim();
}
