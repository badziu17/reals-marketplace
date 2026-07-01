// Iteracja 6: filtry + lista kart z AVM
// Iteracja 7: split widok z mapą MapLibre + responsywność mobile

export default function SearchPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
        Iteracja 6–7
      </span>
      <h1 className="font-display text-section-h2 tracking-heading text-ink">
        Wyszukiwarka
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        Filtry (typ, cena, pokoje, metraż, rynek, AVM), lista kart ofert zsynchronizowana
        z mapą MapLibre, hover pin↔karta, rysowanie obszaru, mobile lista/mapa toggle.
      </p>
    </div>
  );
}
