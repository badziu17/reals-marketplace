// Powiązane z auth — wymaga zalogowania (middleware).
// Iteracja 6+: zapisane oferty użytkownika (fav z Search/Detail).

export default function SavedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
        Iteracja 6+
      </span>
      <h1 className="font-display text-section-h2 tracking-heading text-ink">
        Zapisane oferty
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        Oferty zapisane przez użytkownika z ekranu Search i Detail.
        Synchronizowane z kontem — dostępne po zalogowaniu.
      </p>
    </div>
  );
}
