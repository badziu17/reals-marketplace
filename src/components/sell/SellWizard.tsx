"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatPrice, computeAvmRange } from "@/lib/domain";
import { generateListingDescription } from "@/lib/sellDescription";
import { compressImageToDataUrl } from "@/lib/imageCompress";

interface DistrictOption {
  code: string;
  name: string;
  city: string;
}
interface DistrictWithFairPrice extends DistrictOption {
  fairPrice?: number;
}

interface MyListing {
  id: string;
  price: number;
  area: number;
  rooms: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  district: { name: string };
}

const GRADIENTS = [
  "#C8553D-#9e3f2c",
  "#5E7A60-#3a4f3c",
  "#B98A2E-#7a5a18",
  "#6E8CA0-#3f5566",
  "#A05C4A-#6b3a2c",
  "#5B7E78-#33504b",
];

const AMENITY_PRESETS = ["balkon", "ogródek", "parking", "winda"] as const;
const MAX_PHOTOS = 6;

interface FormState {
  districtCode: string;
  type: "KUP" | "WYNAJEM";
  market: "PIERWOTNY" | "WTORNY";
  rooms: number | "";
  area: number | "";
  floor: number | "";
  year: number | "";
  price: number | "";
  amenities: string[];
  gradient: string;
  description: string;
  photos: string[];
  floorPlan: string | null;
}

const EMPTY_FORM: FormState = {
  districtCode: "",
  type: "KUP",
  market: "WTORNY",
  rooms: "",
  area: "",
  floor: "",
  year: "",
  price: "",
  amenities: [],
  gradient: GRADIENTS[0],
  description: "",
  photos: [],
  floorPlan: null,
};

function toPayload(f: FormState, publish: boolean) {
  return {
    districtCode: f.districtCode || undefined,
    type: f.type,
    market: f.market,
    rooms: f.rooms === "" ? undefined : Number(f.rooms),
    area: f.area === "" ? undefined : Number(f.area),
    floor: f.floor === "" ? null : Number(f.floor),
    year: f.year === "" ? null : Number(f.year),
    price: f.price === "" ? undefined : Number(f.price),
    amenities: f.amenities,
    gradient: f.gradient,
    description: f.description || undefined,
    photos: f.photos,
    floorPlan: f.floorPlan,
    publish,
  };
}

export function SellWizard() {
  const { data: session, status } = useSession();
  const [districts, setDistricts] = useState<DistrictWithFairPrice[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [customAmenity, setCustomAmenity] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/districts")
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/sell/draft")
      .then((r) => r.json())
      .then((data) => {
        setMyListings(data.myListings ?? []);
        if (data.draft) {
          const d = data.draft;
          setForm({
            districtCode: d.districtCode ?? "",
            type: d.type ?? "KUP",
            market: d.market ?? "WTORNY",
            rooms: d.rooms ?? "",
            area: d.area ?? "",
            floor: d.floor ?? "",
            year: d.year ?? "",
            price: d.price ?? "",
            amenities: d.amenities ?? [],
            gradient: d.gradient ?? GRADIENTS[0],
            description: d.description ?? "",
            photos: d.photos ?? [],
            floorPlan: d.floorPlan ?? null,
          });
        }
      })
      .finally(() => setLoaded(true));
  }, [status]);

  function patch(next: Partial<FormState>) {
    setForm((f) => ({ ...f, ...next }));
  }

  // Auto-save (debounced 600ms) — dopiero po wczytaniu istniejącego draftu
  // (loaded), żeby nie nadpisać go pustym formularzem zanim GET odpowie.
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!loaded || status !== "authenticated") return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setSaving(true);
      fetch("/api/sell/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form, false)),
      })
        .catch(() => {})
        .finally(() => setSaving(false));
    }, 600);
    return () => clearTimeout(saveTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loaded, status]);

  async function handlePhotoFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setPhotoError(null);
    const remaining = MAX_PHOTOS - form.photos.length;
    if (remaining <= 0) {
      setPhotoError(`Możesz dodać maksymalnie ${MAX_PHOTOS} zdjęć.`);
      return;
    }
    const toProcess = Array.from(files).slice(0, remaining);
    setPhotoBusy(true);
    try {
      const compressed = await Promise.all(toProcess.map((f) => compressImageToDataUrl(f)));
      patch({ photos: [...form.photos, ...compressed] });
    } catch {
      setPhotoError("Nie udało się przetworzyć jednego ze zdjęć — spróbuj inny plik.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function removePhoto(index: number) {
    patch({ photos: form.photos.filter((_, i) => i !== index) });
  }

  async function handleFloorPlanFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setPhotoError(null);
    setPlanBusy(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      patch({ floorPlan: dataUrl });
    } catch {
      setPhotoError("Nie udało się przetworzyć pliku rzutu — spróbuj inny plik.");
    } finally {
      setPlanBusy(false);
    }
  }

  function addCustomAmenity() {
    const value = customAmenity.trim().toLowerCase();
    if (!value || form.amenities.includes(value)) {
      setCustomAmenity("");
      return;
    }
    patch({ amenities: [...form.amenities, value] });
    setCustomAmenity("");
  }

  function toggleAmenity(a: string) {
    patch({
      amenities: form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a],
    });
  }

  const done = {
    adres: !!form.districtCode,
    metraz: form.rooms !== "" && form.area !== "" && form.price !== "",
    zdjecia: form.photos.length > 0,
    rzut: !!form.floorPlan,
    opis: form.description.trim().length > 0,
  };
  const doneCount = Object.values(done).filter(Boolean).length;
  const score = Math.round(30 + (doneCount / 5) * 55);
  const tip =
    done.zdjecia && done.rzut && done.opis
      ? "Świetnie! Twoje ogłoszenie jest kompletne i wzbudzi zaufanie."
      : "Dodaj brakujące zdjęcia, rzut i opis, aby przekroczyć 80/100 i trafić wyżej w wynikach.";

  const selectedDistrict = districts.find((d) => d.code === form.districtCode);
  const avm =
    selectedDistrict?.fairPrice && form.area !== "" && form.type === "KUP"
      ? computeAvmRange(selectedDistrict.fairPrice, Number(form.area), "KUP")
      : null;

  function handleGenerateDescription() {
    if (!selectedDistrict || form.rooms === "" || form.area === "") return;
    patch({
      description: generateListingDescription({
        districtName: selectedDistrict.name,
        rooms: Number(form.rooms),
        area: Number(form.area),
        floor: form.floor === "" ? null : Number(form.floor),
        year: form.year === "" ? null : Number(form.year),
        type: form.type,
        market: form.market,
        amenities: form.amenities,
      }),
    });
  }

  const canPublish = done.adres && done.metraz;
  const missingForPublish = [
    !done.adres && "dzielnicę",
    !done.metraz && "pokoje/metraż/cenę",
  ].filter(Boolean) as string[];

  async function publish() {
    if (!canPublish) return;
    setSaving(true);
    setPublishError(null);
    try {
      const res = await fetch("/api/sell/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form, true)),
      });

      if (!res.ok) {
        let message = `Nie udało się opublikować (błąd ${res.status}).`;
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // odpowiedź bez JSON-a — zostaw domyślny komunikat
        }
        setPublishError(message);
        console.error("[Sell] publish failed:", res.status, message);
        return;
      }

      const refreshed = await fetch("/api/sell/draft").then((r) => r.json());
      setMyListings(refreshed.myListings ?? []);
      setForm(EMPTY_FORM);
    } catch (err) {
      setPublishError("Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.");
      console.error("[Sell] publish network error:", err);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-[500px] px-[22px] py-16 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-ink">Wystaw ogłoszenie</h1>
        <p className="mb-5 text-sm text-ink-muted">
          Musisz być zalogowany, żeby dodać ogłoszenie — publikacja jest bezpłatna dla osób prywatnych.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-pill bg-terracotta px-6 py-3 text-sm font-bold text-white"
        >
          Zaloguj się
        </Link>
      </main>
    );
  }

  const [gradFrom, gradTo] = form.gradient.split("-");
  const coverPhoto = form.photos[0] ?? null;

  return (
    <main className="mx-auto max-w-[1100px] px-[22px] py-11">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        {/* --- kolumna formularza --- */}
        <div>
          <h2 className="mb-1.5 font-display text-[30px] font-bold tracking-heading text-ink">Dodaj ogłoszenie</h2>
          <p className="mb-6 text-[15px] text-ink-muted">
            Prowadzimy Cię krok po kroku. Im wyższy wskaźnik jakości, tym więcej zainteresowanych kupujących.
          </p>

          <div className="rounded-card border border-line bg-card p-[22px] shadow-card">
            {/* Podsumowanie kompletności */}
            <div className="mb-1 flex flex-col">
              {(
                [
                  ["adres", "Adres i lokalizacja"],
                  ["metraz", "Metraż i cena"],
                  ["zdjecia", "Zdjęcia"],
                  ["rzut", "Rzut mieszkania"],
                  ["opis", "Opis"],
                ] as const
              ).map(([key, label], i) => {
                const isDone = done[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-line-soft" : ""}`}
                  >
                    <div
                      className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                        isDone ? "bg-bottle text-white" : "bg-chip-warm text-ink-faint"
                      }`}
                    >
                      {isDone ? "✓" : "+"}
                    </div>
                    <div className="text-sm font-bold text-ink">{label}</div>
                    <span className={`ml-auto text-xs font-bold ${isDone ? "text-bottle" : "text-terracotta"}`}>
                      {isDone ? "Gotowe" : "Do zrobienia"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Adres i lokalizacja */}
            <div className="mb-5 border-t border-line-soft pt-5">
              <h3 className="mb-3 text-sm font-bold text-ink">📍 Adres i lokalizacja</h3>
              <div className="flex flex-wrap gap-2.5">
                <select
                  value={form.districtCode}
                  onChange={(e) => patch({ districtCode: e.target.value })}
                  className="rounded-pill border border-line bg-bg-app px-4 py-2.5 text-sm font-semibold text-ink"
                >
                  <option value="">Wybierz dzielnicę…</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-0.5 rounded-pill bg-chip-warm p-[3px]">
                  {(["KUP", "WYNAJEM"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => patch({ type: t })}
                      className={`rounded-pill px-4 py-2 text-sm font-bold ${
                        form.type === t ? "bg-terracotta text-white" : "text-ink-secondary"
                      }`}
                    >
                      {t === "KUP" ? "Sprzedaż" : "Wynajem"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-0.5 rounded-pill bg-chip-warm p-[3px]">
                  {(["WTORNY", "PIERWOTNY"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => patch({ market: m })}
                      className={`rounded-pill px-4 py-2 text-sm font-bold ${
                        form.market === m ? "bg-terracotta text-white" : "text-ink-secondary"
                      }`}
                    >
                      {m === "WTORNY" ? "Wtórny" : "Pierwotny"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Metraż, układ i cena */}
            <div className="mb-5 border-t border-line-soft pt-5">
              <h3 className="mb-3 text-sm font-bold text-ink">📐 Metraż, układ i cena</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <LabeledInput label="Pokoje" value={form.rooms} onChange={(v) => patch({ rooms: v })} />
                <LabeledInput label="Metraż (m²)" value={form.area} onChange={(v) => patch({ area: v })} />
                <LabeledInput label="Piętro" value={form.floor} onChange={(v) => patch({ floor: v })} optional />
                <LabeledInput label="Rok budowy" value={form.year} onChange={(v) => patch({ year: v })} optional />
                <LabeledInput
                  label={form.type === "KUP" ? "Cena (zł)" : "Czynsz (zł/mies.)"}
                  value={form.price}
                  onChange={(v) => patch({ price: v })}
                  span2
                />
              </div>

              <div className="mt-3.5">
                <span className="mb-2 block text-xs font-semibold text-ink-faint">Udogodnienia</span>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_PRESETS.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`rounded-pill border px-3 py-1.5 text-xs font-bold capitalize ${
                        form.amenities.includes(a)
                          ? "border-terracotta bg-terracotta text-white"
                          : "border-line bg-bg-app text-ink-secondary"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                  {/* Udogodnienia spoza presetów (np. "klimatyzacja", "piwnica") */}
                  {form.amenities
                    .filter((a) => !AMENITY_PRESETS.includes(a as (typeof AMENITY_PRESETS)[number]))
                    .map((a) => (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className="flex items-center gap-1.5 rounded-pill border border-terracotta bg-terracotta px-3 py-1.5 text-xs font-bold capitalize text-white"
                      >
                        {a} <span className="text-white/80">✕</span>
                      </button>
                    ))}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <input
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomAmenity();
                      }
                    }}
                    placeholder="Inne udogodnienie (np. klimatyzacja)…"
                    className="flex-1 rounded-pill border border-line bg-bg-app px-3.5 py-2 text-xs text-ink outline-none focus:border-terracotta/60"
                  />
                  <button
                    onClick={addCustomAmenity}
                    disabled={!customAmenity.trim()}
                    className="rounded-pill border border-line bg-bg-app px-3.5 py-2 text-xs font-bold text-ink-secondary disabled:opacity-40"
                  >
                    + Dodaj
                  </button>
                </div>
              </div>
            </div>

            {/* Zdjęcia — prawdziwy upload */}
            <div className="mb-5 border-t border-line-soft pt-5">
              <h3 className="mb-1 text-sm font-bold text-ink">🖼️ Zdjęcia</h3>
              <p className="mb-3 text-xs text-ink-faint">
                Do {MAX_PHOTOS} zdjęć. Bez zewnętrznego hostingu (np. S3) zdjęcia trafiają wprost do bazy jako
                skompresowane pliki — świetne na start, przy większej skali warto podłączyć prawdziwy storage.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {form.photos.map((src, i) => (
                  <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-md border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Zdjęcie ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      aria-label="Usuń zdjęcie"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                    >
                      ✕
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-ink/60 py-0.5 text-center text-[9px] font-bold text-white">
                        okładka
                      </span>
                    )}
                  </div>
                ))}
                {form.photos.length < MAX_PHOTOS && (
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-line text-ink-faint transition hover:border-terracotta hover:text-terracotta">
                    <span className="text-lg leading-none">{photoBusy ? "…" : "+"}</span>
                    <span className="text-[10px] font-semibold">{photoBusy ? "Wgrywam…" : "Dodaj"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={photoBusy}
                      onChange={(e) => {
                        void handlePhotoFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="mt-3">
                <span className="mb-2 block text-xs font-semibold text-ink-faint">
                  Albo motyw okładki (gdy nie masz jeszcze zdjęć)
                </span>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map((g) => {
                    const [from, to] = g.split("-");
                    return (
                      <button
                        key={g}
                        onClick={() => patch({ gradient: g })}
                        className={`h-8 w-8 rounded-full border-2 ${
                          form.gradient === g ? "border-terracotta" : "border-transparent"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                        aria-label={`Motyw ${g}`}
                      />
                    );
                  })}
                </div>
              </div>
              {photoError && <p className="mt-2 text-xs font-semibold text-terracotta">{photoError}</p>}
            </div>

            {/* Rzut mieszkania — prawdziwy upload */}
            <div className="mb-5 border-t border-line-soft pt-5">
              <h3 className="mb-1 text-sm font-bold text-ink">📐 Rzut mieszkania</h3>
              <p className="mb-3 text-xs text-ink-faint">Zdjęcie lub skan planu — zwiększa zaufanie kupujących.</p>
              {form.floorPlan ? (
                <div className="group relative h-24 w-24 overflow-hidden rounded-md border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.floorPlan} alt="Rzut mieszkania" className="h-full w-full object-cover" />
                  <button
                    onClick={() => patch({ floorPlan: null })}
                    aria-label="Usuń rzut"
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-line bg-bg-app px-4 py-2 text-sm font-bold text-ink-secondary transition hover:border-terracotta hover:text-terracotta">
                  {planBusy ? "Wgrywam…" : "+ Dodaj rzut mieszkania"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={planBusy}
                    onChange={(e) => {
                      void handleFloorPlanFile(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            {/* Opis */}
            <div className="border-t border-line-soft pt-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">✍️ Opis</h3>
                <button
                  onClick={handleGenerateDescription}
                  disabled={!done.adres || !done.metraz}
                  className="rounded-pill border border-terracotta/40 bg-bg-app px-3 py-1.5 text-xs font-bold text-terracotta disabled:opacity-40"
                  title="Generator szablonowy — projekt nie ma jeszcze integracji z prawdziwym LLM"
                >
                  ✨ Wygeneruj opis
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                rows={4}
                placeholder="Opisz mieszkanie własnymi słowami albo wygeneruj szkic przyciskiem powyżej."
                className="w-full rounded-md border border-line bg-bg-app p-3 text-sm text-ink outline-none focus:border-terracotta/60"
              />
            </div>

            {/* Publikacja */}
            <div className="mt-[18px] flex flex-col gap-3 border-t border-line-soft pt-[18px] sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="mb-1 text-xs font-bold text-ink-faint">Sugerowana cena (AVM)</div>
                <div className="font-display text-xl font-bold text-bottle">
                  {avm
                    ? `${formatPrice(avm.avmLow ?? 0)} – ${formatPrice(avm.avmHigh ?? 0)} zł`
                    : "wybierz dzielnicę, metraż i typ „Sprzedaż”"}
                </div>
              </div>
              <button
                onClick={publish}
                disabled={!canPublish || saving}
                className="rounded-pill bg-terracotta px-6 py-3.5 text-[14.5px] font-bold text-white transition hover:bg-terracotta-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Zapisywanie…" : "Opublikuj za darmo"}
              </button>
            </div>

            {!canPublish && missingForPublish.length > 0 && (
              <p className="mt-2 text-right text-[11px] text-ink-faint">
                Uzupełnij {missingForPublish.join(" i ")}, żeby opublikować.
              </p>
            )}
            {publishError && (
              <p className="mt-2 text-right text-[12px] font-bold text-terracotta">{publishError}</p>
            )}
            {loaded && saving && !publishError && (
              <div className="mt-2 text-right text-[11px] text-ink-faint">Zapisywanie…</div>
            )}
          </div>
        </div>

        {/* --- kolumna: jakość + podgląd + moje ogłoszenia --- */}
        <div className="flex flex-col gap-[18px]">
          <div className="rounded-card p-6" style={{ background: "#3F5142" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[.5px] text-[#bcd0b8]">Wskaźnik jakości</span>
              <span className="font-display text-[30px] font-bold text-white">
                {score}
                <span className="text-base text-[#9fb39b]">/100</span>
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-pill bg-white/[.16]">
              <div
                className="h-full rounded-pill transition-[width] duration-500"
                style={{ width: `${score}%`, background: "linear-gradient(90deg,#e8b04a,#7fc98a)" }}
              />
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#cdd6c9]">{tip}</p>
          </div>

          <div>
            <div className="mb-2 text-xs font-bold text-ink-faint">Podgląd — tak zobaczy kupujący</div>
            <div className="max-w-[300px] overflow-hidden rounded-card border border-line bg-card shadow-card">
              <div
                className="relative h-[150px]"
                style={
                  coverPhoto
                    ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }
                }
              >
                {avm && (
                  <span className="absolute left-2.5 top-2.5 rounded-pill bg-white px-2.5 py-1 text-[10.5px] font-bold text-bottle">
                    ✓ Wycena AVM
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="font-display text-lg font-bold text-ink">
                  {form.price !== "" ? `${formatPrice(Number(form.price))} zł` : "— zł"}
                </div>
                <div className="mt-0.5 text-sm font-bold text-ink-secondary">
                  {form.rooms || "—"} pok · {form.area || "—"} m² · {selectedDistrict?.name ?? "wybierz dzielnicę"}
                </div>
              </div>
            </div>
          </div>

          {myListings.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-bold text-ink-faint">
                Twoje ogłoszenia {session?.user?.name ? `— ${session.user.name}` : ""}
              </div>
              <div className="flex flex-col gap-2">
                {myListings.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between rounded-md border border-line bg-card px-3.5 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-bold text-ink">{formatPrice(l.price)} zł</div>
                      <div className="text-xs text-ink-faint">
                        {l.rooms} pok · {l.area} m² · {l.district.name}
                      </div>
                    </div>
                    <span
                      className={`rounded-pill px-2.5 py-1 text-[11px] font-bold ${
                        l.status === "PUBLISHED" ? "bg-chip-sage text-bottle" : "bg-chip-warm text-ink-faint"
                      }`}
                    >
                      {l.status === "PUBLISHED" ? "Opublikowane" : l.status === "DRAFT" ? "Szkic" : "Zarchiwizowane"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  optional,
  span2,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  optional?: boolean;
  span2?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${span2 ? "col-span-2 sm:col-span-1" : ""}`}>
      <span className="text-xs font-semibold text-ink-faint">
        {label}
        {optional ? " (opcjonalnie)" : ""}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="rounded-md border border-line bg-bg-app px-3 py-2 text-sm text-ink outline-none focus:border-terracotta/60"
      />
    </label>
  );
}
