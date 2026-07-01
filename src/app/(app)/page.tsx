// Iteracja 4: pełny Landing — hero, trust strip, pillars, wyróżnione oferty z API

export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
        Iteracja 4
      </span>
      <h1 className="font-display text-hero-h1 tracking-heading text-ink">
        Odkrywaj <span className="text-terracotta">mieszkania</span>
        <br />w Trójmieście
      </h1>
      <p className="max-w-lg text-body-lead text-ink-secondary">
        Jeden adres. Zero duplikatów. Uczciwa cena przy każdej ofercie.
      </p>
      <p className="text-sm text-ink-muted">
        Landing z hero, trust strip i wyróżnionymi ofertami zostanie zbudowany w iteracji 4.
      </p>
    </div>
  );
}
