// Iteracja 10: kreator preferencji (4 kroki: dzielnice, budżet, pokoje, must-have)

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-pill bg-chip-warm px-3 py-1 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-muted">
        Iteracja 10
      </span>
      <h1 className="font-display text-section-h2 tracking-heading text-ink">
        Kreator preferencji
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        4 kroki: wybór dzielnic, budżet (slider), liczba pokoi, udogodnienia must-have.
        Wynik zapisywany do konta użytkownika i wpływa na rekomendacje.
      </p>
    </div>
  );
}
