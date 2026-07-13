"use client";

import { useRef, useState } from "react";

type BizTab = "agencja" | "deweloper";

// Iteracja 12: ekran statyczny (mock dane, zgodnie z kryterium roadmapu) —
// wzorowany 1:1 na design-reference. Przełączanie tabów i modal planów są
// prawdziwie interaktywne; akcje bez backendu (Promuj, Zarządzaj sub.,
// Opublikuj cennik) pokazują toast, tak jak wszędzie indziej w projekcie
// dla funkcji poza aktualnym zakresem.

const KPIS: Record<BizTab, { big: string; label: string; sub: string }[]> = {
  agencja: [
    { big: "24", label: "Aktywne ogłoszenia", sub: "+3 w tym tygodniu" },
    { big: "8 420", label: "Wyświetlenia · 7 dni", sub: "+12% wzgl. średniej" },
    { big: "612", label: "Zapisy do ulubionych", sub: "wysokie zainteresowanie" },
    { big: "18", label: "Nowe leady", sub: "5 czeka na kontakt" },
  ],
  deweloper: [
    { big: "120", label: "Lokali w ofercie", sub: "Osiedle Nadmorskie" },
    { big: "47", label: "Sprzedane", sub: "39% inwestycji" },
    { big: "14", label: "Rezerwacje", sub: "aktywne" },
    { big: "65%", label: "Etap budowy", sub: "stan surowy zamknięty" },
  ],
};

const LEADS = [
  { name: "Anna K.", listing: "3 pok · Wrzeszcz", status: "Nowy", color: "#C8553D", time: "8 min temu" },
  { name: "Marek W.", listing: "2 pok · Przymorze", status: "Kontakt", color: "#B98A2E", time: "1 godz. temu" },
  { name: "Rodzina Nowak", listing: "4 pok · Oliwa", status: "Oglądanie", color: "#3F7A52", time: "wczoraj" },
  { name: "Piotr S.", listing: "2 pok · Sopot", status: "Oferta", color: "#3F5142", time: "2 dni temu" },
  { name: "Julia M.", listing: "1 pok · Śródmieście", status: "Nowy", color: "#C8553D", time: "2 dni temu" },
];

const AG_LISTINGS = [
  { dist: "Gdańsk Wrzeszcz", price: "720 000 zł", views: 1240, saves: 86, leads: 7, quality: 82, promoted: true },
  { dist: "Gdańsk Oliwa", price: "1 649 000 zł", views: 980, saves: 54, leads: 4, quality: 88, promoted: false },
  { dist: "Sopot", price: "1 290 000 zł", views: 1520, saves: 102, leads: 9, quality: 79, promoted: true },
  { dist: "Gdynia Orłowo", price: "1 380 000 zł", views: 640, saves: 33, leads: 2, quality: 74, promoted: false },
];

const FLOORS = ["5 p.", "4 p.", "3 p.", "2 p.", "1 p.", "Parter"];

type UnitStatus = "free" | "rez" | "sold";
const UNIT_STYLE: Record<UnitStatus, { bg: string; bd: string; tx: string }> = {
  free: { bg: "#e7ede4", bd: "#5E7A60", tx: "#3F5142" },
  rez: { bg: "#f5e7cc", bd: "#cf9f3a", tx: "#8a6418" },
  sold: { bg: "#efe7da", bd: "#d8c6b2", tx: "#b3a48c" },
};

function buildUnits() {
  let n = 0;
  let free = 0;
  let rez = 0;
  let sold = 0;
  const rows = FLOORS.map((floor, fi) => ({
    floor,
    cells: Array.from({ length: 8 }, (_, ui) => {
      n++;
      const status: UnitStatus = n % 11 === 0 || n % 11 === 5 ? "rez" : n % 3 === 0 || fi >= 4 ? "sold" : "free";
      if (status === "free") free++;
      else if (status === "rez") rez++;
      else sold++;
      return { num: fi * 8 + ui + 1, status };
    }),
  }));
  return { rows, counts: { free, rez, sold } };
}

const PLANS = [
  { name: "Starter", price: "0 zł/mc", features: ["Do 5 ogłoszeń", "Podstawowe statystyki", "Bez CRM leadów"] },
  {
    name: "Pro",
    price: "1 200 zł/mc",
    features: ["Ogłoszenia bez limitu", "Skrzynka leadów (CRM-lite)", "Promowanie ofert", "Anti-fraud"],
    current: true,
  },
  {
    name: "Enterprise",
    price: "Wycena indywidualna",
    features: ["Wszystko z Pro", "Integracja API", "Opiekun konta", "SLA"],
  },
];

export function BusinessPanel() {
  const [tab, setTab] = useState<BizTab>("agencja");
  const [plansOpen, setPlansOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>();

  function showToast(msg: string) {
    setToast(msg);
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(""), 2400);
  }

  const isAgencja = tab === "agencja";
  const units = buildUnits();

  const identity = isAgencja
    ? {
        letter: "T",
        bg: "#C8553D",
        name: "Trójmiasto Estate",
        verified: "Zweryfikowane biuro · 12 agentów",
        planLabel: "Plan Pro",
        planPrice: "1 200 zł/mc",
      }
    : {
        letter: "I",
        bg: "#3F5142",
        name: "Inpro Deweloper",
        verified: "Zweryfikowany deweloper",
        planLabel: "Pakiet inwestycji",
        planPrice: "2 900 zł/mc",
      };

  return (
    <main className="mx-auto max-w-[1180px] px-[22px] py-[34px] pb-16">
      {/* Header + taby */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[1px] text-terracotta">Panel partnera REALS</div>
          <h2 className="mt-1 font-display text-[30px] font-bold tracking-heading text-ink">
            {isAgencja ? "Panel agencji" : "Panel dewelopera"}
          </h2>
        </div>
        <div className="flex gap-0.5 rounded-pill bg-chip-warm p-1">
          <button
            onClick={() => setTab("agencja")}
            className={`rounded-pill px-[18px] py-2.5 text-sm font-bold transition ${
              isAgencja ? "bg-ink text-white" : "text-ink-secondary"
            }`}
          >
            Agencja
          </button>
          <button
            onClick={() => setTab("deweloper")}
            className={`rounded-pill px-[18px] py-2.5 text-sm font-bold transition ${
              !isAgencja ? "bg-ink text-white" : "text-ink-secondary"
            }`}
          >
            Deweloper
          </button>
        </div>
      </div>

      {/* Pasek tożsamości */}
      <div className="mb-5 flex flex-wrap items-center gap-3.5 rounded-[18px] border border-line bg-card p-4 shadow-card">
        <div
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] font-display text-lg font-extrabold text-white"
          style={{ background: identity.bg }}
        >
          {identity.letter}
        </div>
        <div className="min-w-[170px] flex-1">
          <div className="text-base font-extrabold text-ink">{identity.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-bold text-[#3F7A52]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3F7A52" strokeWidth="2.4">
              <path d="M12 2l2.4 1.7 2.9-.2 1 2.8 2.4 1.6-.6 2.9.9 2.8-2.2 1.9-.3 2.9-2.9.5-1.7 2.4-2.6-1.2-2.6 1.2-1.7-2.4-2.9-.5-.3-2.9-2.2-1.9.9-2.8-.6-2.9 2.4-1.6 1-2.8 2.9.2z" />
              <polyline points="9 12 11.5 14.5 16 9.5" />
            </svg>
            {identity.verified}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11.5px] font-bold text-ink-faint">{identity.planLabel}</div>
          <div className="font-display text-lg font-bold text-ink">{identity.planPrice}</div>
        </div>
        <button
          onClick={() => setPlansOpen(true)}
          className="shrink-0 rounded-pill border border-line bg-card px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition hover:border-terracotta hover:text-terracotta"
        >
          Zarządzaj
        </button>
      </div>

      {/* KPI */}
      <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {KPIS[tab].map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-card p-[18px] shadow-card">
            <div className="font-display text-[28px] font-bold leading-none text-ink">{k.big}</div>
            <div className="mt-2.5 text-[13px] font-bold text-ink-secondary">{k.label}</div>
            <div className="mt-0.5 text-[11.5px] text-ink-faint">{k.sub}</div>
          </div>
        ))}
      </div>

      {isAgencja ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Skrzynka leadów */}
          <div className="rounded-[18px] border border-line bg-card p-5 shadow-card">
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink">Skrzynka leadów</h3>
              <span className="rounded-pill border border-line px-2.5 py-1 font-mono text-[10.5px] text-ink-faint">
                CRM-lite
              </span>
            </div>
            {LEADS.map((l, i) => (
              <button
                key={l.name}
                onClick={() => showToast("Wiadomości pojawią się w iteracji 13 ✨")}
                className={`flex w-full items-center gap-3 py-3.5 text-left transition hover:bg-bg-app ${
                  i ? "border-t border-line-soft" : ""
                }`}
              >
                <div
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-pill text-sm font-extrabold text-white"
                  style={{ background: l.color }}
                >
                  {l.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ink">{l.name}</div>
                  <div className="text-xs text-ink-faint">
                    {l.listing} · {l.time}
                  </div>
                </div>
                <span
                  className="whitespace-nowrap rounded-pill px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: `${l.color}1f`, color: l.color }}
                >
                  {l.status}
                </span>
              </button>
            ))}
          </div>

          {/* Twoje ogłoszenia */}
          <div className="rounded-[18px] border border-line bg-card p-5 shadow-card">
            <h3 className="mb-1.5 font-display text-lg font-bold text-ink">Twoje ogłoszenia</h3>
            {AG_LISTINGS.map((a, i) => (
              <div key={a.dist} className={`py-3.5 ${i ? "border-t border-line-soft" : ""}`}>
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-ink">{a.dist}</div>
                    <div className="font-mono text-xs text-ink-faint">{a.price}</div>
                  </div>
                  <button
                    onClick={() => showToast(a.promoted ? "Ta oferta jest już wyróżniona" : "Promowanie ofert pojawi się wkrótce ✨")}
                    className={`shrink-0 whitespace-nowrap rounded-pill border px-3.5 py-1.5 text-xs font-bold transition ${
                      a.promoted ? "border-[#B98A2E] bg-chip-gold text-[#8a6418]" : "border-line bg-card text-ink-secondary hover:border-terracotta hover:text-terracotta"
                    }`}
                  >
                    {a.promoted ? "★ Wyróżnione" : "Promuj"}
                  </button>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-ink-muted">
                  <span>👁 {a.views}</span>
                  <span>♡ {a.saves}</span>
                  <span>✉ {a.leads} leadów</span>
                  <span
                    className="ml-auto font-bold"
                    style={{ color: a.quality >= 80 ? "#3F7A52" : a.quality >= 70 ? "#B98A2E" : "#C8553D" }}
                  >
                    jakość {a.quality}/100
                  </span>
                </div>
              </div>
            ))}
            <div className="mt-4 flex items-start gap-2 rounded-[14px] border border-[#d6e1d2] bg-chip-sage p-3.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3F5142" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" />
              </svg>
              <div className="text-xs leading-relaxed text-[#3F5142]">
                <b>Anti-fraud aktywny.</b> Każde zdjęcie sprawdzane pod kątem duplikatów i autentyczności (EXIF +
                reverse-image). 0 wykrytych nadużyć.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-[18px] p-[22px]" style={{ background: "#3F5142" }}>
              <div className="text-[12.5px] font-bold uppercase tracking-[.5px] text-[#bcd0b8]">
                Inwestycja · etap budowy
              </div>
              <div className="my-1.5 mb-3.5 font-display text-[22px] font-bold text-white">
                Osiedle Nadmorskie · Gdańsk Oliwa
              </div>
              <div className="h-[9px] overflow-hidden rounded-pill bg-white/[.16]">
                <div
                  className="h-full rounded-pill"
                  style={{ width: "65%", background: "linear-gradient(90deg,#e8b04a,#7fc98a)" }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11.5px] text-[#cdd6c9]">
                <span>Stan surowy zamknięty</span>
                <span className="font-bold">65% · odbiór Q3 2027</span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[18px] border border-line bg-card p-[22px] shadow-card">
              <div>
                <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#3F7A52]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3F7A52" strokeWidth="2.4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Cennik zgodny z ustawą o jawności cen
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">
                  Pełny cennik 120 lokali publikowany automatycznie na stronie inwestycji{" "}
                  <b>i raportowany do dane.gov.pl</b>. Aktualizacja: dziś, 08:14.
                </p>
              </div>
              <button
                onClick={() => showToast("Aktualizacja cennika wysłana do publikacji ✨")}
                className="mt-4 self-start rounded-pill bg-terracotta px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-terracotta-hover"
              >
                Opublikuj aktualizację cennika
              </button>
            </div>
          </div>

          {/* Matryca dostępności */}
          <div className="mt-5 rounded-[18px] border border-line bg-card p-[22px] shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <h3 className="font-display text-lg font-bold text-ink">Matryca dostępności lokali</h3>
              <div className="flex gap-3.5">
                {(
                  [
                    ["Dostępne", units.counts.free, UNIT_STYLE.free.bd],
                    ["Rezerwacja", units.counts.rez, UNIT_STYLE.rez.bd],
                    ["Sprzedane", units.counts.sold, UNIT_STYLE.sold.bd],
                  ] as const
                ).map(([label, n, color]) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs font-bold text-ink-secondary">
                    <span className="h-[11px] w-[11px] rounded" style={{ background: color }} />
                    {label} · {n}
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              {units.rows.map((row) => (
                <div key={row.floor} className="mb-2 flex items-center gap-2">
                  <span className="w-12 shrink-0 font-mono text-[11px] font-bold text-ink-faint">{row.floor}</span>
                  {row.cells.map((cell) => {
                    const s = UNIT_STYLE[cell.status];
                    return (
                      <div
                        key={cell.num}
                        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold"
                        style={{ background: s.bg, border: `1px solid ${s.bd}`, color: s.tx }}
                      >
                        {cell.num}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal planów */}
      {plansOpen && (
        <div onClick={() => setPlansOpen(false)} className="fixed inset-0 z-[70] grid place-items-center bg-ink/55 p-[18px]">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[720px] rounded-card border border-line bg-bg-app p-6 shadow-hero"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-ink">Plany subskrypcji</h3>
              <button onClick={() => setPlansOpen(false)} aria-label="Zamknij" className="text-xl text-ink-muted">
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-[16px] border p-4 ${
                    p.current ? "border-terracotta bg-chip-terracotta/10" : "border-line bg-card"
                  }`}
                >
                  <div className="text-sm font-extrabold text-ink">{p.name}</div>
                  <div className="mt-1 font-display text-lg font-bold text-terracotta">{p.price}</div>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-ink-secondary">
                        <span className="text-bottle">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      if (!p.current) showToast(`Zmiana planu na „${p.name}” — wkrótce ✨`);
                    }}
                    disabled={p.current}
                    className="mt-4 w-full rounded-pill border px-3 py-2 text-xs font-bold transition disabled:cursor-default disabled:opacity-60 border-line bg-bg-app text-ink-secondary hover:border-terracotta hover:text-terracotta disabled:hover:border-line disabled:hover:text-ink-secondary"
                  >
                    {p.current ? "Aktualny plan" : "Wybierz"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-[28px] left-1/2 z-[80] -translate-x-1/2 whitespace-nowrap rounded-md bg-bottle px-5 py-3 text-sm font-semibold text-white shadow-hero animate-rl-pop">
          ✨ {toast}
        </div>
      )}
    </main>
  );
}
