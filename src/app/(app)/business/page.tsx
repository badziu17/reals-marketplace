// Iteracja 12: oferta dla agencji i deweloperów (model subskrypcyjny)

export default function BusinessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
        Iteracja 12
      </span>
      <h1 className="font-display text-section-h2 tracking-heading text-ink">
        Dla biznesu
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        Taby Agencja / Deweloper. Plany subskrypcji, korzyści z deduplikacji,
        promowanie ofert, publikacja cenników (ustawa o jawności cen).
      </p>
    </div>
  );
}
