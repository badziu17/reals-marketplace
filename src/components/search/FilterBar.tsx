"use client";

import { useState } from "react";
import { IconSearch } from "@/components/ui/icons";
import { DEFAULT_FILTERS, moreFiltersCount, type SearchFilters, type SortOption } from "@/lib/searchFilters";

const ROOM_OPTIONS = [1, 2, 3, 4] as const;
const AMENITY_OPTIONS = ["balkon", "ogródek", "parking", "winda"] as const;

function chipClass(active: boolean) {
  return active
    ? "border border-terracotta bg-terracotta text-white"
    : "border border-line bg-card text-ink-secondary hover:border-terracotta/50";
}

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  resultCount: number;
  loading: boolean;
  shareUrl: string;
  copied: boolean;
  onCopyLink: () => void;
  onSaveAlert: () => void;
}

export function FilterBar({
  filters,
  onChange,
  resultCount,
  loading,
  shareUrl,
  copied,
  onCopyLink,
  onSaveAlert,
}: FilterBarProps) {
  const [showMore, setShowMore] = useState(false);
  const extraCount = moreFiltersCount(filters);

  function patch(next: Partial<SearchFilters>) {
    onChange({ ...filters, ...next });
  }

  function toggleRoom(n: number) {
    patch({
      rooms: filters.rooms.includes(n) ? filters.rooms.filter((r) => r !== n) : [...filters.rooms, n],
    });
  }
  function toggleAmenity(a: string) {
    patch({
      amenities: filters.amenities.includes(a)
        ? filters.amenities.filter((x) => x !== a)
        : [...filters.amenities, a],
    });
  }
  function toggleMarket(m: "PIERWOTNY" | "WTORNY") {
    patch({ market: filters.market === m ? "any" : m });
  }

  const priceVal = filters.type === "KUP" ? filters.priceMax : filters.rentMax;
  const priceSliderMax = filters.type === "KUP" ? DEFAULT_FILTERS.priceMax : DEFAULT_FILTERS.rentMax;
  const priceStep = filters.type === "KUP" ? 50_000 : 250;
  const priceLabel =
    priceVal >= priceSliderMax
      ? "bez limitu"
      : `do ${priceVal.toLocaleString("pl-PL")} zł${filters.type === "WYNAJEM" ? "/mies." : ""}`;

  return (
    <div className="sticky top-[57px] z-30 border-b border-line bg-bg-app/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-[9px] px-[22px] py-[13px]">
        {/* Kup / Wynajem */}
        <div className="flex gap-0.5 rounded-pill bg-chip-warm p-[3px]">
          <button
            onClick={() => patch({ type: "KUP" })}
            className={`rounded-pill px-4 py-2 text-sm font-bold transition ${
              filters.type === "KUP" ? "bg-terracotta text-white" : "text-ink-secondary"
            }`}
          >
            Kup
          </button>
          <button
            onClick={() => patch({ type: "WYNAJEM" })}
            className={`rounded-pill px-4 py-2 text-sm font-bold transition ${
              filters.type === "WYNAJEM" ? "bg-terracotta text-white" : "text-ink-secondary"
            }`}
          >
            Wynajem
          </button>
        </div>

        {/* Szukaj tekstowo */}
        <div className="relative min-w-[180px] flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-placeholder" />
          <input
            value={filters.q}
            onChange={(e) => patch({ q: e.target.value })}
            placeholder="Miasto, dzielnica…"
            className="w-full rounded-pill border border-line bg-card py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-placeholder focus:border-terracotta/60"
          />
        </div>

        {/* Cena / czynsz */}
        <div className="flex items-center gap-[9px] rounded-pill border border-line bg-card px-[15px] py-2">
          <span className="text-xs font-semibold text-ink-faint">do</span>
          <input
            type="range"
            min={0}
            max={priceSliderMax}
            step={priceStep}
            value={priceVal}
            onChange={(e) =>
              filters.type === "KUP"
                ? patch({ priceMax: Number(e.target.value) })
                : patch({ rentMax: Number(e.target.value) })
            }
            className="w-[110px] accent-terracotta"
            aria-label={filters.type === "KUP" ? "Cena maksymalna" : "Czynsz maksymalny"}
          />
          <span className="min-w-[76px] font-mono text-xs font-bold text-ink">{priceLabel}</span>
        </div>

        {/* Pokoje */}
        <div className="flex gap-[5px]">
          {ROOM_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => toggleRoom(n)}
              className={`rounded-pill px-[11px] py-[7px] text-xs font-bold transition ${chipClass(
                filters.rooms.includes(n)
              )}`}
            >
              {n === 4 ? "4+" : n}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowMore((v) => !v)}
          className={`whitespace-nowrap rounded-pill px-[14px] py-2 text-sm font-bold transition ${chipClass(
            showMore || extraCount > 0
          )}`}
        >
          Więcej{extraCount > 0 ? ` (${extraCount})` : ""}
        </button>

        {filters.districts.length > 0 && (
          <button
            onClick={() => patch({ districts: [] })}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-pill border border-terracotta bg-terracotta px-[14px] py-2 text-sm font-bold text-white"
            title="Wyczyść wybór dzielnic"
          >
            📍 {filters.districts.length} {filters.districts.length === 1 ? "dzielnica" : "dzielnice"} ✕
          </button>
        )}

        <div className="flex-1" />

        <span className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[13px] font-bold text-terracotta">
          {loading ? (
            "…"
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {resultCount} {resultCount === 1 ? "oferta" : "ofert"}
            </>
          )}
        </span>

        <select
          value={filters.sort}
          onChange={(e) => patch({ sort: e.target.value as SortOption })}
          className="cursor-pointer rounded-pill border border-line bg-card px-[11px] py-2 text-[13px] text-ink-secondary outline-none focus:border-terracotta/60"
        >
          <option value="foryou">Dla Ciebie</option>
          <option value="price_asc">Cena: od najniższej</option>
          <option value="price_desc">Cena: od najwyższej</option>
          <option value="area_desc">Największe metraże</option>
          <option value="fresh">Najnowsze</option>
        </select>
      </div>

      {/* Panel "Więcej filtrów" */}
      {showMore && (
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-[9px] px-[22px] pb-[13px]">
          <div className="flex items-center gap-[9px] rounded-pill border border-line bg-card px-[15px] py-2">
            <span className="text-xs font-semibold text-ink-faint">metraż min</span>
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={filters.areaMin}
              onChange={(e) => patch({ areaMin: Number(e.target.value) })}
              className="w-[100px] accent-terracotta"
              aria-label="Metraż minimalny"
            />
            <span className="min-w-[52px] font-mono text-xs font-bold text-ink">
              {filters.areaMin > 0 ? `${filters.areaMin} m²` : "dowolny"}
            </span>
          </div>

          <button
            onClick={() => toggleMarket("WTORNY")}
            className={`rounded-pill px-[14px] py-2 text-sm font-bold transition ${chipClass(
              filters.market === "WTORNY"
            )}`}
          >
            Wtórny
          </button>
          <button
            onClick={() => toggleMarket("PIERWOTNY")}
            className={`rounded-pill px-[14px] py-2 text-sm font-bold transition ${chipClass(
              filters.market === "PIERWOTNY"
            )}`}
          >
            Pierwotny
          </button>

          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`rounded-pill px-[14px] py-2 text-sm font-bold capitalize transition ${chipClass(
                filters.amenities.includes(a)
              )}`}
            >
              {a}
            </button>
          ))}

          <button
            onClick={() => patch({ onlyFair: !filters.onlyFair })}
            className={`rounded-pill px-[14px] py-2 text-sm font-bold transition ${chipClass(filters.onlyFair)}`}
          >
            ✓ tylko uczciwa cena
          </button>

          <button
            onClick={() => patch({ quietOnly: !filters.quietOnly })}
            className={`rounded-pill px-[14px] py-2 text-sm font-bold transition ${chipClass(filters.quietOnly)}`}
          >
            🔇 tylko ciche dzielnice
          </button>
        </div>
      )}

      {/* Pasek sync URL — filtry są linkowalne, nic się nie resetuje */}
      <div className="flex items-center gap-[9px] bg-[#F4EADD] px-[22px] py-2">
        <span className="hidden shrink-0 text-[11px] font-bold text-ink-faint sm:inline">
          Link do wyszukiwania:
        </span>
        <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11.5px] text-ink-muted">
          {shareUrl}
        </code>
        <button
          onClick={onCopyLink}
          className={`flex shrink-0 items-center gap-1.5 text-[11.5px] font-bold transition ${
            copied ? "text-sage-deep" : "text-terracotta"
          }`}
        >
          {copied ? "✓ Skopiowano" : "Kopiuj link"}
        </button>
        <button
          onClick={onSaveAlert}
          className="shrink-0 rounded-pill border border-terracotta/30 bg-card px-3 py-[5px] text-[11.5px] font-bold text-terracotta"
        >
          + Zapisz alert
        </button>
      </div>
    </div>
  );
}
