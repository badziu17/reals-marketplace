"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { ListingCard } from "@/components/listings/ListingCard";
import { formatPrice } from "@/lib/domain";
import { useIsMobileSearch } from "@/lib/useDevice";
import { Map, type AreaBounds } from "@/components/map/Map";
import { haversineKm } from "@/lib/geo";
import type { Listing } from "@/lib/types";

function MapPlaceholder() {
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-chip-warm text-sm text-ink-muted">
      Ładowanie mapy…
    </div>
  );
}

interface SearchResultsProps {
  listings: Listing[];
  loading: boolean;
  initialLoad: boolean;
  fav: Record<string, boolean>;
  onToggleFav: (id: string) => void;
  cmp: string[];
  onToggleCmp: (id: string) => void;
  /** Otwiera Detail overlay (iteracja 8) — z karty na liście albo z popupu na mapie. */
  onOpenDetail: (id: string) => void;
  /** Wysokość headera + paska filtrów (dynamicznie mierzona) — do wyliczenia sticky/maxHeight kolumn. */
  stickyOffset: number;
}

const ISO_MAX_MINUTES = 25;

function isWithinBounds(lat: number, lng: number, bounds: AreaBounds): boolean {
  const [w, s, e, n] = bounds;
  return lng >= w && lng <= e && lat >= s && lat <= n;
}

export function SearchResults({
  listings,
  loading,
  initialLoad,
  fav,
  onToggleFav,
  cmp,
  onToggleCmp,
  onOpenDetail,
  stickyOffset,
}: SearchResultsProps) {
  const { isMobile } = useIsMobileSearch();
  const [mobilePane, setMobilePane] = useState<"list" | "map">("list");

  // Map.tsx importuje "maplibre-gl" dopiero wewnątrz efektu (przeglądarka
  // only), więc sam komponent jest bezpieczny do SSR — ale mimo to renderujemy
  // go dopiero po zamontowaniu, tym samym sprawdzonym wzorcem co origin/device
  // w innych plikach, zamiast przez next/dynamic({ssr:false}) (Suspense +
  // wewnętrzny mechanizm bail-out-to-CSR, którego nie dało się tu zweryfikować
  // na żywo i który był głównym podejrzanym przy błędzie hydratacji na /search).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Nazwa celowo inna niż "selectedId" na poziomie SearchClient (Detail
  // overlay) — to jest tylko lokalny stan mini-popupu po kliknięciu pina,
  // niezależny od pełnego Detail.
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [areaBounds, setAreaBounds] = useState<AreaBounds | null>(null);
  const [isoOnly, setIsoOnly] = useState(false);

  // Własny punkt odniesienia (poprawka po iteracji 11) — zamiast sztywnego
  // "centrum" można wskazać dowolne miejsce na mapie i filtrować po
  // odległości od niego. Świadomie w km, nie w minutach — bez prawdziwego
  // API tras nie da się uczciwie policzyć czasu dojazdu do dowolnego punktu.
  const [pickingPoint, setPickingPoint] = useState(false);
  const [customPoint, setCustomPoint] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState(3);

  const handlePointPick = useCallback((point: [number, number]) => {
    setCustomPoint(point);
    setPickingPoint(false);
  }, []);

  const handleDrawComplete = useCallback((bounds: AreaBounds) => {
    setAreaBounds(bounds);
    setDrawingEnabled(false);
  }, []);

  // Rysowanie obszaru i "≤25 min do centrum" to doprecyzowanie na już
  // przefiltrowanym przez API zestawie — czysto klienckie, żeby lista i
  // mapa zawsze pokazywały dokładnie ten sam zbiór (kryterium hover↔highlight
  // wymaga, żeby oba widoki zgadzały się co do tego, co jest widoczne).
  const visibleListings = useMemo(() => {
    return listings.filter((l) => {
      if (isoOnly) {
        const commute = l.district.commute ? Number(l.district.commute) : null;
        if (commute == null || commute > ISO_MAX_MINUTES) return false;
      }
      if (areaBounds) {
        if (l.district.lat == null || l.district.lng == null) return false;
        if (!isWithinBounds(l.district.lat, l.district.lng, areaBounds)) return false;
      }
      if (customPoint) {
        if (l.district.lat == null || l.district.lng == null) return false;
        const [lng, lat] = customPoint;
        if (haversineKm(l.district.lat, l.district.lng, lat, lng) > radiusKm) return false;
      }
      return true;
    });
  }, [listings, isoOnly, areaBounds, customPoint, radiusKm]);

  const selectedPin = visibleListings.find((l) => l.id === selectedPinId);
  const refinedActive = isoOnly || !!areaBounds || !!customPoint;

  const listPane = (
    <div
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-[18px]"
      style={!isMobile ? { maxHeight: `calc(100vh - ${stickyOffset}px)` } : undefined}
    >
      {refinedActive && (
        <p className="text-xs font-semibold text-ink-faint">
          Pokazuję {visibleListings.length} z {listings.length} ofert w tym obszarze/zasięgu
        </p>
      )}

      {initialLoad && loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-card bg-chip-warm" />
          ))}
        </div>
      ) : visibleListings.length === 0 ? (
        <div className="py-16 text-center text-ink-faint">
          <div className="text-4xl">🏚️</div>
          <p className="mt-3 font-semibold text-ink-muted">Brak ofert dla tych filtrów.</p>
          <p className="mt-1 text-sm">Filtry zostają zapisane — niczego nie tracisz.</p>
        </div>
      ) : (
        <div className={`grid gap-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {visibleListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onFav={onToggleFav}
              isFaved={!!fav[listing.id]}
              onCompare={onToggleCmp}
              isCompared={cmp.includes(listing.id)}
              onMouseEnter={() => setHoveredId(listing.id)}
              onMouseLeave={() => setHoveredId((id) => (id === listing.id ? null : id))}
              highlighted={hoveredId === listing.id}
              onOpen={onOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );

  const mapPane = (
    <div
      className={`relative flex-1 ${!isMobile ? "border-l border-line" : ""}`}
      style={!isMobile ? { position: "sticky", top: stickyOffset, height: `calc(100vh - ${stickyOffset}px)` } : { height: 460 }}
    >
      {mounted ? (
        <Map
          listings={visibleListings}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={setSelectedPinId}
          drawingEnabled={drawingEnabled}
          onDrawComplete={handleDrawComplete}
          areaBounds={areaBounds}
          pickingPoint={pickingPoint}
          onPointPick={handlePointPick}
          customPoint={customPoint}
          className="h-full w-full"
        />
      ) : (
        <MapPlaceholder />
      )}

      {/* Kontrolki mapy */}
      <div className="absolute left-3.5 top-3.5 z-10 flex flex-col gap-2">
        <button
          onClick={() => setDrawingEnabled((v) => !v)}
          className={`flex items-center gap-1.5 rounded-pill border px-3 py-2 text-xs font-bold shadow-card transition ${
            drawingEnabled
              ? "border-terracotta bg-terracotta text-white"
              : "border-line bg-card/95 text-ink-secondary hover:border-terracotta/50"
          }`}
        >
          ▱ {drawingEnabled ? "Przeciągnij po mapie…" : "Rysuj obszar"}
        </button>
        <button
          onClick={() => setIsoOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-pill border px-3 py-2 text-xs font-bold shadow-card transition ${
            isoOnly
              ? "border-terracotta bg-terracotta text-white"
              : "border-line bg-card/95 text-ink-secondary hover:border-terracotta/50"
          }`}
        >
          🚆 ≤{ISO_MAX_MINUTES} min do centrum
        </button>

        <button
          onClick={() => setPickingPoint((v) => !v)}
          className={`flex items-center gap-1.5 rounded-pill border px-3 py-2 text-xs font-bold shadow-card transition ${
            pickingPoint
              ? "border-terracotta bg-terracotta text-white"
              : "border-line bg-card/95 text-ink-secondary hover:border-terracotta/50"
          }`}
        >
          📍 {pickingPoint ? "Kliknij na mapie…" : customPoint ? "Zmień punkt" : "Wybierz punkt"}
        </button>

        {customPoint && (
          <div className="flex flex-col gap-1.5 rounded-md border border-line bg-card/95 px-3 py-2 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-ink-secondary">≤{radiusKm} km od punktu</span>
              <button
                onClick={() => setCustomPoint(null)}
                aria-label="Usuń punkt odniesienia"
                className="text-ink-faint hover:text-terracotta"
              >
                ✕
              </button>
            </div>
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-[140px] accent-terracotta"
              aria-label="Promień od wybranego punktu"
            />
          </div>
        )}

        {areaBounds && (
          <button
            onClick={() => setAreaBounds(null)}
            className="flex items-center gap-1.5 rounded-pill border border-line bg-card/95 px-3 py-2 text-xs font-bold text-terracotta shadow-card"
          >
            ✕ Wyczyść obszar
          </button>
        )}
      </div>

      {/* Popup wybranej oferty (mini-podgląd na mapie) */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 z-10 w-64 rounded-card bg-card p-4 shadow-hero animate-rl-pop">
          <button
            onClick={() => setSelectedPinId(null)}
            className="absolute right-3 top-3 text-ink-muted hover:text-ink"
          >
            ✕
          </button>
          <div className="font-display text-lg font-bold tracking-heading text-ink">
            {formatPrice(selectedPin.price)} {selectedPin.type === "WYNAJEM" ? "zł/mies." : "zł"}
          </div>
          <div className="mt-1 text-sm font-semibold text-ink-secondary">
            {selectedPin.rooms} pok · {selectedPin.area} m²
          </div>
          <div className="mt-1 text-sm text-ink-muted">{selectedPin.district.name}</div>
          {selectedPin.district.commute && (
            <div className="mt-2 inline-block rounded-pill bg-chip-sage px-2.5 py-1 text-xs font-semibold text-bottle">
              🚆 {selectedPin.district.commute} min
            </div>
          )}
          <button
            onClick={() => onOpenDetail(selectedPin.id)}
            className="mt-3 w-full rounded-pill border border-line bg-bg-app px-3 py-2 text-xs font-bold text-ink-secondary transition hover:border-terracotta hover:text-terracotta"
          >
            Zobacz ofertę →
          </button>
        </div>
      )}

      {/* Legenda werdyktu AVM */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 rounded-card bg-card/90 p-3 text-xs font-semibold backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#2E7D4F]" /> Poniżej rynku
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#3F5142]" /> Uczciwa cena
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#C8553D]" /> Powyżej rynku
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="relative">
        {mobilePane === "list" ? listPane : mapPane}
        <button
          onClick={() => setMobilePane((p) => (p === "list" ? "map" : "list"))}
          className="fixed bottom-[22px] left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-pill bg-ink px-6 py-[13px] text-sm font-bold text-white shadow-hero"
        >
          {mobilePane === "list" ? "🗺 Pokaż mapę" : "☰ Pokaż listę"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1320px]">
      {listPane}
      {mapPane}
    </div>
  );
}
