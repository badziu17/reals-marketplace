"use client";

import { useEffect, useRef, useCallback } from "react";
import { getVerdict, VERDICT_COLOR } from "@/lib/domain";

type MapLibreMap = import("maplibre-gl").Map;
type Marker = import("maplibre-gl").Marker;
type GeoJSONSource = import("maplibre-gl").GeoJSONSource;

interface ListingPin {
  id: string; price: number; type: string; rooms: number; area: number;
  avmLow: number | null; avmHigh: number | null;
  district: { name: string; lat: number | null; lng: number | null; };
}

/** [west, south, east, north] — prostokąt w układzie geograficznym. */
export type AreaBounds = [number, number, number, number];

interface MapProps {
  listings: ListingPin[];
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  className?: string;
  /** Tryb rysowania obszaru — przeciągnięcie po mapie zaznacza prostokąt. */
  drawingEnabled?: boolean;
  onDrawComplete?: (bounds: AreaBounds) => void;
  /** Aktualnie zaznaczony obszar (rysowany jako warstwa GeoJSON). */
  areaBounds?: AreaBounds | null;
}

const TROJMIASTO_CENTER: [number, number] = [18.57, 54.40];
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";
const AREA_SOURCE_ID = "reals-draw-area";
const AREA_FILL_LAYER = "reals-draw-area-fill";
const AREA_OUTLINE_LAYER = "reals-draw-area-outline";

function priceLabel(l: ListingPin): string {
  if (l.type === "WYNAJEM") return `${Math.round(l.price / 1000)}k/mies`;
  if (l.price >= 1_000_000) return `${(l.price / 1_000_000).toFixed(1)}M`;
  return `${Math.round(l.price / 1000)}k`;
}

function areaGeoJSON(bounds: AreaBounds): GeoJSON.Feature {
  const [w, s, e, n] = bounds;
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]],
    },
  };
}

export function Map({
  listings,
  hoveredId,
  onHover,
  onSelect,
  className,
  drawingEnabled,
  onDrawComplete,
  areaBounds,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const loadedRef = useRef(false);

  // Refy na "żywe" wartości potrzebne wewnątrz zdarzeń DOM (mouseenter itp.),
  // które łapią zmienne z domknięcia z momentu utworzenia markera — bez tego
  // handler z pierwszego renderu widziałby zawsze pierwszą wersję callbacków.
  const listingsRef = useRef(listings);
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  listingsRef.current = listings;
  onHoverRef.current = onHover;
  onSelectRef.current = onSelect;

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    import("maplibre-gl").then((ml) => {
      // Mapa mogła zostać odmontowana zanim import się rozwiązał
      if (!mapRef.current) return;
      listingsRef.current.forEach((listing) => {
        const { lat, lng } = listing.district;
        if (!lat || !lng) return;
        const verdict = getVerdict(listing as Parameters<typeof getVerdict>[0]);
        const color = verdict ? VERDICT_COLOR[verdict] : "#33271D";
        const el = document.createElement("div");
        el.style.cssText = `background:${color};color:white;padding:5px 10px;border-radius:999px;font-family:'Hanken Grotesk',sans-serif;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid white;transition:transform 0.15s;user-select:none;`;
        el.textContent = priceLabel(listing);
        el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.1)"; onHoverRef.current?.(listing.id); });
        el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; onHoverRef.current?.(null); });
        el.addEventListener("click", () => onSelectRef.current?.(listing.id));
        const jitter = (Math.random() - 0.5) * 0.008;
        const marker = new ml.Marker({ element: el, anchor: "center" })
          .setLngLat([lng + jitter, lat + jitter])
          .addTo(map);
        markersRef.current[listing.id] = marker;
      });
    });
  }, []);

  const syncAreaLayer = useCallback((bounds: AreaBounds | null | undefined) => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const existing = map.getSource(AREA_SOURCE_ID) as GeoJSONSource | undefined;

    if (!bounds) {
      if (existing) {
        if (map.getLayer(AREA_FILL_LAYER)) map.removeLayer(AREA_FILL_LAYER);
        if (map.getLayer(AREA_OUTLINE_LAYER)) map.removeLayer(AREA_OUTLINE_LAYER);
        map.removeSource(AREA_SOURCE_ID);
      }
      return;
    }

    const geojson = areaGeoJSON(bounds);
    if (existing) {
      existing.setData(geojson);
    } else {
      map.addSource(AREA_SOURCE_ID, { type: "geojson", data: geojson });
      map.addLayer({
        id: AREA_FILL_LAYER,
        type: "fill",
        source: AREA_SOURCE_ID,
        paint: { "fill-color": "#C8553D", "fill-opacity": 0.1 },
      });
      map.addLayer({
        id: AREA_OUTLINE_LAYER,
        type: "line",
        source: AREA_SOURCE_ID,
        paint: { "line-color": "#C8553D", "line-width": 1.5, "line-dasharray": [2, 2] },
      });
    }
  }, []);

  const initMap = useCallback(async () => {
    if (!containerRef.current || mapRef.current) return;
    const ml = await import("maplibre-gl");
    const map = new ml.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: TROJMIASTO_CENTER,
      zoom: 11,
      attributionControl: false,
      // Rotacja wyłączona celowo: rysowanie obszaru zamienia prostokąt
      // zaznaczony na ekranie wprost na prostokąt geograficzny (west/south/
      // east/north) — to poprawne tylko przy mapie "north-up" bez obrotu.
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new ml.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;
    map.on("load", () => {
      loadedRef.current = true;
      syncMarkers();
      syncAreaLayer(areaBounds ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncMarkers, syncAreaLayer]);

  useEffect(() => {
    initMap();
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      loadedRef.current = false;
    };
  }, [initMap]);

  // Piny — resync przy KAŻDEJ zmianie listy (nie tylko przy pierwszym `load`).
  // Bez tego mapa pokazywałaby zawsze pierwszy załadowany zestaw ofert,
  // ignorując filtry zastosowane później.
  useEffect(() => {
    if (loadedRef.current) syncMarkers();
  }, [listings, syncMarkers]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      el.style.transform = id === hoveredId ? "scale(1.15)" : "scale(1)";
      el.style.zIndex = id === hoveredId ? "10" : "1";
    });
  }, [hoveredId]);

  useEffect(() => {
    if (loadedRef.current) syncAreaLayer(areaBounds ?? null);
  }, [areaBounds, syncAreaLayer]);

  // Rysowanie obszaru: podczas przeciągania rysujemy tymczasowy prostokąt w
  // przestrzeni ekranu (zwykły <div>, bez Reacta — zbyt częste update na
  // mousemove), a po puszczeniu przycisku myszy konwertujemy jego rogi na
  // współrzędne geograficzne przez map.unproject() i przekazujemy do rodzica.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !drawingEnabled) return;

    map.dragPan.disable();
    const canvasContainer = map.getCanvasContainer();
    const prevCursor = canvasContainer.style.cursor;
    canvasContainer.style.cursor = "crosshair";

    let start: { x: number; y: number } | null = null;
    let overlay: HTMLDivElement | null = null;

    function getPos(e: MouseEvent) {
      const rect = canvasContainer.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onDown(e: MouseEvent) {
      start = getPos(e);
      overlay = document.createElement("div");
      overlay.style.cssText =
        "position:absolute;border:1.5px dashed #C8553D;background:rgba(200,85,61,.12);pointer-events:none;z-index:5;";
      canvasContainer.appendChild(overlay);
    }

    function onMove(e: MouseEvent) {
      if (!start || !overlay) return;
      const p = getPos(e);
      overlay.style.left = `${Math.min(start.x, p.x)}px`;
      overlay.style.top = `${Math.min(start.y, p.y)}px`;
      overlay.style.width = `${Math.abs(p.x - start.x)}px`;
      overlay.style.height = `${Math.abs(p.y - start.y)}px`;
    }

    function onUp(e: MouseEvent) {
      if (!start) return;
      const p = getPos(e);
      const w = Math.abs(p.x - start.x);
      const h = Math.abs(p.y - start.y);
      if (overlay) { overlay.remove(); overlay = null; }
      // Zbyt mały prostokąt = przypadkowe kliknięcie, nie rysowanie
      if (w > 8 && h > 8 && map) {
        const c1 = map.unproject([start.x, start.y]);
        const c2 = map.unproject([p.x, p.y]);
        const bounds: AreaBounds = [
          Math.min(c1.lng, c2.lng),
          Math.min(c1.lat, c2.lat),
          Math.max(c1.lng, c2.lng),
          Math.max(c1.lat, c2.lat),
        ];
        onDrawComplete?.(bounds);
      }
      start = null;
    }

    canvasContainer.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      map.dragPan.enable();
      canvasContainer.style.cursor = prevCursor;
      canvasContainer.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (overlay) overlay.remove();
    };
  }, [drawingEnabled, onDrawComplete]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} style={{ minHeight: 400 }} />;
}
