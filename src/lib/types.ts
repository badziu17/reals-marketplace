// Typy domenowe REALS — mapowane 1:1 z modelem Prisma i prototypu (DESIGN_SPEC.md)

export type City = "GDANSK" | "GDYNIA" | "SOPOT";
export type MarketType = "PIERWOTNY" | "WTORNY";
export type OfferType = "KUP" | "WYNAJEM";
export type ListingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PriceVerdict = "below" | "normal" | "above" | null;

export interface District {
  code: string;       // slug, np. "gdansk-wrzeszcz"
  name: string;       // wyświetlana, np. "Gdańsk Wrzeszcz"
  city: City;
  cx: number;         // pozycja na mapie schematycznej
  cy: number;
  lat: number | null; // geokodowanie realne (iteracja 5)
  lng: number | null;
  fairPrice: number;  // zł/m² — baza dla AVM
  commute: string | null; // minuty dojazdu jako string (np. "38")
  noise: string;      // "Cicho" | "Średnio" | "Głośno"
  schools: number;    // 1–5
}

export interface Listing {
  id: string;
  districtCode: string;
  district: District;
  rooms: number;
  area: number;
  floor: number | null;
  year: number | null;
  market: MarketType;
  type: OfferType;
  price: number;
  amenities: string[];
  sources: string[];
  avmLow: number | null;
  avmHigh: number | null;
  fresh: string;       // ISO date string
  gradient: string | null;
  quality: number;
  featured: boolean;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

// Wyliczane po stronie klienta/serwera — nie w DB
export interface ListingWithVerdict extends Listing {
  verdict: PriceVerdict;
  pricePerM2: number;
}

// Parametry filtru dla GET /api/listings
export interface ListingFilters {
  type?: OfferType;
  priceMax?: number;
  rentMax?: number;
  rooms?: number[];
  areaMin?: number;
  market?: MarketType | "any";
  amenities?: string[];
  onlyFair?: boolean;
  districtCode?: string;
  featured?: boolean;
  sort?: "foryou" | "price_asc" | "price_desc" | "area_desc" | "fresh";
  limit?: number;
  offset?: number;
}
