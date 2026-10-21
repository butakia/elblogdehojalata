/** Contador de lecturas simulado: estable por cuento y que crece con el tiempo. */
export function simulatedViews(slug: string, dateIso: string) {
  let h = 2166136261;
  for (const ch of slug) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const base = 50 + (h % 120);
  const days = Math.max(0, (Date.now() - new Date(dateIso).getTime()) / 86_400_000);
  return Math.min(200, base + Math.floor(Math.sqrt(days) * 0.6));
}

/** Microcuentos: empiezan en 21 lecturas y suman una por cada día desde su publicación. */
export function microViews(dateIso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(dateIso).getTime()) / 86_400_000));
  return 21 + days;
}
