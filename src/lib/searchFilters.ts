// Stan filtrów ekranu Search — iteracja 6.
//
// Kluczowy wyróżnik projektu (patrz DESIGN_SPEC.md): filtry synchronizowane
// z URL query params, więc wynik wyszukiwania jest linkowalny i nie resetuje
// się przy odświeżeniu/powrocie. Nazwy pól w tym module pokrywają się 1:1
// z parametrami, które rozumie `GET /api/listings` (iteracja 3) — dzięki
// temu jeden obiekt URLSearchParams służy jednocześnie jako adres w pasku
// przeglądarki i jako query do API, bez osobnego mapowania.

import type { MarketType, OfferType } from "./types";

export type SortOption = "foryou" | "price_asc" | "price_desc" | "area_desc" | "fresh";

export interface SearchFilters {
  type: OfferType;
  q: string;
  priceMax: number; // aktywne gdy type === "KUP"
  rentMax: number; // aktywne gdy type === "WYNAJEM"
  rooms: number[]; // 1 | 2 | 3 | 4 (4 = "4+")
  areaMin: number;
  market: MarketType | "any";
  amenities: string[];
  onlyFair: boolean;
  sort: SortOption;
  /** District.code[] — z onboardingu (iteracja 10) lub przyszłego pickera dzielnic. */
  districts: string[];
  /** District.noise === "Cicho" — z onboardingu (iteracja 10). */
  quietOnly: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  type: "KUP",
  q: "",
  priceMax: 3_000_000,
  rentMax: 6_000,
  rooms: [],
  areaMin: 0,
  market: "any",
  amenities: [],
  onlyFair: false,
  sort: "foryou",
  districts: [],
  quietOnly: false,
};

const SORT_OPTIONS: SortOption[] = ["foryou", "price_asc", "price_desc", "area_desc", "fresh"];

interface ParamsLike {
  get(name: string): string | null;
}

/**
 * Odczytuje stan filtrów z obiektu przypominającego URLSearchParams (np.
 * przy wejściu na /search?... z linku). Przyjmuje strukturalnie zarówno
 * URLSearchParams, jak i ReadonlyURLSearchParams z next/navigation.
 */
export function parseFilters(params: ParamsLike): SearchFilters {
  const type: OfferType = params.get("type") === "WYNAJEM" ? "WYNAJEM" : "KUP";

  const rooms = (params.get("rooms") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 4);

  const marketParam = params.get("market");
  const market: MarketType | "any" =
    marketParam === "PIERWOTNY" || marketParam === "WTORNY" ? marketParam : "any";

  const amenities = (params.get("amenities") ?? "").split(",").filter(Boolean);
  const districts = (params.get("districts") ?? "").split(",").filter(Boolean);

  const sortParam = params.get("sort") as SortOption | null;
  const sort: SortOption = sortParam && SORT_OPTIONS.includes(sortParam) ? sortParam : "foryou";

  return {
    type,
    q: params.get("q") ?? "",
    priceMax: Number(params.get("priceMax")) || DEFAULT_FILTERS.priceMax,
    rentMax: Number(params.get("rentMax")) || DEFAULT_FILTERS.rentMax,
    rooms,
    areaMin: Number(params.get("areaMin")) || 0,
    market,
    amenities,
    onlyFair: params.get("onlyFair") === "true",
    sort,
    districts,
    quietOnly: params.get("quietOnly") === "true",
  };
}

/**
 * Serializuje filtry do URLSearchParams — kompaktowo (pomija wartości
 * neutralne), żeby link do wyszukiwania zostawał czytelny. Wyjątek: `type`
 * jest zawsze obecny, bo jego brak w API oznacza "dowolny typ", a nie
 * domyślny "KUP" — pominięcie zepsułoby wynik, nie tylko estetykę URL.
 *
 * Ten sam obiekt jest używany zarówno do `router.replace` (pasek adresu),
 * jak i do `fetch('/api/listings?' + ...)` — patrz SearchClient.
 */
export function filtersToParams(f: SearchFilters): URLSearchParams {
  const p = new URLSearchParams();
  p.set("type", f.type);
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.type === "KUP" && f.priceMax < DEFAULT_FILTERS.priceMax) {
    p.set("priceMax", String(f.priceMax));
  }
  if (f.type === "WYNAJEM" && f.rentMax < DEFAULT_FILTERS.rentMax) {
    p.set("rentMax", String(f.rentMax));
  }
  if (f.rooms.length) p.set("rooms", [...f.rooms].sort().join(","));
  if (f.areaMin > 0) p.set("areaMin", String(f.areaMin));
  if (f.market !== "any") p.set("market", f.market);
  if (f.amenities.length) p.set("amenities", [...f.amenities].sort().join(","));
  if (f.onlyFair) p.set("onlyFair", "true");
  if (f.sort !== "foryou") p.set("sort", f.sort);
  if (f.districts.length) p.set("districts", [...f.districts].sort().join(","));
  if (f.quietOnly) p.set("quietOnly", "true");
  return p;
}

/** Liczba aktywnych filtrów schowanych w panelu "Więcej" — do etykiety przycisku. */
export function moreFiltersCount(f: SearchFilters): number {
  let n = 0;
  if (f.areaMin > 0) n += 1;
  if (f.market !== "any") n += 1;
  n += f.amenities.length;
  if (f.onlyFair) n += 1;
  if (f.quietOnly) n += 1;
  return n;
}

export function filtersEqual(a: SearchFilters, b: SearchFilters): boolean {
  return filtersToParams(a).toString() === filtersToParams(b).toString();
}
