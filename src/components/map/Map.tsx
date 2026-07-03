"use client";

import { useEffect, useRef, useCallback } from "react";
import { getVerdict, VERDICT_COLOR } from "@/lib/domain";

type MapLibreMap = import("maplibre-gl").Map;
type Marker = import("maplibre-gl").Marker;

interface ListingPin {
  id: string; price: number; type: string; rooms: number; area: number;
  avmLow: number | null; avmHigh: number | null;
  district: { name: string; lat: number | null; lng: number | null; };
}

interface MapProps {
  listings: ListingPin[];
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  className?: string;
}

const TROJMIASTO_CENTER: [number, number] = [18.57, 54.40];
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

function priceLabel(l: ListingPin): string {
  if (l.type === "WYNAJEM") return `${Math.round(l.price/1000)}k/mies`;
  if (l.price >= 1_000_000) return `${(l.price/1_000_000).toFixed(1)}M`;
  return `${Math.round(l.price/1000)}k`;
}

export function Map({ listings, hoveredId, onHover, onSelect, className }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});

  const initMap = useCallback(async () => {
    if (!containerRef.current || mapRef.current) return;
    const ml = await import("maplibre-gl");
    const map = new ml.Map({ container: containerRef.current, style: MAP_STYLE, center: TROJMIASTO_CENTER, zoom: 11, attributionControl: false });
    map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new ml.AttributionControl({ compact: true }), "bottom-right");
    mapRef.current = map;
    map.on("load", () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      listings.forEach((listing) => {
        const { lat, lng } = listing.district;
        if (!lat || !lng) return;
        const verdict = getVerdict(listing as Parameters<typeof getVerdict>[0]);
        const color = verdict ? VERDICT_COLOR[verdict] : "#33271D";
        const el = document.createElement("div");
        el.style.cssText = `background:${color};color:white;padding:5px 10px;border-radius:999px;font-family:'Hanken Grotesk',sans-serif;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid white;transition:transform 0.15s;user-select:none;`;
        el.textContent = priceLabel(listing);
        el.addEventListener("mouseenter", () => { el.style.transform="scale(1.1)"; onHover?.(listing.id); });
        el.addEventListener("mouseleave", () => { el.style.transform="scale(1)"; onHover?.(null); });
        el.addEventListener("click", () => onSelect?.(listing.id));
        const jitter = (Math.random()-0.5)*0.008;
        const marker = new ml.Marker({ element: el, anchor: "center" }).setLngLat([lng+jitter, lat+jitter]).addTo(map);
        markersRef.current[listing.id] = marker;
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { initMap(); return () => { mapRef.current?.remove(); mapRef.current = null; }; }, [initMap]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      el.style.transform = id === hoveredId ? "scale(1.15)" : "scale(1)";
      el.style.zIndex = id === hoveredId ? "10" : "1";
    });
  }, [hoveredId]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} style={{ minHeight: 400 }} />;
}
