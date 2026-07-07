"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { filtersToParams, DEFAULT_FILTERS } from "@/lib/searchFilters";

interface DistrictOption {
  code: string;
  name: string;
  city: string;
}

const ROOM_OPTIONS = [1, 2, 3, 4] as const;
const MUST_OPTIONS: { name: string; icon: string }[] = [
  { name: "balkon", icon: "🌿" },
  { name: "ogródek", icon: "🌳" },
  { name: "parking", icon: "🅿️" },
  { name: "winda", icon: "🛗" },
  { name: "cisza", icon: "🔇" },
];
// Prototyp miał też "blisko centrum" 🚆, ale to wymagałoby filtrowania po
// czasie dojazdu (District.commute jest Stringiem w bazie, nie liczbą —
// niecodzienna operacja porównania na serwerze). Zamiast ciągnąć to na siłę
// przez pół stosu, zostawiamy 5 opcji, które mają w pełni realny efekt.
const AMENITY_MUSTS = ["balkon", "ogródek", "parking", "winda"];

const STEP_TITLES = ["Gdzie szukasz?", "Jaki budżet?", "Ile pokoi?", "Co jest must-have?"];
const STEP_SUBS = [
  "Wybierz dzielnice, które Cię interesują — możesz zaznaczyć kilka.",
  "Pokażemy oferty mieszczące się w Twoich możliwościach.",
  "Zaznacz preferowaną liczbę pokoi.",
  "Wskaż udogodnienia, bez których ani rusz.",
];

function chipClass(active: boolean) {
  return active
    ? "border-terracotta bg-terracotta text-white"
    : "border-line bg-card text-ink-secondary hover:border-terracotta/50";
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [budget, setBudget] = useState(800_000);
  const [rooms, setRooms] = useState<number[]>([]);
  const [musts, setMusts] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/districts")
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts ?? []))
      .catch(() => setDistricts([]));
  }, []);

  function finish() {
    const params = filtersToParams({
      ...DEFAULT_FILTERS,
      priceMax: budget,
      rooms,
      amenities: musts.filter((m) => AMENITY_MUSTS.includes(m)),
      quietOnly: musts.includes("cisza"),
      districts: areas,
    });

    // Zapis trwały (jeśli zalogowany) — celowo nie blokuje przejścia dalej,
    // jeśli się nie uda albo ktoś przechodzi onboarding jako gość.
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ areas, budget, rooms, musts }),
    }).catch(() => {});

    router.push(`/search?${params.toString()}`);
  }

  function next() {
    if (step >= 3) finish();
    else setStep((s) => s + 1);
  }

  const canBack = step > 0;
  const pct = ((step + 1) / 4) * 100;

  return (
    <main className="mx-auto max-w-[620px] px-[22px] pb-[60px] pt-[38px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[1px] text-terracotta">
          Dostrój gust · krok {step + 1} / 4
        </span>
        <button onClick={() => router.push("/search")} className="text-[13px] font-semibold text-ink-faint">
          Pomiń →
        </button>
      </div>
      <div className="mb-[26px] h-1.5 overflow-hidden rounded-pill bg-chip-warm">
        <div
          className="h-full rounded-pill bg-terracotta transition-[width] duration-[400ms]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <h2 className="mb-1.5 font-display text-[28px] font-bold tracking-heading text-ink">{STEP_TITLES[step]}</h2>
      <p className="mb-6 text-[15px] text-ink-muted">{STEP_SUBS[step]}</p>

      <div className="min-h-[200px]">
        {step === 0 &&
          (districts.length === 0 ? (
            <p className="text-sm text-ink-faint">Ładowanie dzielnic…</p>
          ) : (
            <div className="flex flex-wrap gap-[9px]">
              {districts.map((d) => (
                <button
                  key={d.code}
                  onClick={() => setAreas((a) => toggleIn(a, d.code))}
                  className={`rounded-pill border px-[14px] py-2 text-sm font-bold transition ${chipClass(
                    areas.includes(d.code)
                  )}`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          ))}

        {step === 1 && (
          <div className="rounded-[20px] border border-line bg-card p-7">
            <div className="text-center font-display text-[38px] font-bold text-terracotta">
              {budget.toLocaleString("pl-PL")} zł
            </div>
            <input
              type="range"
              min={300_000}
              max={3_000_000}
              step={50_000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-[22px] w-full accent-terracotta"
              aria-label="Budżet"
            />
            <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-faint">
              <span>300 tys.</span>
              <span>3 mln</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2.5">
            {ROOM_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setRooms((r) => toggleIn(r, n))}
                className={`rounded-pill border px-[18px] py-2.5 text-sm font-bold transition ${chipClass(
                  rooms.includes(n)
                )}`}
              >
                {n === 4 ? "4+ pokoje" : `${n} ${n === 1 ? "pokój" : "pokoje"}`}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-[9px]">
            {MUST_OPTIONS.map((m) => (
              <button
                key={m.name}
                onClick={() => setMusts((ms) => toggleIn(ms, m.name))}
                className={`rounded-pill border px-[14px] py-2 text-sm font-bold capitalize transition ${chipClass(
                  musts.includes(m.name)
                )}`}
              >
                {m.icon} {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-[34px] flex gap-3">
        {canBack && (
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-pill border border-line bg-card px-6 py-3.5 text-[14.5px] font-bold text-ink-secondary"
          >
            Wstecz
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={next}
          className="rounded-pill bg-terracotta px-[30px] py-3.5 text-[14.5px] font-bold text-white transition hover:bg-terracotta-hover"
        >
          {step >= 3 ? "Gotowe, pokaż oferty" : "Dalej"}
        </button>
      </div>
    </main>
  );
}
