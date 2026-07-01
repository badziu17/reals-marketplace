import Link from "next/link";
import { ListingCard } from "@/components/listings/ListingCard";

// Trust strip dane z prototypu
const TRUST_STATS = [
  { big: "0", label: "duplikatów — jedno mieszkanie, jedno ogłoszenie" },
  { big: "100%", label: "ofert z cenami" },
  { big: "100%", label: "zadowolonych użytkowników" },
];

// Pillars dane z prototypu
const PILLARS = [
  {
    icon: "🧭",
    tint: "#f3ddd4",
    title: "Przejrzystość i czytelność",
    body: "To samo mieszkanie z 4 biur scalamy w jedną ofertę. Każda oznaczona datą aktywności — koniec z martwymi linkami.",
  },
  {
    icon: "⚡",
    tint: "#e7ede4",
    title: "Wygoda wyszukiwania",
    body: "Filtry w adresie URL (nigdy się nie resetują), mapa zsynchronizowana z listą, izochrony dojazdu i wyniki w mgnieniu oka.",
  },
  {
    icon: "⚖️",
    tint: "#f5e7cc",
    title: "Przejrzysta cena",
    body: "Przy każdej ofercie pokazujemy, czy cena jest w normie, poniżej czy powyżej rynku — z przedziałem i pewnością.",
  },
];

async function getFeaturedListings() {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/listings?featured=true&limit=6`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.listings ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedListings();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-[22px] py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Lewa kolumna */}
          <div>
            {/* Badge premiera */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-pill bg-chip-terracotta px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-terracotta" />
              <span className="text-sm font-bold text-terracotta-hover">Premiera w Trójmieście</span>
            </div>

            <h1 className="mb-5 font-display text-hero-h1 tracking-heading text-ink">
              Znajdź swoje wymarzone&nbsp;
              <span className="text-terracotta">miejsce</span>.
            </h1>

            <p className="mb-8 max-w-[440px] text-body-lead text-ink-muted">
              Jedno mieszkanie = jedno ogłoszenie. Każda oferta uczciwie wyceniona,
              bez duplikatów i martwych linków. Porównaj, policz koszt i poznaj okolicę
              — zanim się zakochasz.
            </p>

            {/* Search entry */}
            <div className="mb-4 flex max-w-[480px] items-center gap-2.5 rounded-pill border border-line bg-card px-5 py-2 shadow-card">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#b09a86" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <Link href="/search" className="flex-1 py-1 text-sm text-ink-placeholder">
                Gdzie chcesz zamieszkać? np. Gdańsk Oliwa
              </Link>
              <Link
                href="/search"
                className="flex-shrink-0 rounded-pill bg-terracotta px-5 py-2.5 text-sm font-bold text-white transition hover:bg-terracotta-hover"
              >
                Szukaj
              </Link>
            </div>

            {/* Onboarding link */}
            <Link
              href="/onboarding"
              className="inline-block rounded-pill border border-dashed border-[#d8c6b2] px-4 py-2 text-sm font-semibold text-ink-muted transition hover:border-terracotta hover:text-terracotta"
            >
              ✨ Powiedz co jest dla ciebie ważne — dobierzemy oferty
            </Link>
          </div>

          {/* Prawa kolumna — stackowane karty (hero art) */}
          <div className="hidden md:flex md:justify-center">
            <div className="relative h-[380px] w-[340px]">
              {/* Karta w tle */}
              <div
                className="absolute left-0 top-10 h-[300px] w-[230px] rounded-card-lg shadow-hero"
                style={{
                  background: "linear-gradient(135deg, #5E7A60, #3a4f3c)",
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 14px, transparent 14px 28px)",
                  transform: "rotate(-7deg)",
                }}
              />
              {/* Karta z ofertą */}
              <div
                className="absolute right-0 top-0 w-[250px] overflow-hidden rounded-card border border-[#f0e6da] bg-card shadow-hero"
                style={{ transform: "rotate(4deg)" }}
              >
                <div
                  className="relative h-[150px]"
                  style={{
                    background: "linear-gradient(135deg, #C8553D, #9e3f2c)",
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,.08) 0 14px, transparent 14px 28px)",
                  }}
                >
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-pill bg-card px-3 py-1.5 text-xs font-bold text-bottle">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3F5142" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Uczciwa cena
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-display text-card-price tracking-heading text-ink">1 290 000 zł</div>
                  <div className="mt-0.5 text-sm font-bold text-ink-secondary">2 pok · 49 m² · Sopot</div>
                  <div className="mt-3 flex gap-1.5">
                    <span className="rounded-pill bg-chip-sage px-2.5 py-1 text-xs font-semibold text-bottle">🚆 22 min</span>
                    <span className="rounded-pill bg-chip-warm px-2.5 py-1 text-xs font-semibold text-ink-muted">2 dni temu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────── */}
      <section className="bg-bottle">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-8 px-[22px] py-10 md:py-12">
          {TRUST_STATS.map((stat) => (
            <div key={stat.big} className="flex-1 min-w-[160px]">
              <div className="font-display text-trust-number text-white">{stat.big}</div>
              <div className="mt-1.5 text-sm leading-snug text-[#cdd6c9]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PILLARS ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-[22px] py-14">
        <h2 className="mb-1.5 font-display text-section-h2 tracking-heading text-ink">
          Dlaczego REALS
        </h2>
        <p className="mb-7 max-w-[520px] text-sm text-ink-muted">
          Trzy rzeczy, które sprawią, że poczujesz różnicę od pierwszej sekundy.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-[20px] border border-[#f0e6da] bg-card p-6"
              style={{ boxShadow: "0 10px 30px -24px rgba(80,50,40,.5)" }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm text-2xl"
                style={{ background: p.tint, borderRadius: "14px" }}
              >
                {p.icon}
              </div>
              <h3 className="mb-1.5 font-display text-[18.5px] font-bold tracking-heading text-ink">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WYRÓŻNIONE OFERTY ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-[22px] pb-14">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[28px] font-bold tracking-heading text-ink">
              Dla Ciebie w Trójmieście
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Świeże, zweryfikowane oferty z uczciwą wyceną.
            </p>
          </div>
          <Link
            href="/search"
            className="flex-shrink-0 rounded-pill bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-terracotta"
          >
            Zobacz wszystkie →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {featured.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-line bg-card py-16 text-center text-sm text-ink-muted">
            Ładowanie ofert…
          </div>
        )}
      </section>
    </>
  );
}
