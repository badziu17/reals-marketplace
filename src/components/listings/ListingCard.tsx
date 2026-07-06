"use client";

import Link from "next/link";
import { IconHeart } from "@/components/ui/icons";
import { formatPrice, getVerdict, VERDICT_LABEL, VERDICT_COLOR } from "@/lib/domain";

interface ListingCardProps {
  listing: {
    id: string;
    rooms: number;
    area: number;
    price: number;
    type: string;
    market: string;
    amenities: string[];
    sources: string[];
    avmLow: number | null;
    avmHigh: number | null;
    fresh: string;
    gradient: string | null;
    quality: number;
    district: {
      name: string;
      commute: string | null;
      noise: string | null;
      schools: number | null;
    };
  };
  onFav?: (id: string) => void;
  isFaved?: boolean;
  onCompare?: (id: string) => void;
  isCompared?: boolean;
}

// Gradient jako CSS background
function gradientBg(gradient: string | null): string {
  if (!gradient) return "linear-gradient(135deg, #C8553D, #9e3f2c)";
  const [from, to] = gradient.split("-");
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// Świeżość oferty
function freshLabel(fresh: string): string {
  const days = Math.floor((Date.now() - new Date(fresh).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Dziś";
  if (days === 1) return "1 dzień temu";
  if (days < 5) return `${days} dni temu`;
  return `${days} dni temu`;
}

export function ListingCard({ listing, onFav, isFaved, onCompare, isCompared }: ListingCardProps) {
  const verdict = getVerdict(listing as unknown as Parameters<typeof getVerdict>[0]);
  const priceLabel = listing.type === "WYNAJEM"
    ? `${formatPrice(listing.price)} zł/mies.`
    : `${formatPrice(listing.price)} zł`;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card bg-card shadow-card transition hover:shadow-hero animate-rl-fade">
      {/* Zdjęcie / gradient placeholder */}
      <div
        className="relative h-44 w-full"
        style={{ background: gradientBg(listing.gradient) }}
      >
        {/* Tekstura */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 14px, transparent 14px 28px)",
          }}
        />

        {/* Badge werdyktu AVM */}
        {verdict && (
          <span
            className="absolute left-3 top-3 flex items-center gap-1.5 rounded-pill bg-card px-3 py-1.5 text-xs font-bold"
            style={{ color: VERDICT_COLOR[verdict] }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: VERDICT_COLOR[verdict] }} />
            {VERDICT_LABEL[verdict]}
          </span>
        )}

        {/* Serce (fav) */}
        {onFav && (
          <button
            onClick={(e) => { e.preventDefault(); onFav(listing.id); }}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-ink-muted transition hover:text-terracotta"
          >
            <IconHeart filled={isFaved} className="h-4 w-4" />
          </button>
        )}

        {/* Liczba źródeł (deduplikacja) */}
        {listing.sources.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-pill bg-ink/70 px-2 py-0.5 font-mono text-badge-mono text-white">
            {listing.sources.length} biura
          </span>
        )}
      </div>

      {/* Treść karty */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="font-display text-card-price tracking-heading text-ink">
          {priceLabel}
        </div>

        <div className="text-sm font-semibold text-ink-secondary">
          {listing.rooms} pok · {listing.area} m² · {listing.district.name}
        </div>

        {/* Tagi */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {listing.district.commute && (
            <span className="rounded-pill bg-chip-sage px-2.5 py-1 text-xs font-semibold text-bottle">
              🚆 {listing.district.commute} min
            </span>
          )}
          <span className="rounded-pill bg-chip-warm px-2.5 py-1 text-xs font-semibold text-ink-muted">
            {freshLabel(listing.fresh)}
          </span>
          {listing.market === "PIERWOTNY" && (
            <span className="rounded-pill bg-chip-gold px-2.5 py-1 text-xs font-semibold text-ink-secondary">
              Pierwotny
            </span>
          )}
        </div>

        {onCompare && (
          <button
            onClick={(e) => { e.preventDefault(); onCompare(listing.id); }}
            className={`relative z-10 mt-1 self-start rounded-pill px-2.5 py-1 text-xs font-bold transition ${
              isCompared
                ? "bg-terracotta text-white"
                : "border border-line bg-card text-ink-muted hover:border-terracotta/50"
            }`}
          >
            {isCompared ? "✓ W porównaniu" : "+ Porównaj"}
          </button>
        )}
      </div>

      {/* Cały kafel jest linkiem do detalu (iteracja 8) */}
      <Link href={`/search?id=${listing.id}`} className="absolute inset-0 z-0" aria-label={`Oferta: ${listing.district.name}`} />
    </div>
  );
}
