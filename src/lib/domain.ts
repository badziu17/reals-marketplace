import type { Listing, PriceVerdict } from "./types";

/**
 * Werdykt ceny AVM — tylko dla ofert KUP.
 * Zgodny z prototypem: below < avmLow, above > avmHigh, otherwise normal.
 */
export function getVerdict(listing: Listing): PriceVerdict {
  if (listing.type === "WYNAJEM") return null;
  if (listing.avmLow == null || listing.avmHigh == null) return null;
  if (listing.price < listing.avmLow) return "below";
  if (listing.price > listing.avmHigh) return "above";
  return "normal";
}

export const VERDICT_LABEL: Record<NonNullable<PriceVerdict>, string> = {
  below: "Poniżej rynku",
  normal: "Uczciwa cena",
  above: "Powyżej rynku",
};

export const VERDICT_COLOR: Record<NonNullable<PriceVerdict>, string> = {
  below: "#2E7D4F",
  normal: "#3F5142",
  above: "#C8553D",
};

export const VERDICT_DOT: Record<NonNullable<PriceVerdict>, string> = {
  below: "▾",
  normal: "✓",
  above: "▴",
};

/**
 * Rata kredytu hipotecznego (annuitet).
 * Parametry z prototypu: LTV 80%, oprocentowanie 7,4% rocznie, 300 miesięcy.
 */
export function monthlyMortgage(price: number): number {
  const principal = price * 0.8;
  const r = 0.074 / 12;
  const n = 300;
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

/**
 * Szacowany czynsz administracyjny (z prototypu: area * 14 zł/m²).
 */
export function estimatedRent(area: number): number {
  return Math.round(area * 14);
}

/**
 * PCC przy zakupie na rynku wtórnym: 2% ceny.
 */
export function pcc(price: number): number {
  return Math.round(price * 0.02);
}

/**
 * Cena za m².
 */
export function pricePerM2(price: number, area: number): number {
  return Math.round(price / area);
}

/**
 * Formatowanie liczby po polsku: 1 290 000 zł
 */
export function formatPrice(n: number): string {
  return n.toLocaleString("pl-PL");
}

/**
 * Jakość oferty (0–99) — zgodna z algorytmem z prototypu.
 * Używana przy seedowaniu i przy dodawaniu nowych ofert.
 */
export function computeQuality(listing: {
  amenities: string[];
  sources: string[];
  year: number | null;
  fresh: Date;
}): number {
  const daysSinceFresh = Math.floor(
    (Date.now() - listing.fresh.getTime()) / (1000 * 60 * 60 * 24)
  );
  let q = 50;
  q += Math.min(20, listing.amenities.length * 6);
  q += daysSinceFresh <= 3 ? 15 : daysSinceFresh <= 7 ? 8 : 0;
  q += listing.sources.length === 1 ? 10 : 4;
  q += (listing.year ?? 0) >= 2020 ? 8 : 2;
  return Math.min(99, q);
}
