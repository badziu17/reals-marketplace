import { MapPreview } from "@/components/map/MapPreview";

async function getListings() {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/listings?limit=21`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.listings ?? [];
  } catch {
    return [];
  }
}

export default async function SearchPage() {
  const listings = await getListings();
  return (
    <div className="mx-auto max-w-7xl px-[22px] py-8">
      <div className="mb-6">
        <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
          Iteracja 5 — MapLibre
        </span>
        <h1 className="mt-3 font-display text-section-h2 tracking-heading text-ink">
          Mapa Trójmiasta
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {listings.length} ofert na mapie · pinezki kolorowane werdyktem AVM
        </p>
      </div>
      <MapPreview listings={listings} />
    </div>
  );
}
