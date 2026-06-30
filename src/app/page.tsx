/**
 * Faza 0 placeholder. Ten ekran nie jest finalnym Landingiem (patrz iteracja 4
 * w roadmapie) — służy wyłącznie do wizualnej weryfikacji, że tokeny Tailwind
 * (kolory, fonty, radius, cienie) z README zostały poprawnie podłączone.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-space-6 px-space-7 py-space-9">
      <span className="rounded-pill border border-line bg-chip-warm px-space-4 py-space-2 font-mono text-badge-mono uppercase tracking-[0.5px] text-ink-secondary">
        Trójmiasto
      </span>

      <h1 className="text-hero-h1">
        REALS — fundament <span className="text-terracotta">projektu</span> gotowy
      </h1>

      <p className="text-body-lead text-ink-secondary">
        Faza 0: Next.js, Tailwind z tokenami z README oraz fonty (Bricolage Grotesque,
        Hanken Grotesk, Space Mono) są podłączone. Kolejne iteracje dobudują realne ekrany.
      </p>

      <div className="flex flex-wrap gap-space-4">
        <button className="rounded-pill bg-terracotta px-space-7 py-space-4 font-sans text-sm font-700 text-white shadow-card transition hover:bg-terracotta-hover">
          Przycisk primary (terakota)
        </button>
        <button className="rounded-pill border border-line bg-card px-space-7 py-space-4 font-sans text-sm font-700 text-ink-secondary transition hover:border-terracotta hover:text-terracotta">
          Przycisk secondary
        </button>
      </div>

      <div className="grid w-full grid-cols-3 gap-space-5 rounded-card bg-bottle p-space-7 text-white">
        <div>
          <div className="font-display text-trust-number">0</div>
          <div className="text-sm text-[#cdd6c9]">duplikatów</div>
        </div>
        <div>
          <div className="font-display text-trust-number">100%</div>
          <div className="text-sm text-[#cdd6c9]">ofert z cenami</div>
        </div>
        <div>
          <div className="font-display text-trust-number">100%</div>
          <div className="text-sm text-[#cdd6c9]">zadowolonych</div>
        </div>
      </div>
    </main>
  );
}
