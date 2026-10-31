import "server-only";
import * as cheerio from "cheerio";
import type { Cheerio } from "cheerio";
import type { AnyNode } from "domhandler";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { AUTHOR } from "./content";

type Part = { text: string; font: PDFFont };
type Align = "left" | "right" | "center" | "justify";

const PAGE = { w: 419.53, h: 595.28 }; // A5
const MARGIN = { x: 54, top: 60, bottom: 64 };
const INK = rgb(0.1, 0.1, 0.1);

export async function storyPdf({ title, html, author = AUTHOR }: { title: string; html: string; author?: string }) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setAuthor(author);
  const regular = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const boldItalic = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const charset = new Set(regular.getCharacterSet());
  const clean = (s: string) =>
    [...s.replace(/ /g, " ").replace(/[​-‍﻿­]/g, "")].map((c) => (charset.has(c.codePointAt(0)!) || /\s/.test(c) ? c : "?")).join("");

  const pages = [doc.addPage([PAGE.w, PAGE.h])];
  let y = PAGE.h - MARGIN.top;
  const room = PAGE.w - MARGIN.x * 2;
  const newPage = () => {
    pages.push(doc.addPage([PAGE.w, PAGE.h]));
    y = PAGE.h - MARGIN.top;
  };
  const need = (h: number) => {
    if (y - h < MARGIN.bottom) newPage();
  };

  const width = (w: Part[], size: number) => w.reduce((a, p) => a + p.font.widthOfTextAtSize(p.text, size), 0);

  function drawLine(words: Part[][], size: number, x: number, maxW: number, align: Align, last: boolean) {
    const spaceW = regular.widthOfTextAtSize(" ", size);
    const natural = words.reduce((a, w) => a + width(w, size), 0) + spaceW * (words.length - 1);
    let gap = spaceW;
    let start = x;
    if (align === "justify" && !last && words.length > 1) gap = (maxW - words.reduce((a, w) => a + width(w, size), 0)) / (words.length - 1);
    else if (align === "center") start = x + (maxW - natural) / 2;
    else if (align === "right") start = x + maxW - natural;
    const page = pages[pages.length - 1];
    let cx = start;
    for (const w of words) {
      for (const p of w) {
        page.drawText(p.text, { x: cx, y, size, font: p.font, color: INK });
        cx += p.font.widthOfTextAtSize(p.text, size);
      }
      cx += gap;
    }
  }

  /** Reparte las palabras en líneas del ancho dado y las dibuja, cambiando de página cuando hace falta. */
  function paragraph(words: (Part[] | "br")[], o: { size: number; lead: number; x?: number; maxW?: number; align?: Align; gapAfter?: number; first?: Part[] }) {
    const x = o.x ?? MARGIN.x;
    const maxW = o.maxW ?? room;
    const align = o.align ?? "justify";
    const lines: { words: Part[][]; last: boolean }[] = [];
    let cur: Part[][] = [];
    let curW = 0;
    const space = regular.widthOfTextAtSize(" ", o.size);
    const flush = (last: boolean) => {
      if (cur.length) lines.push({ words: cur, last });
      cur = [];
      curW = 0;
    };
    for (const w of words) {
      if (w === "br") {
        flush(true);
        continue;
      }
      const ww = width(w, o.size);
      if (cur.length && curW + space + ww > maxW) flush(false);
      curW += (cur.length ? space : 0) + ww;
      cur.push(w);
    }
    flush(true);
    lines.forEach((l, i) => {
      need(o.lead);
      y -= o.lead;
      if (i === 0 && o.first) pages[pages.length - 1].drawText(o.first.map((p) => p.text).join(""), { x: x - 12, y, size: o.size, font: regular, color: INK });
      drawLine(l.words, o.size, x, maxW, align, l.last);
    });
    y -= o.gapAfter ?? 0;
  }

  function runs($: cheerio.CheerioAPI, nodes: Cheerio<AnyNode>, base: { b: boolean; i: boolean }) {
    const out: (Part[] | "br")[] = [];
    let word: Part[] = [];
    const push = () => {
      if (word.length) out.push(word);
      word = [];
    };
    const fontFor = (b: boolean, i: boolean) => (b && i ? boldItalic : b ? bold : i ? italic : regular);
    const walk = (list: typeof nodes, st: { b: boolean; i: boolean }) => {
      list.each((_, n) => {
        if (n.type === "text") {
          const text = clean((n as unknown as { data: string }).data);
          for (const piece of text.split(/(\s+)/)) {
            if (!piece) continue;
            if (/^\s+$/.test(piece)) push();
            else word.push({ text: piece, font: fontFor(st.b, st.i) });
          }
        } else if (n.type === "tag") {
          if (n.name === "br") {
            push();
            out.push("br");
          } else if (n.name === "img" || n.name === "figure") return;
          else walk($(n).contents(), { b: st.b || n.name === "strong", i: st.i || n.name === "em" });
        }
      });
    };
    walk(nodes, base);
    push();
    return out;
  }

  // Si tras el último separador solo hay avisos y enlaces (como en los textos traídos del blog antiguo), no se incluyen
  const cut = html.lastIndexOf("<hr");
  const body = cut > 0 && /<a\s/i.test(html.slice(cut)) ? html.slice(0, cut) : html;
  const $ = cheerio.load(`<div id="r">${body}</div>`, null, false);

  // Cabecera: título y autor
  const titleWords = title
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => [{ text: clean(t), font: bold }]);
  paragraph(titleWords, { size: 20, lead: 25, align: "center", gapAfter: 6 });
  paragraph([[{ text: clean(author), font: italic }]], { size: 11.5, lead: 15, align: "center", gapAfter: 22 });

  const alignOf = (el: { attribs?: Record<string, string> }): Align => {
    const a = /text-align\s*:\s*(left|right|center|justify)/i.exec(el.attribs?.style ?? "")?.[1]?.toLowerCase();
    return (a as Align) ?? "justify";
  };

  const blocks = (list: Cheerio<AnyNode>) => {
    list.contents().each((_, n) => {
      if (n.type === "text") {
        const w = runs($, $([n]), { b: false, i: false });
        if (w.length) paragraph(w, { size: 12, lead: 17, gapAfter: 8 });
        return;
      }
      if (n.type !== "tag") return;
      const $n = $(n);
      switch (n.name) {
        case "div":
        case "ul":
        case "ol":
          blocks($n);
          break;
        case "p":
          paragraph(runs($, $n.contents(), { b: false, i: false }), { size: 12, lead: 17, align: alignOf(n), gapAfter: 8 });
          break;
        case "h2":
        case "h3": {
          const big = n.name === "h2";
          y -= big ? 8 : 4;
          need(60);
          paragraph(runs($, $n.contents(), { b: true, i: false }), { size: big ? 16 : 13.5, lead: big ? 21 : 18, align: "left", gapAfter: 6 });
          break;
        }
        case "blockquote":
          paragraph(runs($, $n.contents(), { b: false, i: true }), { size: 12, lead: 17, x: MARGIN.x + 22, maxW: room - 22, align: alignOf(n), gapAfter: 8 });
          break;
        case "li":
          paragraph(runs($, $n.contents(), { b: false, i: false }), { size: 12, lead: 17, x: MARGIN.x + 18, maxW: room - 18, align: "left", gapAfter: 4, first: [{ text: "•", font: regular }] });
          break;
        case "hr":
          y -= 4;
          paragraph([[{ text: "*", font: regular }], [{ text: "*", font: regular }], [{ text: "*", font: regular }]], { size: 12, lead: 17, align: "center", gapAfter: 8 });
          break;
        default:
          break; // figuras e imágenes no van en el PDF
      }
    });
  };
  blocks($("#r"));

  const font = italic;
  pages.forEach((p, i) => {
    const label = String(i + 1);
    p.drawText(label, { x: PAGE.w / 2 - font.widthOfTextAtSize(label, 9.5) / 2, y: 34, size: 9.5, font, color: rgb(0.4, 0.4, 0.4) });
  });
  return doc.save();
}
