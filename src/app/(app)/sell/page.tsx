// Iteracja 11: kreator ogłoszenia dla osób prywatnych (bezpłatny)

export default function SellPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
        Iteracja 11
      </span>
      <h1 className="font-display text-section-h2 tracking-heading text-ink">
        Sprzedaj / Wystaw ogłoszenie
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        Kreator ogłoszenia: adres, metraż, zdjęcia, rzut, opis AI. Wskaźnik kompletności
        (0–100). Publikacja bezpłatna dla osób prywatnych.
      </p>
    </div>
  );
}
