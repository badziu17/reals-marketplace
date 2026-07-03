"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { formatPrice } from "@/lib/domain";

const Map = dynamic(() => import("./Map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] w-full items-center justify-center rounded-card bg-chip-warm text-sm text-ink-muted">
      Ładowanie mapy…
    </div>
  ),
});

interface Listing {
  id: string;
  price: number;
  type: string;
  rooms: number;
  area: number;
  avmLow: number | null;
  avmHigh: number | null;
  district: { name: string; lat: number | null; lng: number | null; commute: string | null; };
}

export function MapPreview({ listings }: { listings: Listing[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = listings.find((l) => l.id === selectedId);
  return (
    <div className="relative overflow-hidden rounded-card border border-line shadow-card">
      <Map listings={listings} hoveredId={hoveredId} onHover={setHoveredId} onSelect={setSelectedId} className="h-[560px] w-full" />
      {selected && (
        <div className="absolute bottom-4 left-4 z-10 w-64 rounded-card bg-card p-4 shadow-hero animate-rl-pop">
          <button onClick={() => setSelectedId(null)} className="absolute right-3 top-3 text-ink-muted hover:text-ink">✕</button>
          <div className="font-display text-lg font-bold tracking-heading text-ink">{formatPrice(selected.price)} {selected.type === "WYNAJEM" ? "zł/mies." : "zł"}</div>
          <div className="mt-1 text-sm font-semibold text-ink-secondary">{selected.rooms} pok · {selected.area} m²</div>
          <div className="mt-1 text-sm text-ink-muted">{selected.district.name}</div>
          {selected.district.commute && (<div className="mt-2 inline-block rounded-pill bg-chip-sage px-2.5 py-1 text-xs font-semibold text-bottle">🚆 {selected.district.commute} min</div>)}
        </div>
      )}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 rounded-card bg-card/90 p-3 text-xs font-semibold backdrop-blur-sm">
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#2E7D4F]" /> Poniżej rynku</div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#3F5142]" /> Uczciwa cena</div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#C8553D]" /> Powyżej rynku</div>
      </div>
    </div>
  );
}
