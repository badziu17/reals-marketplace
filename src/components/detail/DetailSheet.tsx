"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "@/components/ui/icons";
import {
  formatPrice,
  getVerdict,
  VERDICT_COLOR,
  VERDICT_LABEL,
  VERDICT_DOT,
  avmGeom,
  monthlyMortgage,
  estimatedRent,
  pcc,
  pricePerM2,
  schoolStars,
} from "@/lib/domain";
import type { Listing } from "@/lib/types";

interface DetailSheetProps {
  listingId: string | null;
  /** Jeśli oferta jest już w pamięci (kliknięto kartę z aktualnej listy), unikamy refetchu. */
  knownListing?: Listing;
  isFaved: boolean;
  onToggleFav: (id: string) => void;
  onClose: () => void;
  onBookViewing: () => void;
  onContact: () => void;
}

function gradientBg(gradient: string | null): string {
  if (!gradient) return "linear-gradient(135deg, #C8553D, #9e3f2c)";
  const [from, to] = gradient.split("-");
  return `linear-gradient(135deg, ${from}, ${to})`;
}

export function DetailSheet({
  listingId,
  knownListing,
  isFaved,
  onToggleFav,
  onClose,
  onBookViewing,
  onContact,
}: DetailSheetProps) {
  const [fetched, setFetched] = useState<Listing | null>(null);
  // Leniwa inicjalizacja: jeśli wchodzimy z linku ?id=... bez knownListing
  // (musimy dociągnąć dane), od razu zakładamy loading=true — inaczej
  // pierwsza klatka (spójna na serwerze i kliencie, więc nie błąd hydratacji,
  // ale widoczny mignięcie) pokazałaby "nie znaleziono" zanim efekt niżej
  // zdąży ustawić loading.
  const [loading, setLoading] = useState(() => !!listingId && !knownListing);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!listingId || knownListing) {
      setFetched(null);
      setNotFound(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/listings/${listingId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not-found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setFetched(data.listing);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId, knownListing]);

  if (!listingId) return null;

  const listing = knownListing ?? fetched;

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div onClick={onClose} className="fixed inset-0 z-[60] flex justify-end bg-ink/50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col overflow-hidden bg-bg-app shadow-hero animate-rl-slide"
        style={{ maxWidth: "min(560px, 100%)" }}
      >
        {loading && !listing ? (
          <div className="flex h-full flex-col">
            <div className="h-[300px] shrink-0 animate-pulse bg-chip-warm" />
            <div className="flex-1 space-y-3 p-6">
              <div className="h-8 w-40 animate-pulse rounded bg-chip-warm" />
              <div className="h-4 w-full animate-pulse rounded bg-chip-warm" />
              <div className="h-32 w-full animate-pulse rounded-card bg-chip-warm" />
            </div>
          </div>
        ) : notFound || !listing ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="text-4xl">🏚️</div>
            <p className="font-semibold text-ink-muted">Nie znaleziono tej oferty.</p>
            <p className="text-sm text-ink-faint">Mogła zostać usunięta albo wycofana z publikacji.</p>
            <button
              onClick={onClose}
              className="mt-2 rounded-pill bg-terracotta px-5 py-2.5 text-sm font-bold text-white"
            >
              Zamknij
            </button>
          </div>
        ) : (
          <DetailContent
            listing={listing}
            isFaved={isFaved}
            onToggleFav={onToggleFav}
            onClose={onClose}
            onBookViewing={onBookViewing}
            onContact={onContact}
            onShare={handleShare}
            copied={copied}
          />
        )}
      </div>
    </div>
  );
}

interface DetailContentProps {
  listing: Listing;
  isFaved: boolean;
  onToggleFav: (id: string) => void;
  onClose: () => void;
  onBookViewing: () => void;
  onContact: () => void;
  onShare: () => void;
  copied: boolean;
}

function DetailContent({
  listing,
  isFaved,
  onToggleFav,
  onClose,
  onBookViewing,
  onContact,
  onShare,
  copied,
}: DetailContentProps) {
  const verdict = getVerdict(listing);
  const geom = avmGeom(listing);
  const ppm2 = pricePerM2(listing.price, listing.area);
  const priceText = `${formatPrice(listing.price)} zł${listing.type === "WYNAJEM" ? "/mc" : ""}`;
  const freshDays = Math.floor((Date.now() - new Date(listing.fresh).getTime()) / 86_400_000);

  const costRows =
    listing.type === "KUP"
      ? [
          {
            label: "Szac. rata kredytu",
            value: `${formatPrice(monthlyMortgage(listing.price))} zł/mc`,
            note: "20% wkładu, 25 lat, ~7,4% RRSO",
          },
          {
            label: "Czynsz administracyjny",
            value: `~${formatPrice(estimatedRent(listing.area))} zł/mc`,
            note: "szacunek wg metrażu",
          },
          {
            label: "PCC (rynek wtórny 2%)",
            value: listing.market === "WTORNY" ? `${formatPrice(pcc(listing.price))} zł` : "0 zł",
            note: "jednorazowo",
          },
          { label: "Taksa notarialna + wpisy", value: "~6 000 zł", note: "jednorazowo" },
        ]
      : [
          { label: "Czynsz najmu", value: `${formatPrice(listing.price)} zł/mc`, note: "do właściciela" },
          {
            label: "Czynsz administracyjny",
            value: `~${formatPrice(estimatedRent(listing.area))} zł/mc`,
            note: "szacunek wg metrażu",
          },
          { label: "Kaucja", value: `${formatPrice(listing.price)} zł`, note: "jednorazowo, zwrotna" },
        ];

  const hood = [
    { icon: "🔇", label: "Poziom hałasu", value: listing.district.noise },
    {
      icon: "🚆",
      label: "Dojazd do centrum",
      value: listing.district.commute ? `${listing.district.commute} min komunikacją` : "brak danych",
    },
    { icon: "🏫", label: "Szkoły w pobliżu", value: schoolStars(listing.district.schools) },
    {
      icon: "🅿️",
      label: "Parking",
      value: listing.amenities.includes("parking") ? "Miejsce w cenie" : "Strefa miejska",
    },
  ];

  const [activePhoto, setActivePhoto] = useState(0);
  const hasPhotos = listing.photos.length > 0;

  return (
    <>
      {/* Hero / galeria — prawdziwe zdjęcia (iteracja 11), gradient jako fallback */}
      <div
        className="relative h-[300px] shrink-0"
        style={
          hasPhotos
            ? {
                backgroundImage: `url(${listing.photos[Math.min(activePhoto, listing.photos.length - 1)]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { background: gradientBg(listing.gradient) }
        }
      >
        <div
          className="absolute inset-0 opacity-[.16]"
          style={{ backgroundImage: "radial-gradient(circle at 75% 15%, #fff 0, transparent 50%)" }}
        />
        <button
          onClick={onClose}
          aria-label="Zamknij"
          className="absolute left-4 top-4 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90 text-[17px] text-ink"
        >
          ✕
        </button>
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => onToggleFav(listing.id)}
            aria-label="Zapisz"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90"
          >
            <IconHeart filled={isFaved} className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={onShare}
            aria-label="Udostępnij"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90 text-[15px]"
          >
            {copied ? "✓" : "↗"}
          </button>
        </div>

        {hasPhotos ? (
          listing.photos.length > 1 && (
            <div className="absolute bottom-3.5 left-4 flex gap-1.5">
              {listing.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Zdjęcie ${i + 1}`}
                  className={`h-1.5 rounded-pill transition-all ${
                    i === activePhoto ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )
        ) : (
          <span className="absolute bottom-3.5 left-4 rounded-pill bg-black/30 px-2.5 py-1 font-mono text-[10px] text-white/85">
            brak zdjęć — okładka
          </span>
        )}
      </div>

      {/* Treść (scrollowalna) */}
      <div className="flex-1 overflow-y-auto px-6 py-[22px] pb-11">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[30px] font-bold tracking-heading text-ink">{priceText}</div>
            <div className="text-[13px] font-semibold text-ink-faint">{formatPrice(ppm2)} zł/m²</div>
          </div>
          <div
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-line bg-card px-3 py-1.5 text-xs font-bold"
            style={{ color: "#B98A2E" }}
          >
            ★ Jakość {listing.quality}/100
          </div>
        </div>

        <div className="mt-2.5 text-[15px] font-bold text-ink-secondary">
          {listing.rooms} pokoje · {listing.area} m² ·{" "}
          {listing.floor === 0 || listing.floor == null ? "parter" : `${listing.floor} piętro`} · {listing.year} ·
          rynek {listing.market === "WTORNY" ? "wtórny" : "pierwotny"}
        </div>
        <div className="mt-1 text-[13.5px] text-ink-faint">
          📍 {listing.district.name} · aktywne {freshDays === 0 ? "dziś" : `${freshDays} dni temu`}
        </div>

        {verdict && geom && (
          <div className="mt-[18px] rounded-card border border-line bg-card p-[17px]">
            <div className="flex items-center gap-1.5 text-[14.5px] font-bold" style={{ color: VERDICT_COLOR[verdict] }}>
              {VERDICT_DOT[verdict]} Czy ta cena jest uczciwa? — {VERDICT_LABEL[verdict]}
            </div>
            <div className="relative mt-3 h-[11px] rounded-pill bg-chip-warm">
              <div
                className="absolute inset-y-0 rounded-pill bg-chip-sage"
                style={{ left: `${geom.left}%`, width: `${geom.width}%` }}
              />
              <div
                className="absolute -top-0.5 h-[15px] w-1 rounded"
                style={{ left: `calc(${geom.mark}% - 2px)`, background: VERDICT_COLOR[verdict] }}
              />
            </div>
            <div className="mt-[7px] flex justify-between font-mono text-[11px] text-ink-faint">
              <span>{formatPrice(listing.avmLow ?? 0)} zł</span>
              <span className="font-bold text-ink-secondary">wycena REALS · pewność 82%</span>
              <span>{formatPrice(listing.avmHigh ?? 0)} zł</span>
            </div>
          </div>
        )}

        {listing.description && (
          <p className="mt-[18px] text-[14px] leading-relaxed text-ink-secondary">{listing.description}</p>
        )}

        <h3 className="mb-2.5 mt-6 font-display text-[19px] font-bold text-ink">Koszt całkowity</h3>
        <div className="overflow-hidden rounded-card border border-line bg-card">
          {costRows.map((r, i) => (
            <div
              key={r.label}
              className={`flex items-center justify-between px-[15px] py-3 ${i ? "border-t border-line-soft" : ""}`}
            >
              <div>
                <div className="text-[13.5px] font-bold text-ink-secondary">{r.label}</div>
                <div className="text-[11px] text-ink-faint">{r.note}</div>
              </div>
              <div className="font-mono text-sm font-bold text-ink">{r.value}</div>
            </div>
          ))}
        </div>

        <h3 className="mb-2.5 mt-6 font-display text-[19px] font-bold text-ink">Wiedza o okolicy</h3>
        <div className="grid grid-cols-2 gap-[9px]">
          {hood.map((h) => (
            <div key={h.label} className="rounded-sm border border-line bg-card px-3.5 py-3">
              <div className="flex items-center gap-1.5 text-bottle">
                <span className="text-[15px]">{h.icon}</span>
                <span className="text-[11.5px] font-bold text-ink-faint">{h.label}</span>
              </div>
              <div className="mt-0.5 text-sm font-bold text-ink">{h.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-[18px] rounded-card border border-[#d6e1d2] bg-chip-sage p-[15px]">
          <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3F5142" strokeWidth="2">
              <polygon points="12 2 22 8.5 12 15 2 8.5" />
              <polyline points="2 15.5 12 22 22 15.5" />
            </svg>
            {listing.sources.length > 1
              ? `To samo mieszkanie w ${listing.sources.length} biurach — scalone w 1 ofertę`
              : "Oferta bezpośrednia — zweryfikowana"}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {listing.sources.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-pill border border-[#d6e1d2] bg-card px-2.5 py-1 text-[11.5px] font-semibold text-ink-secondary"
              >
                <span className="text-bottle">✓</span>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-[22px] flex gap-2.5">
          <button
            onClick={onBookViewing}
            className="flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-terracotta px-3.5 py-3.5 text-[14.5px] font-bold text-white transition hover:bg-terracotta-hover"
          >
            📅 Umów oglądanie
          </button>
          <button
            onClick={onContact}
            className="rounded-[14px] border border-line bg-card px-5 py-3.5 text-[14.5px] font-bold text-ink transition hover:border-terracotta hover:text-terracotta"
          >
            ✉ Napisz
          </button>
        </div>
      </div>
    </>
  );
}
